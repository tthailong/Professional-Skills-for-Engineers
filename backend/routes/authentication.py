from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session
from typing import Optional, List
from sqlalchemy import text
from database import get_session # Assuming this is correctly configured

# Create a new router for authentication endpoints
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)

# --- Pydantic Models for Requests and Responses ---

class LoginRequest(BaseModel):
    """Model for customer and admin login requests."""
    email: EmailStr
    password: str

class CustomerRegisterRequest(BaseModel):
    """Model for customer registration request."""
    fname: str = Field(..., max_length=50)
    lname: str = Field(..., max_length=50)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    email: EmailStr
    dob: str = Field(..., description="Date of birth in DD/MM/YYYY format")
    loyalpoint: Optional[int] = 0
    phone: Optional[str] = None
    password: str = Field(..., min_length=8)

# Change password
# Add this new model to your auth_router file:

class ChangePasswordRequest(BaseModel):
    """Model for changing a password."""
    # Note: Assumes the calling application knows the ID of the logged-in user/admin
    id: int = Field(..., description="Customer_id or Admin_id")
    old_password: str
    new_password: str

class MessageOut(BaseModel):
    """Simple model for success messages."""
    message: str

# Simplified output models based on the SQL procedure results
class CustomerOut(BaseModel):
    Customer_id: int
    FName: str
    LName: str
    Gender: str
    Email: str
    Date_of_birth: str
    Membership_id: int
    Loyal_point: int
    Phone: Optional[str]

class AdminOut(BaseModel):
    Admin_id: int
    Name: str
    Gender: str
    Date_of_birth: str
    Email: str
    Phone: Optional[str]
    Branch_id: Optional[int]
    Branch_Name: Optional[str]
    Admin_Manager_id: Optional[int] = None
    Role: str

class AdminRegisterRequest(BaseModel):
    """Model for admin registration request."""
    name: str
    email: EmailStr
    password: str
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    dob: str = Field(..., description="YYYY-MM-DD")
    phone: Optional[str] = None
    branch_id: Optional[int] = None
    role: str = Field(..., pattern="^(primary|regular)$")

# --- Endpoints ---

# --- Updated Code for /customer/register ---

@router.post("/customer/register", response_model=CustomerOut)
def customer_register(
  data: CustomerRegisterRequest,
  session: Session = Depends(get_session)
):
    try:
        register_proc = text("CALL create_customer(:fname, :lname, :gender, :email, :dob, :loyalpoint, :phone, :password)")
        
        params = {
            "fname": data.fname, "lname": data.lname, "gender": data.gender, 
            "email": data.email, "dob": data.dob, 
            "loyalpoint": 0, "phone": data.phone, "password": data.password
        }

        # 1. Execute the procedure
        session.exec(register_proc, params=params)
        
        # The procedure does not return rows, so we skip fetching from 'result'
        customer_data = None
        
        # fallback: query by email if procedure didn't return the row
        if not customer_data:
            # try to find the row by email (or by LAST_INSERT_ID if your driver/session preserves it)
            fallback_q = text("""
            SELECT
        C.Customer_id as Customer_id,
        C.FName as FName,
        C.LName as LName,
        C.Gender as Gender,
        C.Email as Email,
        -- Use MAX(CP.Phone_number) to return a single phone number if multiple exist.
        -- If no phone number exists, this will return NULL.
        MAX(CP.CPhone) AS Phone,
        DATE_FORMAT(C.Date_of_birth, '%d/%m/%Y') AS Date_of_birth,
        C.Membership_id as Membership_id,
        C.Loyal_point as Loyal_point
    FROM Customer C
    LEFT JOIN CustomerPhone CP ON C.Customer_id = CP.Customer_id
    WHERE C.Email = :email
    GROUP BY 
        C.Customer_id, C.FName, C.LName, C.Gender, C.Email, 
        C.Date_of_birth, C.Membership_id, C.Loyal_point;
            """)
            fallback = session.exec(fallback_q, params={"email": params["email"]}).mappings().first()
            if fallback:
                # commit and return fallback
                session.commit()
                return fallback
                    
        session.commit()
        return customer_data

    except Exception as e:
        # Your error handling remains the same for exceptions signalled by the DB (e.g., duplicate email)
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=400, detail=detail)

