# 🚀 JobFlow

> A modern full-stack job management platform designed to simplify the process of discovering, tracking, and managing job applications.

JobFlow is a full-stack web application built with **React** and **FastAPI**. It provides a structured way to manage job opportunities and application data while keeping authentication, backend APIs, and database operations organized in a single application.

---

## ✨ Features

* 🔐 **User Authentication**

  * Secure user registration and login
  * JWT-based authentication
  * Protected API routes

* 💼 **Job Management**

  * Add and manage job opportunities
  * Track job application information
  * Organize applications in one place

* 📊 **Application Tracking**

  * Keep track of application progress
  * Manage different application stages
  * Maintain job-related information

* ⚡ **Fast REST API**

  * Built using FastAPI
  * Automatic API documentation
  * Clean backend architecture

* 🗄️ **PostgreSQL Database**

  * Persistent data storage
  * PostgreSQL hosted using Neon

* 🎨 **React Frontend**

  * Modern component-based UI
  * Communicates with the FastAPI backend through REST APIs

* ☁️ **Deployment Ready**

  * Backend configured for Render
  * Frontend can be deployed through Vercel

---

## 🛠️ Tech Stack

### Frontend

* React.js
* JavaScript
* HTML
* CSS
* npm

### Backend

* Python
* FastAPI
* Uvicorn
* JWT Authentication

### Database

* PostgreSQL
* Neon

### Deployment

* Render — Backend
* Vercel — Frontend

### Development Tools

* Git
* GitHub
* VS Code

---

## 🏗️ Project Architecture

```text
                    ┌─────────────────────┐
                    │      React UI       │
                    │      Frontend       │
                    └──────────┬──────────┘
                               │
                               │ REST API
                               ▼
                    ┌─────────────────────┐
                    │      FastAPI        │
                    │       Backend       │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    │                     │
                    ▼                     ▼
             ┌─────────────┐      ┌─────────────┐
             │ JWT Auth    │      │ PostgreSQL  │
             │             │      │   Database  │
             └─────────────┘      └──────┬──────┘
                                         │
                                         ▼
                                  ┌─────────────┐
                                  │    Neon     │
                                  │ PostgreSQL  │
                                  └─────────────┘
```

---

## 📂 Project Structure

```text
jobFlow/
│
├── backend/
│   ├── src/
│   │   └── main.py
│   │
│   └── requirements.txt
│
├── frontend/
│   ├── src/
│   └── package.json
│
├── .gitignore
├── LICENSE
└── README.md
```

---

## ⚙️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/CodeWithSudhanshu/jobFlow.git
cd jobFlow
```

---

# 🔧 Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a virtual environment:

```bash
python -m venv venv
```

Activate it on Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

### Environment Variables

Create a `.env` file inside the backend directory:

```env
DATABASE_URL=your_postgresql_database_url
JWT_SECRET_KEY=your_secret_key
```

Run the FastAPI server:

```bash
uvicorn src.main:app --reload
```

The backend will be available at:

```text
http://127.0.0.1:8000
```

FastAPI automatically provides interactive API documentation at:

```text
http://127.0.0.1:8000/docs
```

---

# 🎨 Frontend Setup

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend will then be available through the URL shown by the development server.

---

## 🔑 Authentication Flow

JobFlow uses **JWT-based authentication**.

```text
User
  │
  ▼
Login / Register
  │
  ▼
FastAPI Authentication API
  │
  ▼
Validate Credentials
  │
  ▼
Generate JWT Token
  │
  ▼
React Stores Token
  │
  ▼
Authenticated API Requests
```

Protected requests include the JWT token so the backend can identify and authorize the user.

---

## 🔄 Application Flow

```text
        ┌──────────────┐
        │     User     │
        └──────┬───────┘
               │
               ▼
       ┌───────────────┐
       │ React Frontend│
       └───────┬───────┘
               │
               ▼
        ┌─────────────┐
        │  FastAPI    │
        │     API     │
        └──────┬──────┘
               │
       ┌───────┴────────┐
       │                │
       ▼                ▼
   JWT Auth        PostgreSQL
                       │
                       ▼
                     Neon
```

---

## 🌐 Deployment

### Backend — Render

The backend is configured for deployment on Render.

**Runtime**

```text
Python 3
```

**Root Directory**

```text
backend
```

**Build Command**

```bash
pip install -r requirements.txt
```

**Start Command**

```bash
uvicorn src.main:app --host 0.0.0.0 --port $PORT
```

Required environment variables:

```env
DATABASE_URL=...
JWT_SECRET_KEY=...
PYTHON_VERSION=3.11.11
```

### Frontend — Vercel

The React frontend can be deployed separately using Vercel and configured to communicate with the deployed FastAPI backend.

---

## 🧪 API Documentation

Once the backend is running, FastAPI provides interactive API documentation.

### Swagger UI

```text
/docs
```

### ReDoc

```text
/redoc
```

These interfaces make it easy to test and understand the available API endpoints.

---

## 🔮 Future Improvements

* 📌 Advanced job search and filtering
* 📊 Application analytics dashboard
* 📅 Interview scheduling
* 🔔 Application deadline reminders
* 📝 Resume management
* 📄 Job description analysis
* 🤖 AI-powered job recommendations
* 📈 Application statistics
* 🌐 Production deployment
* 📱 Responsive mobile experience

---

## 🎯 Why JobFlow?

Job searching often involves managing multiple applications across different companies and platforms.

JobFlow aims to provide a **centralized workspace** where users can organize their opportunities and application progress instead of maintaining scattered notes or spreadsheets.

---

## 👨‍💻 Author

**Sudhanshu Sharma**

GitHub: [CodeWithSudhanshu](https://github.com/CodeWithSudhanshu)

---

## 📄 License

This project is licensed under the **MIT License**.

See the `LICENSE` file for more information.

---

⭐ If you find this project useful, consider giving the repository a star!
