# Golf Charity Platform (Backend)

## 🚀 Overview

This project is a backend system for a Golf Charity Subscription Platform.

It includes user authentication and a score management system with core business logic.

---

## 🔧 Tech Stack

* Node.js
* Express.js
* MongoDB Atlas
* JWT Authentication
* Mongoose

---

## ⚙️ Features

### 🔐 Authentication

* User registration & login
* Secure password hashing
* JWT-based authentication

### ⛳ Score System

* Add golf scores (range: 1–45)
* Only latest 5 scores are stored
* Oldest score is automatically removed

### 🛡️ Security & Validation

* Input validation
* Protected routes
* Error handling

---

## 📡 API Endpoints

### Auth

* POST /api/users/register
* POST /api/users/login

### Scores

* POST /api/scores
* GET /api/scores

---

## 💡 Highlight

Implements business logic to maintain only the latest 5 scores per user automatically.

---

## 👨‍💻 Author

Krishna Sharma
