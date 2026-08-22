# 🚀 JobFlow — Career Command Center

<p align="center">

  <img src="https://img.shields.io/badge/JobFlow-Career%20Command%20Center-8B5CF6?style=for-the-badge" alt="JobFlow"/>

  <img src="https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React"/>

  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI"/>

  <img src="https://img.shields.io/badge/Python-Backend-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python"/>

  <img src="https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite"/>

</p>

<p align="center">
  <b>Track applications. Analyze resumes. Manage your entire job search from one place.</b>
</p>

<p align="center">
  A full-stack Job Application Management platform built with React and FastAPI.
</p>

---

## 🌐 Live Application

**Frontend:** `https://job-flow-amber.vercel.app`

**Backend API:** `https://jobflow-g3ww.onrender.com`

**API Documentation:** `https://jobflow-g3ww.onrender.com/docs`

---

# 🎯 Why JobFlow?

Job hunting can quickly become chaotic.

Applications get scattered across spreadsheets, emails, browser tabs, notes and different job portals.

**JobFlow brings everything together into one centralized career workspace.**

Instead of asking:

> "Where did I apply?"

> "What was the status of that application?"

> "Did I already apply to this company?"

> "How strong is my resume?"

JobFlow gives you a single place to manage it all.

---

# ✨ Features

## 🔐 Secure Authentication

- User registration
- User login
- JWT-based authentication
- Protected user data
- Persistent login using browser storage
- Authenticated API requests

---

## 💼 Job Application Management

Create and manage your job applications from a centralized dashboard.

### Supported operations

- Create a job application
- View all applications
- View a specific application
- Update application details
- Delete applications
- Track application progress

### Application information can include:

- Company
- Job title
- Application status
- Job details
- Application information
- Other relevant job-tracking data

---

## 📄 Resume ATS Analyzer

JobFlow includes an ATS scoring feature that allows users to submit a resume and receive an automated ATS-oriented score.

### Endpoint

`POST /resume/ats-score`

The goal is to help users understand how their resume performs against automated screening systems.

---

## 📊 Career Tracking

JobFlow is designed to turn a job search into a measurable process.

Users can track:

- Applications
- Application statuses
- Interviews
- Progress
- Resume performance

The platform is designed so that analytics and career insights can be expanded over time.

---

# 🧠 System Architecture

```text
                         ┌─────────────────────┐
                         │       USER          │
                         │  Browser / Mobile   │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │   React + Vite      │
                         │     Frontend        │
                         └──────────┬──────────┘
                                    │
                              REST API Calls
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │      FastAPI        │
                         │       Backend       │
                         └──────────┬──────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                     │
              ▼                     ▼                     ▼
       ┌─────────────┐       ┌─────────────┐       ┌─────────────┐
       │ Authentication│      │ Job Manager │       │ ATS Analyzer│
       │     JWT      │       │   CRUD API  │       │   Resume    │
       └─────────────┘       └──────┬──────┘       └─────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │    Database     │
                           └─────────────────┘
