# CampusConnect – Batch-Personalized RAG-AI Information Retrieval System

> **CampusConnect** is a full-stack, AI-driven university portal and chatbot developed for **RGUKT RK Valley** (Rajiv Gandhi University of Knowledge Technologies). Built with a **Retrieval-Augmented Generation (RAG)** architecture, the system provides personalized academic information, batch-filtered notices, real-time student analytics, and administrative governance.

---

## 🏛️ System Overview

- **Institution:** Rajiv Gandhi University of Knowledge Technologies, RK Valley (Idupulapaya, Andhra Pradesh)
- **Batches Supported:** P1, P2 (PUC 1st & 2nd Year), E1, E2, E3, E4 (B.Tech 1st to 4th Year)
- **Architecture:** Client-Server RAG Architecture with Vector / Keyword Semantic Matching & TF-IDF Ranking
- **Database:** MongoDB Atlas (Cloud Replica Set) with Persistent Local Fallback Engine

---

## ✨ Key Features

### 1. 🤖 Batch-Personalized RAG-AI Chatbot
- **Batch Context Awareness:** Automatically personalizes answers based on academic cohort (e.g., E4 fast-track exams vs. P1 preparatory tests).
- **Personal Student Record Retrieval:** Queries regarding student metrics (attendance, CGPA, faculty advisor, hostel allocation, institutional email) are fetched dynamically from MongoDB Atlas using the verified student ID.
- **Multimodal Natural Language Queries:** Supports voice recognition input (Speech-to-Text) and text-to-speech audio playback.
- **Strict Verification & Zero Hallucination:** Answers are anchored to official circulars and verified knowledge base entries.

### 2. 📊 Student Academic Dashboard
- **Live Metric Profile:** Displays verified student ID, full name, batch, department, attendance percentage (with exam eligibility warning), cumulative GPA, and allocated hostel room (GH2 for female students, BH2 for male students).
- **Faculty Advisor Allocation:** Direct display of assigned department mentor with consultation hours.
- **Batch-Specific Notice Board:** Real-time stream of official administrative announcements, exam schedules, and placement notifications.

### 3. 🛡️ Administrative Control Panel
- **Batch-Wise Notice Publishing:** Post, pin, and target announcements to individual cohorts (e.g., E4 placement drives) or campus-wide ("All Batches").
- **Knowledge Base Management:** Add, edit, and fine-tune official Q&A entries across categories: Exams, Fees, Holidays, Placements, and Facilities.
- **Live Database Diagnostics:** Real-time connection monitoring with MongoDB Atlas replica set metrics.

### 4. 🪪 ID-Based Authentication
- **Secure ID-Based Lookup:** Live lookup verifies registered student roll numbers (e.g., `R210688`, `R210177`).
- **Pre-Seeded Cohort Database:** Over 360+ verified RGUKT student records pre-loaded with official `@rguktrkv.ac.in` email format, semester standing, and assigned advisors.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Tailwind CSS, Lucide Icons, React Markdown |
| **Backend** | Node.js, Express.js (ES Modules) |
| **Database** | MongoDB Atlas, Mongoose ODM |
| **Information Retrieval** | Custom RAG Engine (Stemming, Stopword Filtering, Tokenization, Levenshtein Distance, Vector Similarity) |

---

## 📁 Project Structure

```
Major_Project/
├── backend/
│   ├── models/             # Mongoose Schemas (StudentData, User, Notice, KnowledgeItem, etc.)
│   ├── defaultKnowledge.js # Seed knowledge base items & official circulars
│   ├── importStudentData.js# Student dataset parsing & database seeding
│   ├── ragEngine.js        # Core RAG retrieval, tokenization & scoring algorithm
│   ├── db.js               # Dual-mode database connection handler (Atlas + Local Store)
│   ├── server.js           # REST API endpoints & Express server
│   └── .env.example        # Environment variables template
├── data/
│   └── local_store.json    # Persistent local JSON fallback cache
├── frontend/
│   ├── src/
│   │   ├── components/     # React UI Components (ChatInterface, Dashboard, HomePage, etc.)
│   │   ├── data/           # Authentication and demo configuration
│   │   ├── App.jsx         # Main application controller & router
│   │   └── main.jsx        # Frontend entry point
│   ├── index.html
│   └── vite.config.js
├── .gitignore              # Git ignore rules for node_modules and secrets
├── package.json            # Root npm script runner
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18.0.0 or higher)
- [MongoDB Atlas](https://www.mongodb.com/atlas) account (or use local persistence mode)

### 1. Clone the Repository
```bash
git clone https://github.com/Surapureddy-Jyoshna/CampusConnect.git
cd CampusConnect
```

### 2. Install Dependencies
```bash
# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### 3. Configure Environment Variables
Copy `.env.example` in `backend/`:
```bash
cp backend/.env.example backend/.env
```
Edit `backend/.env` with your settings:
```env
PORT=5001
MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/campusconnect?retryWrites=true&w=majority
NODE_ENV=development
```

### 4. Build the Frontend
```bash
npm run build
```

### 5. Launch the Server
```bash
npm start
```
The application will be accessible at: **`http://localhost:5001`**

---

## 👥 Default Credentials

- **Admin Login:**
  - ID / Username: `EMP-IT-008` or `admin`
  - Password: `admin123`
- **Student Login:**
  - ID / Roll No: Any RGUKT RKV student roll number (e.g., `R210688`, `R210177`, `R210394`)
  - Password: `password123`

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
