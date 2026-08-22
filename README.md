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
<img src="https://img.shields.io/badge/JWT-Authentication-000000?style=flat-square&logo=jsonwebtokens&logoColor=white" alt="JWT"/>
<img src="https://img.shields.io/badge/PostgreSQL-Database-4169E1?style=flat-square&logo=postgresql&logoColor=white" alt="PostgreSQL"/>

</div>

<br/>

---

## 🎯 Why JobFlow?

Job hunting gets chaotic fast.

Applications end up scattered across spreadsheets, emails, browser tabs, notes, and different job portals.

> *"Where did I apply?"*  
> *"What was the status of that application?"*  
> *"Did I already apply to this company?"*  
> *"How strong is my resume?"*

**JobFlow brings the core parts of your job search into one centralized workspace.**

---

## 📸 Preview

<!--
Add your dashboard screenshot here after the UI is polished.

Example:

<p align="center">
  <img src="./assets/dashboard-preview.png" width="850" alt="JobFlow Dashboard"/>
</p>
-->

<p align="center">
  <i>Dashboard preview coming soon.</i>
</p>

---

## ✨ Features

<table>
<tr>

<td width="50%" valign="top">

### 🔐 Authentication

- User registration
- User login
- JWT-based authentication
- Persistent sessions
- Protected API requests
- User-specific application data

</td>

<td width="50%" valign="top">

### 💼 Job Application Management

- Create job applications
- View applications
- Update application details
- Delete applications
- Track application status
- Manage job-related information

</td>

</tr>

<tr>

<td width="50%" valign="top">

### 📄 Resume ATS Analyzer

- Upload a resume
- Generate an ATS-oriented score
- Analyze resume performance
- Designed for future resume improvement features

</td>

<td width="50%" valign="top">

### 🔌 REST API

- FastAPI-powered backend
- Authentication endpoints
- Job CRUD endpoints
- Resume analysis endpoint
- Interactive Swagger documentation
- Production-ready API structure

</td>

</tr>
</table>

---

## 🧠 Architecture

```text
                         ┌─────────────────────┐
                         │        USER         │
                         │   Browser / Mobile  │
                         └──────────┬──────────┘
                                    │
                                    ▼
                         ┌─────────────────────┐
                         │    React + Vite     │
                         │      Frontend       │
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
       │Authentication│       │ Job Manager │       │ ATS Analyzer│
       │     JWT     │       │   CRUD API  │       │   Resume    │
       └─────────────┘       └──────┬──────┘       └─────────────┘
                                    │
                                    ▼
                           ┌─────────────────┐
                           │    PostgreSQL   │
                           │     Database    │
                           └─────────────────┘
