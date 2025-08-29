# 🚀 DevCred – Developer Contribution Ledger Platform  

A full-stack platform that helps developers collaborate, contribute, endorse, and showcase their professional credibility.  
Built with **Django REST Framework (backend)** and **React + TailwindCSS (frontend)**.  

---

## 📖 Table of Contents  
- [✨ Features](#-features)  
- [🛠 Tech Stack](#-tech-stack)  
- [📦 Requirements](#-requirements)  
- [⚙️ Installation & Setup](#-installation--setup)  
  - [Backend Setup (Django)](#backend-setup-django)  
  - [Frontend Setup (React + TailwindCSS)](#frontend-setup-react--tailwindcss)  
- [🔑 Environment Variables](#-environment-variables)  
- [📂 Project Structure](#-project-structure)  
- [📖 Usage Guide](#-usage-guide)  
- [🚀 Deployment](#-deployment)  

---

## ✨ Features  

✅ **Authentication & Profiles**  
- Secure signup & login using JWT  
- Custom user profiles (bio, profile picture, GitHub username)  

✅ **Dashboard**  
- Shows contributions, endorsements, GitHub repos, mentoring videos, resume status  

✅ **Contributions System**  
- Types: Bug Fix, Code Review, Resume Generator, Endorsements, Mentoring Videos  
- Tracks developer activity and credibility  

✅ **Endorsements**  
- Users can endorse other developers to recognize their skills  

✅ **Messaging**  
- Direct communication between developers (like mini chat/email)  

✅ **Resume Generator**  
- Generate a professional resume based on your contributions  

✅ **GitHub Integration**  
- Link GitHub account  
- Fetch public repository count and display on dashboard  

✅ **Professional UX**  
- Responsive TailwindCSS-based UI  
- Optimized for collaboration  

---

## 🛠 Tech Stack  

**Backend:**  
- Django 5.x  
- Django REST Framework (DRF)  
- Simple JWT (Auth)  
- PostgreSQL (or SQLite in dev)  
- CORS headers  

**Frontend:**  
- React 18 (TypeScript)  
- Tailwind CSS v3/v4  
- Axios  
- React Router  
- React Icons  
- React Toastify  

---

## 📦 Requirements  

- Python ≥ 3.10  
- Node.js ≥ 18.x  
- npm  
- PostgreSQL  

---

## ⚙️ Installation & Setup  

### 1. Clone Repository  

git clone https://github.com/rohitdasari183/DevCred.git
cd devcred

2. Backend Setup (Django)
-cd backend
-python -m venv venv
-venv\Scripts\activate
-python manage.py migrate
-python manage.py createsuperuser
-python manage.py runserver

👉 Backend will run at: http://localhost:8000

3. Frontend Setup (React + TailwindCSS + TypeScript)
-cd frontend
-npm install
-npm start

🔑 Environment Variables
-Backend (backend/.env)
-SECRET_KEY=your-secret-key
-DEBUG=True
-ALLOWED_HOSTS=*

-DATABASE_URL=postgres://user:pass@localhost:5432/devcred
-CORS_ALLOWED_ORIGINS=http://localhost:3000

-Frontend (frontend/.env)
-REACT_APP_API_BASE=http://localhost:8000

📂 Project Structure
devcred/
│── backend/
│   ├── users/              # Auth & profiles
│   ├── contributions/      # Developer contributions
│   ├── endorsements/       # Endorsement system
│   ├── videos/             # Mentoring videos
│   ├── resume/             # Resume generator
│   ├── messages/           # Messaging system
│   ├── integrations/       # GitHub services
│   ├── settings.py
│   └── urls.py
│
│── frontend/
│   ├── src/
│   │   ├── api/            # Axios config
│   │   ├── components/     # Navbar, UI widgets
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Dashboard, Profile, UsersList, Messages, ResumeGenerator, etc.
│   │   ├── App.tsx         # Routes
│   │   └── index.tsx
│
│── README.md

📖 Usage Guide

👤 Authentication

-Sign up, then log in

-Token stored in localStorage

📊 Dashboard

-View contributions, endorsements, repos, resume status, mentoring videos

👨‍💻 Contributions

-Submit contributions (Bug Fix, Code Review, Resume, etc.)

-Track developer credibility

👍 Endorsements

-Endorse other developers for their contributions

📹 Mentoring Videos

-Upload and list videos

📝 Resume Generator

-Generate a resume from contributions

💬 Messaging

-Send and receive direct messages

🌐 GitHub Integration

-View GitHub repo count

-Profile links redirect to GitHub profile

🚀 Deployment
-Backend (Django)

-Use Render to deploy backend

-Set DEBUG=False and configure ALLOWED_HOSTS

Frontend (React)

Build with:

-npm run build
