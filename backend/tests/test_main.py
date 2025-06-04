import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from backend.main import app  # Assuming app is in backend.main
from backend.database import Base, get_db
from backend.models import Task, GameStatistic
from backend.schemas import TaskCreate # For creating tasks if needed

# Test database URL (SQLite in-memory)
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in the test database
Base.metadata.create_all(bind=engine)

# Dependency override for test database session
def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

from datetime import date # Added import

# Fixture to clean up database tables after each test
@pytest.fixture(autouse=True)
def cleanup_database():
    yield
    # Clean up database tables after each test
    for table in reversed(Base.metadata.sorted_tables):
        with engine.connect() as connection:
            connection.execute(table.delete())
            connection.commit()


def test_delete_task_success():
    # 1. Create a task
    db = TestingSessionLocal()
    test_task = Task(
        name="Test Task for Deletion",
        game_type="test_game",
        status="pending",
        start_date=date(2024, 1, 1),
        end_date=date(2024, 1, 31),
        metrics=["kills", "deaths"]
    )
    db.add(test_task)
    db.commit()
    db.refresh(test_task)
    task_id = test_task.id
    current_date = date(2024, 1, 15) # Define a date to use for stats

    # Add some game statistics for this task
    stat1 = GameStatistic(task_id=task_id, game="test_game", character="charA", date=current_date, kills=10)
    stat2 = GameStatistic(task_id=task_id, game="test_game", character="charB", date=current_date, deaths=5)
    db.add_all([stat1, stat2])
    db.commit()

    # 2. Call the DELETE endpoint
    response = client.delete(f"/api/tasks/{task_id}")

    # 3. Assert response
    assert response.status_code == 200
    assert response.json() == {"message": "Task deleted successfully"}

    # 4. Assert task and stats are deleted from DB
    deleted_task = db.query(Task).filter(Task.id == task_id).first()
    assert deleted_task is None

    associated_stats = db.query(GameStatistic).filter(GameStatistic.task_id == task_id).all()
    assert len(associated_stats) == 0

    db.close()

def test_delete_task_not_found():
    non_existent_task_id = 99999
    response = client.delete(f"/api/tasks/{non_existent_task_id}")

    assert response.status_code == 404
    assert response.json() == {"detail": "Task not found"}

# Placeholder for root endpoint test to ensure setup is okay
def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "success", "message": "Gaming Analytics API is running. Access the API at /api endpoints."}
