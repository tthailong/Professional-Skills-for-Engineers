# professional-skills-for-engineers
HCMUT - Professional Skills for Engineers (MySQL + Next.js + FastAPI)


How to set up:

#### Frontend: 
- `cd frontend`
- `npm install` (first time only), or `npm install --legacy-peer-deps` if React 19 and vaul are incompatible 
- `npm run dev`

#### Backend: 
- `cd backend`
- Create virtual environment: `python -m venv venv` (first time only)
- Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Bash/Unix: `source venv/bin/activate`
- Install dependencies: `pip install -r requirements.txt` (first time only)
- Run application: `uvicorn main:app --reload`

Structure of `.env` for backend:
```text
DB_USER=your_username
DB_PASS=your_password
DB_HOST=your_host (ex: localhost)
DB_NAME=your_database_name (ex: db_assignment)
DB_PORT=your_port (ex: 3306)
APP_ID=merchant_app_id
KEY1=mac_key (to zalopay)
KEY2=callback_key (from zalopay)
```

#### Database (using Git Bash to run - first time only)
- `cd database`
- `mysql -u your_username -p < run_all_mysql.sql` 

## Project Structure

```text
.
├── backend/                # FastAPI application
│   ├── admin_regular_routes/
│   ├── admin_routes/
│   ├── routes/             # API routes
│   ├── main.py             # Entry point
│   ├── database.py         # Database connection
│   ├── model.py            # Data models
│   └── .env                # Environment variables (add your .env here)
│
├── database/               # MySQL scripts
│   ├── all/                # Database entities
│   ├── function/           # Database functions
│   ├── procedure/          # Database stored procedures
│   ├── trigger/            # Database triggers
│   ├── run_all_mysql.sql   # Setup script
│   └── testprocedure.sql   # Mock data
│
├── frontend/               # Next.js application
│   ├── app/                # App router pages
│   ├── components/         # React components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility libraries
│   └── store/              # State management
│
├── README.md               # You are here
├── .gitignore              # Git ignore rules
```
