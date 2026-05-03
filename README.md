# 🚀 Network Speed Analyzer

A full-stack web application for analyzing network performance including:

- 📥 Download Speed  
- 📤 Upload Speed  
- 📶 Ping  
- 📊 Jitter  
- 📉 Packet Loss  

Built using **FastAPI (Backend)** and **React (Frontend)** with a **MySQL database**.

---

## 🛠 Requirements

### 🔹 Backend
- Python 3.9+
- pip

Required libraries:
```bash
fastapi
uvicorn[standard]
speedtest-cli
ping3
SQLAlchemy
pymysql
```

---

### 🔹 Frontend
- Node.js (v16 or higher)
- npm

---

### 🔹 Database
- MySQL Server (XAMPP or any alternative)

---

## ⚙️ Setup Instructions

---

## 1️⃣ Database Setup

1. Start your MySQL server  
2. Create a database named:

```sql
network_analyzer
```

---

## 2️⃣ Backend Setup

Open terminal:

```bash
cd backend
```

Install dependencies:

```bash
pip install fastapi uvicorn[standard] speedtest-cli ping3 SQLAlchemy pymysql
```

Run the server:

```bash
uvicorn main:app --reload
```

Backend will run on:
```
http://127.0.0.1:8000
```

---

## 3️⃣ Frontend Setup

Open a new terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Run the app:

```bash
npm run dev
```

Frontend will run on:
```
http://localhost:5173
```

---

## 🎮 How to Use

1. Open the frontend in your browser  
2. Click the **GO** button  
3. The app will:
   - Run Download test  
   - Then Upload test  
4. Results will be automatically saved in the database  

---

## 📁 Project Structure

```
project-root/
│
├── backend/
│   ├── main.py
│   ├── Core/
│   └── ...
│
├── frontend/
│   ├── src/
│   └── ...
│
└── README.md
```

---

## 💡 Notes

- Make sure backend is running before starting frontend  
- Database must be created before running backend  
- CORS is enabled for local development  

---

## 📌 Future Improvements

- Add authentication system  
- Improve UI/UX  
- Export test results  
- Add history tracking  
