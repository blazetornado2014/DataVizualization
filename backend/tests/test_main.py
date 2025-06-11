import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from typing import Generator

from backend.main import app  # Assuming app is in backend.main
from backend.database import Base, get_db
from backend.models import Task, GameStatistic
from backend.schemas import TaskCreate # For creating tasks if needed
from unittest.mock import patch
import time
import logging

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


@patch('backend.main.generate_game_statistics')
def test_process_task_failure_and_logging(mock_generate_stats, caplog):
    # Configure the mock to raise an exception
    mock_generate_stats.side_effect = Exception("Simulated processing error")

    # Set logging level for caplog to capture ERROR messages
    caplog.set_level(logging.ERROR)

    # Create a new task
    task_payload = {
        "name": "Test Task for Failure",
        "game_type": "valorant",
        "start_date": "2024-01-01",
        "end_date": "2024-01-31",
        "metrics": ["kills", "deaths"],
        "characters": ["Jett"]  # Added valid characters list
    }
    response = client.post("/api/tasks", json=task_payload)
    assert response.status_code == 200 # Task creation should now succeed
    task_id = response.json()["id"]

    # Wait for the background task to likely complete (or fail)
    # TestClient processes background tasks after the response is returned.
    # A short sleep can help ensure it has run.
    time.sleep(0.5) # Using 0.5s, adjust if needed

    # Fetch the task details
    response = client.get(f"/api/tasks/{task_id}")
    assert response.status_code == 200
    task_data = response.json()
    assert task_data["status"] == "failed"

    # Verify logging
    assert "Error processing task" in caplog.text
    assert "Simulated processing error" in caplog.text

    # Check that an exception was logged (exc_info is present)
    assert len(caplog.records) > 0
    # Find the relevant log record
    error_log_record = None
    for record in caplog.records:
        if "Error processing task" in record.message and record.levelname == "ERROR":
            error_log_record = record
            break

    assert error_log_record is not None, "Error log record not found"
    assert error_log_record.exc_info is not None
    assert "Simulated processing error" in str(error_log_record.exc_info[1])


# Base payload for creating tasks in API tests
API_BASE_TASK_PAYLOAD = {
    "name": "API Test Task",
    "start_date": "2024-03-01",
    "end_date": "2024-03-28",
    "metrics": ["kills", "wins"]
}

def test_create_task_valorant_missing_characters_422():
    payload = API_BASE_TASK_PAYLOAD.copy()
    payload["game_type"] = "valorant"
    payload["characters"] = []

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 422
    response_json = response.json()
    assert "detail" in response_json
    found_error = False
    for error in response_json["detail"]:
        if "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in error["msg"]:
            found_error = True
            break
    assert found_error, "Specific error message not found in 422 response."

def test_create_task_overwatch_missing_characters_422():
    payload = API_BASE_TASK_PAYLOAD.copy()
    payload["game_type"] = "overwatch"
    # Testing with characters field omitted (should default to [] and fail validation)

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 422
    response_json = response.json()
    assert "detail" in response_json
    found_error = False
    for error in response_json["detail"]:
        if "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in error["msg"]:
            found_error = True
            break
    assert found_error, "Specific error message not found in 422 response."

def test_create_task_valorant_with_characters_succeeds():
    payload = API_BASE_TASK_PAYLOAD.copy()
    payload["game_type"] = "valorant"
    payload["characters"] = ["Jett", "Reyna"]

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 200 # Assuming 200 for successful creation
    response_json = response.json()
    assert response_json["name"] == "API Test Task"
    assert response_json["game_type"] == "valorant"
    assert response_json["characters"] == ["Jett", "Reyna"]
    assert response_json["status"] == "pending" # Default status

def test_create_task_overwatch_with_characters_succeeds():
    payload = API_BASE_TASK_PAYLOAD.copy()
    payload["game_type"] = "overwatch"
    payload["characters"] = ["Tracer", "Genji"]

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 200
    response_json = response.json()
    assert response_json["name"] == "API Test Task"
    assert response_json["game_type"] == "overwatch"
    assert response_json["characters"] == ["Tracer", "Genji"]
    assert response_json["status"] == "pending"

def test_create_task_other_game_type_empty_characters_succeeds():
    payload = API_BASE_TASK_PAYLOAD.copy()
    payload["game_type"] = "apex_legends"
    payload["characters"] = [] # Empty characters allowed for this game type

    response = client.post("/api/tasks", json=payload)

    assert response.status_code == 200
    response_json = response.json()
    assert response_json["name"] == "API Test Task"
    assert response_json["game_type"] == "apex_legends"
    assert response_json["characters"] == []
    assert response_json["status"] == "pending"

