from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker,declarative_base
from dotenv import load_dotenv
import os
load_dotenv()

DATBASE_URL=os.getenv("DATABASE_URL")
engine=create_engine(DATBASE_URL)
SessionLocal=sessionmaker(autoflush=False,autocommit=False,bind=engine)
Base=declarative_base()

def get_db():
    db=SessionLocal()
    try:
        yield db
    finally:
        db.close()