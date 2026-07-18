from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


class RoleSchema(BaseModel):
    id: int
    name: str

    class Config:
        from_attributes = True


class RoleCreateSchema(BaseModel):
    name: str

    class Config:
        from_attributes = True


class UserSchema(BaseModel):
    id: int
    name: str
    email: str
    role_id: int

    class Config:
        from_attributes = True


class UserRegisterSchema(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: str  

    class Config:
        from_attributes = True


class LoginSchema(BaseModel):
    email: EmailStr
    password: str


class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"


class DocumentSchema(BaseModel):
    id: int
    title: str
    filename: str
    file_path: str
    uploaded_by: int
    uploaded_at: datetime

    class Config:
        from_attributes = True


class TextchunksSchema(BaseModel):
    id: int
    document_id: int
    chunk_index: int
    chunk_text: str

    class Config:
        from_attributes = True


class TaskSchema(BaseModel):
    id: int
    title: str
    description: str
    status: str
    assigned_to: int
    created_by: int
    created_at: datetime

    class Config:
        from_attributes = True


class TaskCreateSchema(BaseModel):
    title: str
    description: str
    assigned_to: int

    class Config:
        from_attributes = True


class TaskUpdateSchema(BaseModel):
    status: str 

class ActivityLogSchema(BaseModel):
    id: int
    user_id: int
    action: str
    details: str
    created_at: datetime

    class Config:
        from_attributes = True