@router.post("/customer/login", response_model=CustomerOut)
def customer_login(
    data: LoginRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate a customer and return their details using the updated login_customer procedure.
    """
    try:
        login_proc = text("CALL login_customer(:email, :password)")
        
        params = {
            "email": data.email,
            "password": data.password
        }
        
        result = session.exec(login_proc, params=params)
        customer_data = result.mappings().first()
        
        if not customer_data:
            # Should be caught by the SQL SIGNAL, but kept as a safeguard
            raise HTTPException(status_code=401, detail="Invalid email or password.")
            
        return customer_data

    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=401, detail=detail)

@router.post("/admin/login", response_model=AdminOut)
def admin_login(
    data: LoginRequest,
    session: Session = Depends(get_session)
):
    """
    Authenticate an Admin and return their details using the updated login_admin procedure.
    """
    try:
        login_proc = text("CALL login_admin(:email, :password)")
        
        params = {
            "email": data.email,
            "password": data.password
        }
        
        result = session.exec(login_proc, params=params)
        admin_data = result.mappings().first()
        
        if not admin_data:
            # Should be caught by the SQL SIGNAL, but kept as a safeguard
            raise HTTPException(status_code=401, detail="Invalid email or password.")
            
        return admin_data

    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=401, detail=detail)

@router.get("/admin/all", response_model=List[AdminOut])
def get_all_admins(session: Session = Depends(get_session)):
    """
    Fetch all administrators.
    """
    try:
        proc = text("CALL get_all_admins()")
        result = session.exec(proc).mappings().all()
        return result
    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=400, detail=detail)

@router.post("/admin/register", response_model=AdminOut)
def register_admin(
    data: AdminRegisterRequest,
    session: Session = Depends(get_session)
):
    """
    Register a new admin.
    """
    try:
        proc = text("CALL create_admin(:name, :email, :password, :gender, :dob, :phone, :branch_id, :role)")
        
        params = {
            "name": data.name,
            "email": data.email,
            "password": data.password,
            "gender": data.gender,
            "dob": data.dob,
            "phone": data.phone,
            "branch_id": data.branch_id,
            "role": data.role
        }
        
        result = session.exec(proc, params=params).mappings().first()
        session.commit()
        return result

    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=400, detail=detail)
    
# Add these endpoints to your auth_router:

@router.post("/customer/change-password", response_model=MessageOut)
def customer_change_password(
    data: ChangePasswordRequest,
    session: Session = Depends(get_session)
):
    """
    Changes the customer's password after verifying the old password.
    """
    try:
        proc = text("CALL change_customer_password(:id, :old_password, :new_password)")
        
        params = {
            "id": data.id,
            "old_password": data.old_password,
            "new_password": data.new_password
        }
        
        # Execute the procedure
        result = session.exec(proc, params=params)
        
        # The procedure returns a success message on success
        message_data = result.mappings().first()
        
        session.commit()
        return message_data if message_data else {"message": "Password updated successfully."}

    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        # Use 400 for bad requests (invalid old password, weak new password)
        raise HTTPException(status_code=400, detail=detail)


class UpdateCustomerProfileRequest(BaseModel):
    """Model for updating customer profile."""
    id: int
    fname: str = Field(..., max_length=50)
    lname: str = Field(..., max_length=50)
    gender: str = Field(..., pattern="^(Male|Female|Other)$")
    email: EmailStr
    dob: str = Field(..., description="Date of birth in DD/MM/YYYY format")
    phone: Optional[str] = None


@router.put("/customer/update", response_model=CustomerOut)
def update_customer_profile(
    data: UpdateCustomerProfileRequest,
    session: Session = Depends(get_session)
):
    """
    Updates the customer's profile information (name, gender, email, dob, phone).
    Note: Membership and loyalty points cannot be changed by the customer.
    """
    try:
        # Call update_customer procedure
        # Parameters: customer_id, fname, lname, gender, email, dob, memid, loyalpoint, phone
        # We pass NULL for memid and loyalpoint since customer shouldn't change these
        proc = text("""
            CALL update_customer(
                :customer_id, :fname, :lname, :gender, :email, :dob, 
                NULL, NULL, :phone
            )
        """)
        
        params = {
            "customer_id": data.id,
            "fname": data.fname,
            "lname": data.lname,
            "gender": data.gender,
            "email": data.email,
            "dob": data.dob,
            "phone": data.phone
        }
        
        # Execute the procedure
        session.exec(proc, params=params)
        session.commit()
        
        # Fetch updated customer data
        query = text("""
            SELECT
                C.Customer_id as Customer_id,
                C.FName as FName,
                C.LName as LName,
                C.Gender as Gender,
                C.Email as Email,
                MAX(CP.CPhone) AS Phone,
                DATE_FORMAT(C.Date_of_birth, '%d/%m/%Y') AS Date_of_birth,
                C.Membership_id as Membership_id,
                C.Loyal_point as Loyal_point
            FROM Customer C
            LEFT JOIN CustomerPhone CP ON C.Customer_id = CP.Customer_id
            WHERE C.Customer_id = :customer_id
            GROUP BY 
                C.Customer_id, C.FName, C.LName, C.Gender, C.Email, 
                C.Date_of_birth, C.Membership_id, C.Loyal_point
        """)
        
        result = session.exec(query, params={"customer_id": data.id}).mappings().first()
        
        if not result:
            raise HTTPException(status_code=404, detail="Customer not found after update")
        
        return result

    except HTTPException:
        raise
    except Exception as e:
        session.rollback()
        detail = str(e).split('ERROR: ')[-1] if 'ERROR: ' in str(e) else str(e)
        raise HTTPException(status_code=400, detail=detail)



@router.post("/admin/change-password", response_model=MessageOut)
def admin_change_password(
    data: ChangePasswordRequest,
    session: Session = Depends(get_session)
):
    """
    Changes the admin's password after verifying the old password.
    """
    try:
        proc = text("CALL change_admin_password(:id, :old_password, :new_password)")
        
        params = {
            "id": data.id,
            "old_password": data.old_password,
            "new_password": data.new_password
        }
        
        # Execute the procedure
        result = session.exec(proc, params=params)
        
        # The procedure returns a success message on success
        message_data = result.mappings().first()
        
        session.commit()
        return message_data if message_data else {"message": "Password updated successfully."}

    except Exception as e:
        # Use 400 for bad requests (invalid old password, weak new password)
        raise HTTPException(status_code=400, detail=detail)

class UpdateAdminProfileRequest(BaseModel):
    """Model for updating admin profile."""
    id: int
    name: str
    gender: str
    dob: str = Field(..., description="YYYY-MM-DD")
    email: EmailStr
    branch_id: Optional[int] = None
    phone: Optional[str] = Field(None, pattern=r"^\d{10}$", description="10-digit phone number")

@router.put("/admin/update", response_model=MessageOut)
def update_admin_profile(
    data: UpdateAdminProfileRequest,
    session: Session = Depends(get_session)
):
    """
    Updates the admin's profile information.
    """
    try:
        proc = text("CALL update_admin_profile(:id, :name, :gender, :dob, :email, :branch_id, :phone)")
        
        params = {
            "id": data.id,
            "name": data.name,
            "gender": data.gender,
            "dob": data.dob,
            "email": data.email,
            "branch_id": data.branch_id,
            "phone": data.phone
        }
        
        # Execute the procedure
        result = session.exec(proc, params=params)
        
        # The procedure returns a success message on success
        message_data = result.mappings().first()
        
        session.commit()
        return message_data if message_data else {"message": "Profile updated successfully."}

    except Exception as e:
        detail = str(e).split('ERROR: ')[-1]
        raise HTTPException(status_code=400, detail=detail)