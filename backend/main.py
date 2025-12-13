from fastapi import FastAPI, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, database

models.Base.metadata.create_all(bind=database.engine)

app = FastAPI()

# CORS configuration
# CORS configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://minapplications-frontend.onrender.com", # Predicted Render URL
    "*", # Allow all for simplicity during initial deployment
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency
def get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/applications", response_model=List[schemas.Application])
def read_applications(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    applications = db.query(models.Application).offset(skip).limit(limit).all()
    return applications

@app.post("/applications", response_model=schemas.Application)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    db_application = models.Application(**application.dict())
    db.add(db_application)
    db.commit()
    db.refresh(db_application)
    return db_application

@app.get("/suggestions", response_model=List[schemas.Suggestion])
def read_suggestions(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Sort by upvotes descending
    suggestions = db.query(models.Suggestion).order_by(models.Suggestion.upvotes.desc()).offset(skip).limit(limit).all()
    return suggestions

@app.post("/suggestions", response_model=schemas.Suggestion)
def create_suggestion(suggestion: schemas.SuggestionCreate, db: Session = Depends(get_db)):
    db_suggestion = models.Suggestion(**suggestion.dict())
    db.add(db_suggestion)
    db.commit()
    db.refresh(db_suggestion)
    return db_suggestion

@app.post("/suggestions/{suggestion_id}/vote")
def vote_suggestion(suggestion_id: int, vote_type: str, user_id: str, db: Session = Depends(get_db)):
    # vote_type: 'up' or 'down'
    suggestion = db.query(models.Suggestion).filter(models.Suggestion.id == suggestion_id).first()
    if not suggestion:
        raise HTTPException(status_code=404, detail="Suggestion not found")
    
    # Check for existing vote
    existing_vote = db.query(models.Vote).filter(
        models.Vote.suggestion_id == suggestion_id,
        models.Vote.user_id == user_id
    ).first()

    if existing_vote:
        if existing_vote.vote_type == vote_type:
            # Toggle off (remove vote)
            db.delete(existing_vote)
            if vote_type == "up":
                suggestion.upvotes -= 1
            else:
                suggestion.downvotes -= 1
        else:
            # Change vote type
            if existing_vote.vote_type == "up":
                suggestion.upvotes -= 1
                suggestion.downvotes += 1
            else:
                suggestion.downvotes -= 1
                suggestion.upvotes += 1
            existing_vote.vote_type = vote_type
    else:
        # New vote
        new_vote = models.Vote(suggestion_id=suggestion_id, user_id=user_id, vote_type=vote_type)
        db.add(new_vote)
        if vote_type == "up":
            suggestion.upvotes += 1
        else:
            suggestion.downvotes += 1
    
    db.commit()
    return {"message": "Vote recorded", "upvotes": suggestion.upvotes, "downvotes": suggestion.downvotes}

from fastapi import File, UploadFile
from fastapi.responses import FileResponse
from pdf2docx import Converter
import shutil
import os
import uuid

@app.post("/convert/pdf-to-word")
def convert_pdf_to_word(file: UploadFile = File(...)):
    # Create unique temp directory
    temp_dir = f"temp_{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    try:
        pdf_path = os.path.join(temp_dir, file.filename)
        docx_filename = os.path.splitext(file.filename)[0] + ".docx"
        docx_path = os.path.join(temp_dir, docx_filename)
        
        # Save uploaded PDF
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Convert PDF to DOCX
        cv = Converter(pdf_path)
        cv.convert(docx_path, start=0, end=None)
        cv.close()
        
        # Return file (background task to cleanup would be ideal, but for now we rely on OS or manual cleanup if needed. 
        # Better: read to memory or use BackgroundTasks for cleanup)
        return FileResponse(docx_path, filename=docx_filename, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
        
    except Exception as e:
        shutil.rmtree(temp_dir) # Cleanup on error
        raise HTTPException(status_code=500, detail=str(e))

    # Note: FastAPIs FileResponse doesn't auto-delete file after sending by default without BackgroundTask. 
    # For a simple local app, we'll let it be or use a background task to cleanup *after* response.
    # To fix cleanup:
    
from fastapi import BackgroundTasks

@app.post("/convert/pdf-to-word-clean")
def convert_pdf_to_word_clean(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    # Create unique temp directory
    temp_dir = f"temp_{uuid.uuid4()}"
    os.makedirs(temp_dir, exist_ok=True)
    
    unique_filename = f"{uuid.uuid4()}_{file.filename}"
    pdf_path = os.path.join(temp_dir, unique_filename)
    docx_filename = os.path.splitext(file.filename)[0] + ".docx"
    docx_path = os.path.join(temp_dir, docx_filename)
    
    try:
        with open(pdf_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        cv = Converter(pdf_path)
        cv.convert(docx_path)
        cv.close()
        
        # Add cleanup task
        background_tasks.add_task(shutil.rmtree, temp_dir)
        
        return FileResponse(docx_path, filename=docx_filename, media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
    except Exception as e:
        if os.path.exists(temp_dir):
            shutil.rmtree(temp_dir)
        raise HTTPException(status_code=500, detail=str(e))
