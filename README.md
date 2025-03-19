# Compte Contest Tracker App

## 📌 Quick Links  
🎥 **Video Demo**: [Watch Here](https://drive.google.com/file/d/1SLduromLqLn2iWQYaoacCsYVCEMrqc7G/view?usp=sharing)  
🔗 **Frontend**: [View Code](<your_frontend_link>)  
🔗 **Backend**: [View Code](<your_backend_link>)  

## 📜 Table of Contents
- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [API Endpoints](#-api-endpoints)
- [Installation & Setup](#-installation--setup)
- [Future Enhancements](#-future-enhancements)
- [Contact](#-contact)

## 📌 Overview
The **Contest Tracker App** helps users track upcoming and past coding contests from platforms like **Leetcode, CodeChef, and Codeforces**. Users can **bookmark contests**, set reminders, and receive **email notifications** before contests start. The app fetches data in near real-time using web scraping and APIs.

## 🚀 Features
### 🔹 Comprehensive Contest Tracking
- Fetches **upcoming and past contests** from Leetcode, CodeChef, and Codeforces.
- Near **real-time data updates** using **web scraping (Puppeteer) and APIs**.
- Displays contest details like **start time, duration, platform, and registration links**.

### 🔹 Intelligent Reminder System
- Users can **set reminders** for contests.
- Reminders are **queued in Redis** and stored in **MongoDB**.
- Sends **email notifications** before the contest starts using **Nodemailer**.

### 🔹 Advanced Bookmarking System
- Users can **bookmark contests** for quick access.
- View all bookmarked contests in one place.
- Easily add or remove contests from bookmarks.

### 🔹 Seamless Authentication & Security
- **Secure login system** with **Clerk authentication**.
- Supports **email-password login** and **Google authentication**.
- Implements **middleware protection** to secure user data.

### 🔹 Post-Contest Discussion (PCD) Integration
- **Auto-fetches** PCD links from **YouTube** for contests.
- Users can also **manually add** PCD links if missing.
- Helps users access solutions and discussions after a contest.

### 🔹 Adaptive UI & Dark Mode
- **Fully responsive UI** built with **ShadCN & Tailwind CSS**.
- **Platform-wise filtering** to easily find contests.
- **Dark & Light mode toggle** for better accessibility.

### 🔹 Infinite Scrolling for a Smooth Experience
- Implements **infinite scrolling** for contest listings.
- Provides a **fluid user experience** without excessive page loads.

### 🔹 Robust Backend Infrastructure
- **Node.js & Express.js** for scalable API handling.
- **MongoDB for data storage** and Redis for **high-performance queuing**.
- **Clerk authentication**, ensuring secure API endpoints.

## 🛠️ Tech Stack
### 🔹 Backend
- **Node.js** with **Express.js**
- **MongoDB** (via Mongoose) for data storage
- **Redis** for queuing reminders
- **Puppeteer** for web scraping
- **Clerk** for authentication
- **Nodemailer** for email notifications
- **Render.com** for Redis hosting

### 🔹 Frontend
- **Vite + React.js**
- **ShadCN UI Library**
- **Tailwind CSS**

## 📦 API Endpoints
### 🔹 Authentication Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/auth/webhook/clerk` | Handles Clerk webhooks |
| `GET` | `/auth/get` | Fetches user profile (Auth required) |
| `POST` | `/auth/update` | Updates user profile (Auth required) |

### 🔹 Contest Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/contest/create` | Create a new contest (Auth required) |
| `PUT` | `/contest/update/:contestId` | Update contest details (Auth required) |
| `DELETE` | `/contest/delete/:contestId` | Delete a contest (Auth required) |
| `PUT` | `/contest/addPcdLink/:contestId` | Add a PCD link to a contest (Auth required) |
| `GET` | `/contest/get/:contestId` | Fetch details of a specific contest |
| `GET` | `/contest/getAll` | Fetch all contests |

### 🔹 Bookmark Routes
| Method | Endpoint | Description |
|--------|---------|-------------|
| `POST` | `/bookmark/create` | Add a contest to bookmarks (Auth required) |
| `DELETE` | `/bookmark/delete/:contestId` | Remove a bookmarked contest (Auth required) |
| `GET` | `/bookmark/getAll` | Get all bookmarked contests (Auth required) |

## 🏗️ Installation & Setup
### 🔹 Prerequisites
- Install **Node.js** (v16+ recommended)
- Install **MongoDB** and **Redis**
- Create a **.env** file and add the following variables:

### Backend Setup
```bash
  git clone [<repo_url>](https://github.com/ayushman075/compte)
  cd backend
  npm install
  npm start
```

```env
MONGODB_URI=<your_mongodb_connection_string>
PORT=8080
CLERK_PUBLISHABLE_KEY=<your_clerk_publishable_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
CLERK_WEBHOOK_SECRET_KEY=<your_clerk_webhook_secret_key>

NODEMAILER_SERVICE_PROVIDER=gmail
NODEMAILER_EMAIL=<your_email>
NODEMAILER_PASSWORD=<your_email_app_password>

REDIS_URL=<your_redis_url>
REDIS_PORT=6379
```
### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## ✨ Future Enhancements
- Web Push Notifications for contest reminders.
- Leaderboard & Analytics to track user participation.
- Progressive Web App (PWA) support for offline access.
- AI-based Contest Recommendations based on past participation.

## 📩 Contact
For queries, reach out via [ayushman8521@gmail.com](mailto:ayushman8521@gmail.com).
