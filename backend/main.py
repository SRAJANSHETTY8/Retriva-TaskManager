import os
from collections import Counter

from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base, get_db
from model import Role, User, Document, Textchunks, Task, ActivityLog
from schema import (
    RoleSchema, UserSchema, UserRegisterSchema, LoginSchema, TokenSchema,
    DocumentSchema, TextchunksSchema,
    TaskSchema, TaskCreateSchema, TaskUpdateSchema,
    ActivityLogSchema,
)
from auth import (
    hash_password, verify_password, create_access_token,
    get_current_user, get_current_admin,
)
from embeddings import extract_text, chunk_text, embed_text, vector_store

app = FastAPI(title="AI Task & Knowledge Management System")

Base.metadata.create_all(bind=engine)


def log_activity(db: Session, user_id: int, action: str, details: str):
    entry = ActivityLog(user_id=user_id, action=action, details=details)
    db.add(entry)
    db.commit()



app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

Base.metadata.create_all(bind=engine)

@app.get('/')
def start_up():
    return "initization_sucess"


@app.on_event("startup")
def seed_roles():
    db = next(get_db())
    for role_name in ["admin", "user"]:
        exists = db.query(Role).filter(Role.name == role_name).first()
        if not exists:
            db.add(Role(name=role_name))
    db.commit()
    db.close()


@app.get('/roles', response_model=list[RoleSchema])
def get_roles(db: Session = Depends(get_db)):
    return db.query(Role).all()


@app.post('/auth/register', response_model=UserSchema)
def register(payload: UserRegisterSchema, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == payload.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    role = db.query(Role).filter(Role.name == payload.role).first()
    if not role:
        raise HTTPException(status_code=400, detail="Role must be 'admin' or 'user'")

    user = User(
        name=payload.name,
        email=payload.email,
        password=hash_password(payload.password),
        role_id=role.id,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@app.post('/auth/login', response_model=TokenSchema)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")

    role = db.query(Role).filter(Role.id == user.role_id).first()
    token = create_access_token({"user_id": user.id, "role": role.name if role else None})

    log_activity(db, user.id, "login", f"{user.email} logged in")

    return {"access_token": token, "token_type": "bearer"}


@app.get('/documents', response_model=list[DocumentSchema])
def get_documents(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(Document).all()


@app.get('/documents/{id}', response_model=DocumentSchema)
def get_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    data = db.query(Document).filter(Document.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Not found")
    return data


@app.post('/documents')
def upload_document(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_admin),  
):
    if file.content_type not in ["application/pdf", "text/plain"]:
        raise HTTPException(status_code=400, detail="Only PDF and TXT files are allowed.")

    os.makedirs("uploads", exist_ok=True)
    file_path = f"uploads/{file.filename}"

    with open(file_path, "wb") as buffer:
        buffer.write(file.file.read())

    document = Document(
        title=os.path.splitext(file.filename)[0],
        filename=file.filename,
        file_path=file_path,
        uploaded_by=current_user.id,
    )
    db.add(document)
    db.commit()
    db.refresh(document)

    
    raw_text = extract_text(file_path, file.content_type)
    chunks = chunk_text(raw_text)

    for index, chunk in enumerate(chunks):
        chunk_row = Textchunks(document_id=document.id, chunk_index=index, chunk_text=chunk)
        db.add(chunk_row)
        db.commit()
        db.refresh(chunk_row)

        vector = embed_text(chunk)
        vector_store.add(chunk_row.id, vector)

    log_activity(db, current_user.id, "document_upload", f"Uploaded '{file.filename}' ({len(chunks)} chunks)")

    return {
        "message": "Document uploaded and processed successfully",
        "document": DocumentSchema.model_validate(document),
        "chunks_created": len(chunks),
    }


@app.delete('/documents/{id}')
def delete_document(id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    data = db.query(Document).filter(Document.id == id).first()
    if not data:
        raise HTTPException(status_code=404, detail="Not found")

    db.query(Textchunks).filter(Textchunks.document_id == id).delete()
    db.delete(data)
    db.commit()
    return {"message": "Document deleted successfully"}


@app.get('/search')
def search(query: str, top_k: int = 5, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")

    query_vector = embed_text(query)
    matches = vector_store.search(query_vector, top_k=top_k)

    results = []
    for chunk_id, distance in matches:
        chunk = db.query(Textchunks).filter(Textchunks.id == chunk_id).first()
        if not chunk:
            continue
        document = db.query(Document).filter(Document.id == chunk.document_id).first()
        results.append({
            "document_id": chunk.document_id,
            "document_title": document.title if document else None,
            "chunk_text": chunk.chunk_text,
            "score": distance, 
        })

    log_activity(db, current_user.id, "search", query)

    return {"query": query, "results": results}


@app.post('/tasks', response_model=TaskSchema)
def create_task(payload: TaskCreateSchema, db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    assignee = db.query(User).filter(User.id == payload.assigned_to).first()
    if not assignee:
        raise HTTPException(status_code=400, detail="assigned_to user does not exist")

    task = Task(
        title=payload.title,
        description=payload.description,
        status="Pending",
        assigned_to=payload.assigned_to,
        created_by=current_user.id,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@app.get('/tasks', response_model=list[TaskSchema])
def get_tasks(
    status: str | None = None,
    assigned_to: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Task)

    
    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    if role and role.name != "admin":
        query = query.filter(Task.assigned_to == current_user.id)
    elif assigned_to is not None:
        query = query.filter(Task.assigned_to == assigned_to)

    if status is not None:
        query = query.filter(Task.status == status)

    return query.all()


@app.put('/tasks/{id}', response_model=TaskSchema)
def update_task_status(
    id: int,
    payload: TaskUpdateSchema,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(Task).filter(Task.id == id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    role = db.query(Role).filter(Role.id == current_user.role_id).first()
    is_admin = role and role.name == "admin"

    if not is_admin and task.assigned_to != current_user.id:
        raise HTTPException(status_code=403, detail="You can only update tasks assigned to you")

    if payload.status not in ["Pending", "Completed"]:
        raise HTTPException(status_code=400, detail="status must be 'Pending' or 'Completed'")

    task.status = payload.status
    db.commit()
    db.refresh(task)

    log_activity(db, current_user.id, "task_update", f"Task {task.id} set to {task.status}")

    return task


@app.get('/activity-logs', response_model=list[ActivityLogSchema])
def get_activity_logs(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    return db.query(ActivityLog).order_by(ActivityLog.created_at.desc()).all()


@app.get('/analytics')
def get_analytics(db: Session = Depends(get_db), current_user: User = Depends(get_current_admin)):
    total_tasks = db.query(Task).count()
    completed_tasks = db.query(Task).filter(Task.status == "Completed").count()
    pending_tasks = db.query(Task).filter(Task.status == "Pending").count()

    search_logs = db.query(ActivityLog).filter(ActivityLog.action == "search").all()
    query_counts = Counter(log.details for log in search_logs)
    most_searched = [{"query": q, "count": c} for q, c in query_counts.most_common(5)]

    return {
        "total_tasks": total_tasks,
        "completed_tasks": completed_tasks,
        "pending_tasks": pending_tasks,
        "most_searched_queries": most_searched,
    }