<div align="center">

# 🚀 JobFlow
### Your Career Command Center

**Track applications. Analyze resumes. Manage your entire job search — from one place.**

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-job--flow--amber.vercel.app-8B5CF6?style=for-the-badge)](https://job-flow-amber.vercel.app)
[![API Docs](https://img.shields.io/badge/📄_API_Docs-Explore-009688?style=for-the-badge)](https://jobflow-g3ww.onrender.com/docs)

<br/>

<img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=flat-square&logo=react&logoColor=black" alt="React"/>
<img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat-square&logo=vite&logoColor=white" alt="Vite"/>
<img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white" alt="FastAPI"/>
<img src="https://img.shields.io/badge/Python-3.x-3776AB?style=flat-square&logo=python&logoColor=white" alt="Python"/>
<img src="https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>

</div>

<br/>

<!--
  📸 Drop a screenshot or GIF of the dashboard here — this is the single
  highest-impact addition you can make to a README. Something like:
  <p align="center"><img src="./assets/dashboard-preview.png" width="850"/></p>
-->

---

## 🎯 Why JobFlow?

Job hunting gets chaotic fast — applications scattered across spreadsheets, emails, browser tabs, and sticky notes.

> *"Where did I apply?"* · *"What was the status of that one?"* · *"Did I already apply here?"* · *"Is my resume even good enough?"*

**JobFlow answers all of it from a single, centralized workspace.**

---

## ✨ Features

<table>
<tr>
<td width="50%" valign="top">

### 🔐 Secure Authentication
- Register & login with JWT
- Persistent sessions via browser storage
- Protected, user-scoped data
- Authenticated API requests throughout

</td>
<td width="50%" valign="top">

### 💼 Application Management
- Create, view, update & delete applications
- Track company, role, status, salary & more
- Live dashboard stats & pipeline view
- Full CRUD from a single interface

</td>
</tr>
<tr>
<td width="50%" valign="top">

### 📄 Resume ATS Analyzer
- Upload a resume, get an instant ATS score
- Actionable suggestions to improve it
- `POST /resume/ats-score`

</td>
<td width="50%" valign="top">

### 📊 Career Analytics
- Application → Interview → Offer funnel
- Response rate & conversion tracking
- Salary insights across applications
- Built to grow with more insights over time

</td>
</tr>
</table>

---

## 🧠 Architecture

```text
                         ┌─────────────────────┐
                         │        USER          │
                         │   Browser / Mobile    │
                         └───────────┬───────────┘
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │   React + Vite        │
                         │      Frontend         │
                         └───────────┬───────────┘
                                     │
                               REST API calls
                                     │
                                     ▼
                         ┌─────────────────────┐
                         │       FastAPI          │
                         │       Backend          │
                         └───────────┬───────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
   ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
   │ Authentication    │    │  Job Manager      │    │  ATS Analyzer     │
   │       JWT          │    │   CRUD API        │    │    Resume          │
   └─────────────────┘    └────────┬────────┘    └─────────────────┘
                                     │
                                     ▼
                          ┌─────────────────┐
                          │     Database      │
                          │   (PostgreSQL)     │
                          └─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React, Vite |
| **Backend** | FastAPI (Python) |
| **Auth** | JWT-based authentication |
| **Database** | PostgreSQL |
| **Hosting** | Vercel (frontend) · Render (backend) |

---

## 🚦 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/<your-username>/job-Application-tracker.git
cd job-Application-tracker

# 2. Backend setup
cd backend
python -m venv venv
venv\Scripts\activate      # Windows
# source venv/bin/activate # macOS/Linux
pip install -r requirements.txt
uvicorn src.main:app --reload --port 8000

# 3. Frontend setup (in a new terminal)
cd frontend
npm install
npm run dev
```

Then open `http://localhost:5173` in your browser. 🎉

---

## 🌐 Live Links

| | |
|---|---|
| **Frontend** | [job-flow-amber.vercel.app](https://job-flow-amber.vercel.app) |
| **Backend API** | [jobflow-g3ww.onrender.com](https://jobflow-g3ww.onrender.com) |
| **API Docs (Swagger)** | [jobflow-g3ww.onrender.com/docs](https://jobflow-g3ww.onrender.com/docs) |

---

<div align="center">

**Built to make job hunting feel like less of a mess.**

</div>
