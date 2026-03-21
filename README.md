# ⛳ Golf Charity Platform (Full Stack)

## 🚀 Live Demo

🌐 Frontend (Vercel):  
https://golf-charity-platform-delta.vercel.app  

⚙️ Backend API (Render):  
https://golf-charity-platform-968z.onrender.com  

---

## 📌 Overview

Golf Charity Platform is a **full-stack MERN application** that allows users to:

- Register & login securely
- Track golf performance scores
- View analytics dashboard
- Participate in charity-based golf engagement

This project demonstrates **real-world production deployment** using:
👉 Vercel (Frontend) + Render (Backend) + MongoDB Atlas

---

## 🛠️ Tech Stack

### 🔹 Frontend
- React (Vite)
- Axios
- Tailwind CSS
- Recharts

### 🔹 Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication

---

## ⚙️ Features

### 🔐 Authentication System
- User registration & login
- Password hashing (secure)
- JWT-based authentication
- Token-based protected routes

---

### ⛳ Score Management System
- Add golf scores (range: 1–45)
- Automatically keeps only **latest 5 scores**
- Removes oldest score dynamically
- Real-time dashboard updates

---

### 📊 Dashboard
- Total scores tracked
- Average score calculation
- Best score highlight
- Visual performance chart

---

### 🛡️ Security & Validation
- Input validation
- Error handling middleware
- Protected API routes
- Secure environment variables

---

## 📡 API Endpoints

### 🔐 Auth
- `POST /api/users/register`
- `POST /api/users/login`
- `GET /api/users/profile`

---

### ⛳ Scores
- `POST /api/scores`
- `GET /api/scores`

---

### 🎲 Draw System
- `POST /api/draw/run`

---

## 💡 Key Highlight

Implements custom business logic:

> Automatically maintains only the **latest 5 scores per user**, ensuring efficient and clean data management.

---

## 🚀 Deployment

| Service   | Platform |
|----------|---------|
| Frontend | Vercel |
| Backend  | Render |
| Database | MongoDB Atlas |

---

## 📸 Screenshots

(Add screenshots here if needed)

---

## 👨‍💻 Author

**Krishna Sharma**

- GitHub: https://github.com/krishnash648  
- LinkedIn: (add your link here)

---

## ⭐ Final Note

This project demonstrates:
- Full-stack development
- API design
- Authentication systems
- Production deployment
- Real-world debugging (CORS, build issues, etc.)
