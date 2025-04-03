from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse
import uvicorn
from sqlalchemy.orm import Session
from typing import List, Optional
import time
import random

from database import get_db, engine, Base
from models import Task, GameStatistic
from schemas import TaskCreate, TaskResponse, TaskResult
from task_queue import TaskQueue
from data_generator import generate_game_statistics

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Gaming Analytics API")

# Add CORS middleware with expanded origins for Replit environment
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "*",  # Allow all origins during development
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://*.replit.dev",  # Replit-specific domains
        "https://*.replit.app", 
        "https://*.repl.co"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

@app.get("/")
def root():
    """Root endpoint that redirects to API documentation"""
    return {"status": "success", "message": "Gaming Analytics API is running. Access the API at /api endpoints."}

# Create task queue
task_queue = TaskQueue()

# Background task to process analytics tasks
def process_analytics_task(task_id: int, db: Session):
    # Get the task
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        return
    
    # Update task status to in_progress
    task.status = "in_progress"
    db.commit()
    
    try:
        # Simulate processing time (in a real app, this would be actual data processing)
        processing_time = random.uniform(3, 8)  # Random time between 3 and 8 seconds
        time.sleep(processing_time)
        
        # Generate synthetic gaming data for this task
        game_stats = generate_game_statistics(
            task.game_type,
            task.start_date,
            task.end_date,
            task.metrics
        )
        
        # Store the generated data in the database
        for stat in game_stats:
            db_stat = GameStatistic(
                task_id=task.id,
                game=stat["game"],
                character=stat["character"],
                date=stat["date"],
                kills=stat.get("kills", 0),
                deaths=stat.get("deaths", 0),
                wins=stat.get("wins", 0),
                losses=stat.get("losses", 0),
                kd_ratio=stat.get("kd_ratio", 0),
                win_rate=stat.get("win_rate", 0)
            )
            db.add(db_stat)
        
        # Update task status to complete
        task.status = "complete"
        db.commit()
    except Exception as e:
        print(f"Error processing task {task_id}: {str(e)}")
        task.status = "failed"
        db.commit()

@app.post("/api/tasks", response_model=TaskResponse)
def create_task(task: TaskCreate, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Create a new analytics task"""
    # Create task in DB
    db_task = Task(
        name=task.name,
        game_type=task.game_type,
        start_date=task.start_date,
        end_date=task.end_date,
        metrics=task.metrics,
        status="pending"
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Add task processing to background tasks
    background_tasks.add_task(process_analytics_task, db_task.id, db)
    
    return db_task

@app.get("/api/tasks", response_model=List[TaskResponse])
def get_tasks(db: Session = Depends(get_db)):
    """Get all tasks"""
    return db.query(Task).all()

@app.get("/api/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """Get a specific task by ID"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@app.post("/api/tasks/{task_id}/cancel", response_model=TaskResponse)
def cancel_task(task_id: int, db: Session = Depends(get_db)):
    """Cancel a pending task"""
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending tasks can be cancelled")
    
    task.status = "cancelled"
    db.commit()
    db.refresh(task)
    return task

@app.get("/api/tasks/{task_id}/results", response_model=TaskResult)
def get_task_results(task_id: int, db: Session = Depends(get_db)):
    """Get results for a completed task"""
    # Check if task exists and is completed
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    if task.status != "complete":
        raise HTTPException(status_code=400, detail="Task is not completed yet")
    
    # Get stats for this task
    stats = db.query(GameStatistic).filter(GameStatistic.task_id == task_id).all()
    
    # Convert to response format
    result_data = []
    for stat in stats:
        result_data.append({
            "game": stat.game,
            "character": stat.character,
            "date": stat.date.strftime("%Y-%m-%d"),
            "kills": stat.kills,
            "deaths": stat.deaths,
            "wins": stat.wins,
            "losses": stat.losses,
            "kd_ratio": stat.kd_ratio,
            "win_rate": stat.win_rate
        })
    
    return {"task_id": task_id, "data": result_data}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
