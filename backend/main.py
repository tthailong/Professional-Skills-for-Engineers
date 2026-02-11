# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from routes.movies import router as movies_router
from routes.events import router as event_router
from routes.branches import router as branch_router
from routes.book_ticket import router as booking_ticket
from routes.voucher import router as voucher
from routes.membership import router as membership
from admin_routes.admin_movies import router as admin_movies_router
from admin_routes.admin_events import router as admin_events_router
from admin_routes.admin_voucher import router as admin_voucher_router
from admin_routes.admin_product import router as admin_product_router
from admin_routes.admin_bookings import router as admin_bookings_router
from routes.authentication import router as authentication_router
from admin_regular_routes.admin_regular_movies import router as admin_regular_movies_router
from admin_regular_routes.admin_regular_showtime import router as admin_regular_showtimes_router
from routes.receipt import router as receipt_router
from admin_routes.dashboard import router as dashboard_router
from routes.votemood import router as votemood_router

app = FastAPI()
origins = [
    "http://localhost:5173",   # your frontend
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,     # or ["*"] for testing
    allow_credentials=True,
    allow_methods=["*"],       # VERY IMPORTANT
    allow_headers=["*"],
)
# router cho customer
app.include_router(movies_router)
app.include_router(event_router)
app.include_router(branch_router)
app.include_router(booking_ticket)
app.include_router(authentication_router)
app.include_router(voucher)
app.include_router(membership)
app.include_router(receipt_router)
app.include_router(votemood_router)


# router cho admin
app.include_router(admin_movies_router)
app.include_router(admin_events_router)
app.include_router(admin_voucher_router)
app.include_router(admin_product_router)

# router cho primary admin
app.include_router(admin_regular_movies_router)
app.include_router(admin_bookings_router)
app.include_router(admin_regular_showtimes_router)
app.include_router(dashboard_router)
