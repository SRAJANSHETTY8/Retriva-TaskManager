# RetrivaAI

RetrivaAI is an AI-powered Task & Knowledge Management System built with FastAPI, MySQL, SQLAlchemy, FAISS, and Sentence Transformers.

The application enables administrators to build an AI-powered knowledge base by uploading PDF and text documents, assigning tasks to users, and monitoring system activity through analytics.

Users can securely log in, perform semantic document searches using natural language, view assigned tasks, update task status, and access relevant knowledge without requiring exact keyword matches.

---

# Application Screenshots

## Login

![Login](frontend\images\login.png)

## Register

![Register](frontend\images\create_account.png)

## Documents

![Documents](frontend\images\uploadedpage.png)

## Semantic Search

![Search](frontend\images\chat.png)

## Tasks-Admin

![Tasks](frontend\images\taskpageadmin.png)

## Tasks-User

![Tasks](frontend\images\taskpageuser.png)

## Analytics

![Analytics](frontend\images\dashaboard.png)

---

# Features

## Authentication

* User Registration
* JWT Authentication
* Secure Password Hashing
* Role-Based Access Control (Admin/User)

## Document Management

* Upload PDF Documents
* Upload Text Files
* Automatic Document Processing
* Document Listing
* Delete Documents

## AI Semantic Search

* Automatic Text Extraction
* Text Chunking
* Local Sentence Embeddings
* FAISS Vector Storage
* Natural Language Search
* Similarity-Based Retrieval

## Task Management

* Create Tasks
* Assign Tasks
* Update Task Status
* Filter Tasks
* View Assigned Tasks

## Activity Logging

* Login Activity
* Document Upload Logs
* Search History
* Task Update Logs

## Analytics

* Total Tasks
* Completed Tasks
* Pending Tasks
* Most Searched Queries

---

# Tech Stack

## Backend

* Python 3.10+
* FastAPI
* SQLAlchemy
* MySQL
* Pydantic

## Authentication

* JWT (python-jose)
* Passlib (bcrypt)

## AI

* Sentence Transformers
* FAISS
* PyPDF

## Tools

* Git
* GitHub
* Postman

---

# System Workflow

```text
User Login
      ↓
Admin Uploads Document
      ↓
Extract Text
      ↓
Split Into Chunks
      ↓
Generate Embeddings
      ↓
Store In FAISS
      ↓
User Searches Query
      ↓
Semantic Search
      ↓
Relevant Documents Returned
```

---

# Task Workflow

```text
Admin Creates Task
      ↓
Assign Task To User
      ↓
User Views Assigned Tasks
      ↓
User Marks Task Completed
      ↓
Activity Logged
      ↓
Analytics Updated
```

---

# Database Models

## Role

Stores user roles.

* Admin
* User

## User

Stores user information including:

* Name
* Email
* Password
* Role

## Document

Stores uploaded document metadata including:

* Title
* Filename
* File Path
* Uploaded By

## TextChunks

Stores document chunks used for semantic search.

* Document ID
* Chunk Index
* Chunk Text

## Task

Stores task information including:

* Title
* Description
* Status
* Assigned User
* Created By

## ActivityLog

Stores user activity including:

* Login
* Search
* Document Upload
* Task Updates

---

# API Endpoints

## Authentication

| Method | Endpoint |
|--------|----------|
| POST | /auth/register |
| POST | /auth/login |

---

## Roles

| Method | Endpoint |
|--------|----------|
| GET | /roles |

---

## Documents

| Method | Endpoint |
|--------|----------|
| GET | /documents |
| GET | /documents/{id} |
| POST | /documents |
| DELETE | /documents/{id} |

---

## Semantic Search

| Method | Endpoint |
|--------|----------|
| GET | /search |

---

## Tasks

| Method | Endpoint |
|--------|----------|
| POST | /tasks |
| GET | /tasks |
| PUT | /tasks/{id} |

---

## Activity Logs

| Method | Endpoint |
|--------|----------|
| GET | /activity-logs |

---

## Analytics

| Method | Endpoint |
|--------|----------|
| GET | /analytics |

---

# Setup Instructions

## Clone Repository

```bash
git clone https://github.com/yourusername/RetrivaAI.git
cd RetrivaAI
```

---

## Create Virtual Environment

```bash
python -m venv venv
```

---

## Activate Virtual Environment

### Windows

```bash
venv\Scripts\activate
```

### Linux/macOS

```bash
source venv/bin/activate
```

---

## Install Dependencies

```bash
pip install -r requirements.txt
```

---

## Create Environment Variables

Create a `.env` file.

```env
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/retriva
SECRET_KEY=your_secret_key
```

---

## Create Database

```sql
CREATE DATABASE retriva;
```

---

## Run Application

```bash
uvicorn main:app --reload
```

Backend URL

```
http://127.0.0.1:8000
```

Swagger Documentation

```
http://127.0.0.1:8000/docs
```

---

# Sample cURL Requests

## Register

```bash
curl -X POST http://127.0.0.1:8000/auth/register
```

## Login

```bash
curl -X POST http://127.0.0.1:8000/auth/login
```

## Upload Document

```bash
curl -X POST http://127.0.0.1:8000/documents
```

## Search

```bash
curl "http://127.0.0.1:8000/search?query=machine learning"
```

## Get Tasks

```bash
curl http://127.0.0.1:8000/tasks
```

## Analytics

```bash
curl http://127.0.0.1:8000/analytics
```

---

# Assumptions

* Only administrators can upload documents.
* Only administrators can create tasks.
* Users can update only tasks assigned to them.
* Semantic search is performed locally using Sentence Transformers.
* FAISS stores document embeddings in memory.
* PDF and TXT files are supported.
* JWT authentication secures protected endpoints.
* Activity logs record major user actions.

---

# Project Structure

```text
RetrivaAI/
│
├── backend/
│   ├── main.py
│   ├── auth.py
│   ├── database.py
│   ├── embeddings.py
│   ├── model.py
│   ├── schema.py
│   ├── requirements.txt
│   ├── uploads/
│   └── .env
│
├── frontend/
│
├── screenshots/
│
├── README.md
└── .gitignore
```

---

#Features

* AI Semantic Search
* FAISS Vector Database
* Sentence Transformers
* JWT Authentication
* Role-Based Access Control
* Activity Logging
* RESTful API
* MySQL Integration
* Swagger API Documentation

---
