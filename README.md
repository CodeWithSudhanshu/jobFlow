🚀 JobFlow — Career Command Center
<div align="center">
Track applications. Manage opportunities. Own your career.

A modern full-stack Job Application Management Platform built to help developers organize their job search, manage applications, track progress, and analyze resumes.

<br>






<br>












</div>
✨ Why JobFlow?

Job hunting becomes messy very quickly.

Applications get scattered across spreadsheets, browser tabs, emails, notes and bookmarks.

JobFlow brings everything into one place.

Instead of asking:

"Where did I apply?"

JobFlow helps answer:

What did I apply for? What is the current status? What's next?

🎯 Core Features
<table> <tr> <td width="50%">
🔐 Authentication
Secure user registration
Login system
JWT-based authentication
Protected API routes
Persistent login sessions
</td> <td width="50%">
💼 Job Tracking
Add job applications
View applications
Update application details
Delete applications
Track application status
</td> </tr> <tr> <td>
📄 Resume Intelligence
Resume upload support
ATS scoring endpoint
Resume analysis workflow
Backend-powered processing
</td> <td>
📊 Career Dashboard
Centralized application management
Search applications
Track progress
User-specific data
</td> </tr> <tr> <td>
⚡ REST API
FastAPI backend
RESTful endpoints
Automatic Swagger documentation
Request validation with Pydantic
</td> <td>
☁️ Production Deployment
React frontend deployed on Vercel
FastAPI backend deployed on Render
PostgreSQL database
Production CORS configuration
Environment-based configuration
</td> </tr> </table>
🧠 Architecture
                         ┌─────────────────────┐
                         │       USER          │
                         │     Browser         │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      JobFlow        │
                         │   React Frontend    │
                         │      Vite           │
                         └──────────┬──────────┘
                                    │
                              REST API / JSON
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │      Backend        │
                         ├─────────────────────┤
                         │ Authentication      │
                         │ Job Management      │
                         │ Resume Processing   │
                         │ CORS                │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │     PostgreSQL      │
                         │      Database       │
                         └─────────────────────┘
🛠️ Tech Stack
Frontend
Technology	Purpose
⚛️ React	User interface
⚡ Vite	Development & build tooling
🎨 CSS	UI styling
🌐 Fetch API	Backend communication
🔐 Local Storage	Token persistence
Backend
Technology	Purpose
🐍 Python	Backend language
⚡ FastAPI	REST API framework
🧩 Pydantic	Data validation
🔑 JWT	Authentication
🗄️ SQLAlchemy	Database ORM
📄 python-docx	Resume processing
Database
PostgreSQL
Deployment
Frontend  → Vercel
Backend   → Render
Database  → PostgreSQL
Source    → GitHub
🔥 Application Flow
User
 │
 ├── Register
 │      ↓
 │   Backend validates user
 │      ↓
 │   Password securely processed
 │      ↓
 │   User stored in PostgreSQL
 │
 ├── Login
 │      ↓
 │   JWT token generated
 │      ↓
 │   Token stored by frontend
 │
 └── Dashboard
        │
        ├── Create Job
        ├── View Jobs
        ├── Update Job
        ├── Delete Job
        └── Analyze Resume
🔐 Authentication Flow

JobFlow uses JWT-based authentication.

             LOGIN
               │
               ▼
        ┌──────────────┐
        │   FastAPI    │
        └──────┬───────┘
               │
        Validate credentials
               │
               ▼
        ┌──────────────┐
        │ JWT Generated│
        └──────┬───────┘
               │
               ▼
        React stores token
               │
               ▼
       Protected API calls

Protected requests use:

Authorization: Bearer <token>
📡 API Endpoints
Authentication
Method	Endpoint	Description
POST	/auth/register	Register a new user
POST	/auth/login	Authenticate user
GET	/auth/me	Get current user
Jobs
Method	Endpoint	Description
GET	/jobs	Get user's jobs
POST	/jobs	Create a job
GET	/jobs/{job_id}	Get a specific job
PUT	/jobs/{job_id}	Update a job
DELETE	/jobs/{job_id}	Delete a job
Resume
Method	Endpoint	Description
POST	/resume/ats-score	Calculate ATS score
📂 Project Structure
jobFlow/
│
├── backend/
│   │
│   ├── src/
│   │   ├── database/
│   │   │   ├── connection.py
│   │   │   └── models.py
│   │   │
│   │   ├── routers/
│   │   │   ├── auth.py
│   │   │   ├── jobs.py
│   │   │   └── resume.py
│   │   │
│   │   ├── schemas/
│   │   │   ├── auth.py
│   │   │   └── job.py
│   │   │
│   │   ├── auth.py
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── ...
│
├── frontend/
│   │
│   ├── src/
│   │   ├── assets/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.js
│   └── ...
│
├── .gitignore
├── LICENSE
└── README.md
⚙️ Run Locally
1️⃣ Clone the repository
git clone YOUR_GITHUB_REPOSITORY
cd jobFlow
2️⃣ Backend Setup
cd backend

