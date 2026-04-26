# professional-skills-for-engineers
HCMUT - Professional Skills for Engineers (MySQL + Next.js + FastAPI)


How to set up:

Frontend: `cd frontend` then `npm install` (or `npm install --legacy-peer-deps` if React 19 and vaul are incompatible) then `npm run dev`

Backend: 
1. `cd backend`
2. Create virtual environment: `python -m venv venv`
3. Activate virtual environment:
   - Windows: `venv\Scripts\activate`
   - Bash/Unix: `source venv/bin/activate`
4. Install dependencies: `pip install -r requirements.txt`
5. Run application: `uvicorn main:app --reload`

structure of .env for backend:
DB_USER=your_username
DB_PASS=your_password
DB_HOST=your_host
DB_NAME=your_database_name
DB_PORT=your_port

Database (using bash to run - only first time): `cd database` then `mysql -u your_username -p < run_all_mysql.sql` 

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
│   └── .env                # Environment variables
│
├── database/               # MySQL scripts
│   ├── procedure/          # Stored procedures
│   ├── function/           # SQL functions
│   ├── trigger/            # Database triggers
│   └── run_all_mysql.sql   # Setup script
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