Create a virtual environment:

python -m venv venv

Activate it on Windows:

venv\Scripts\activate

Install dependencies:

pip install -r requirements.txt
3️⃣ Configure Environment Variables

Create:

.env

Example:

DATABASE_URL=your_database_url
JWT_SECRET_KEY=your_secret_key

⚠️ Never commit .env to GitHub.

4️⃣ Start Backend

From the backend directory:

uvicorn src.main:app --reload

Backend will run locally on:

http://localhost:8000

Swagger documentation:

http://localhost:8000/docs
💻 Frontend Setup

Open another terminal:

cd frontend

Install dependencies:

npm install

Create:

.env

Add:

VITE_API_URL=YOUR_BACKEND_URL

Start development server:

npm run dev
🌍 Deployment

JobFlow uses a simple production architecture:

                 GitHub
                    │
          ┌─────────┴─────────┐
          ▼                   ▼
       Vercel              Render
          │                   │
          ▼                   ▼
       React              FastAPI
                              │
                              ▼
                         PostgreSQL
Frontend

Deployed using Vercel.

Backend

Deployed using Render.

Database

Production data is stored using PostgreSQL.

Environment Configuration

Frontend:

VITE_API_URL

Backend:

DATABASE_URL
JWT_SECRET_KEY
🛡️ Security

JobFlow follows several basic production security practices:

🔐 JWT authentication
🔑 Secret keys stored through environment variables
🚫 .env excluded from Git
🌐 Production CORS configuration
👤 User-specific job data
🧹 Environment-specific configuration

Never expose your database credentials or JWT secret in source control.

🧪 API Documentation

The FastAPI backend automatically generates interactive Swagger documentation.

You can use it to:

inspect endpoints
test API requests
inspect request schemas
inspect response structures
test authentication
test CRUD operations

👉 Open API Documentation

📸 Screenshots

Add screenshots here after taking them from the deployed application.

🔐 Authentication
[ Add Login Screenshot Here ]
📊 Dashboard
[ Add Dashboard Screenshot Here ]
💼 Job Tracking
[ Add Job Management Screenshot Here ]
📄 Resume ATS
[ Add Resume ATS Screenshot Here ]
🚀 What Makes JobFlow Different?

JobFlow isn't just another CRUD application.

The project combines:

Frontend Engineering
        +
REST API Development
        +
Authentication
        +
Database Design
        +
Resume Intelligence
        +
Cloud Deployment

The goal is to build a real-world workflow, rather than just demonstrate individual technologies.

🗺️ Roadmap
✅ Completed
 User registration
 User login
 JWT authentication
 Job CRUD
 PostgreSQL integration
 Resume ATS endpoint
 React frontend
 FastAPI backend
 Production CORS
 Vercel deployment
 Render deployment
🔮 Future Improvements
 Application analytics
 Interview tracking
 Interview reminders
 Email notifications
 Calendar integration
 Resume version management
 AI-powered job description analysis
 AI resume improvement suggestions
 Job recommendation engine
 Application statistics dashboard
 Dark/light theme customization
📈 Future Vision

The long-term goal of JobFlow is to evolve from a simple application tracker into a personal career operating system.

             JOBFLOW
                │
      ┌─────────┼─────────┐
      │         │         │
      ▼         ▼         ▼
 Applications  Resume   Interviews
      │         │         │
      └─────────┼─────────┘
                │
                ▼
           Career Analytics
                │
                ▼
          AI Career Assistant
👨‍💻 Built By
<div align="center">
Sudhanshu Sharma

B.Tech — Artificial Intelligence & Data Science

Building projects around:

Python • Backend Development • AI/ML • APIs • Full-Stack Development

<br>

</div>
⭐ Support

If you found this project interesting:

⭐ Star the repository

🍴 Fork it

💡 Suggest improvements

🐛 Report issues

Every bit of feedback helps improve JobFlow.

<div align="center">
🚀 JobFlow

Your applications. Your progress. Your career.

<br>

Built with React + FastAPI + PostgreSQL

</div>
🔥 One thing I'd change from this version

For your actual GitHub, I would make the README even more impressive by putting a real screenshot/GIF of JobFlow at the very top, directly underneath the title.

Something like:

┌──────────────────────────────────────────────────────────┐
│                                                          │
│                       JOBFLOW                            │
│                                                          │
│          Career Command Center                           │
│                                                          │
│              [ ACTUAL APP SCREENSHOT ]                   │
│                                                          │
└──────────────────────────────────────────────────────────┘

That immediately tells a recruiter "this is a real deployed product", instead of making them read 100 lines first.

Your live links are:

JobFlow — Live Frontend
JobFlow — Backend
JobFlow — Swagger API Docs
JobFlow — GitHub Repository
