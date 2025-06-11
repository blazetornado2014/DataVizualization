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


@patch('backend.main.generate_game_statistics')
def test_task_processing_calculates_ratios_correctly(mock_generate_stats):
    # Define mock data from generate_game_statistics
    mock_stat_date = date(2024, 3, 10)
    raw_stats_data = [
        {'game': 'test_game', 'character': 'charA', 'date': mock_stat_date, 'kills': 10, 'deaths': 5, 'wins': 2, 'losses': 1}, # KD: 2.0, WR: 0.666...
        {'game': 'test_game', 'character': 'charB', 'date': mock_stat_date, 'kills': 5, 'deaths': 0, 'wins': 1, 'losses': 0},  # KD: 5.0, WR: 1.0
        {'game': 'test_game', 'character': 'charC', 'date': mock_stat_date, 'kills': 0, 'deaths': 0, 'wins': 0, 'losses': 1},  # KD: 0.0, WR: 0.0
        {'game': 'test_game', 'character': 'charD', 'date': mock_stat_date, 'kills': 3, 'deaths': 3, 'wins': 0, 'losses': 0},  # KD: 1.0, WR: 0.0
        {'game': 'test_game', 'character': 'charE', 'date': mock_stat_date, 'kills': 0, 'deaths': 5, 'wins': 0, 'losses': 2},  # KD: 0.0, WR: 0.0
    ]
    mock_generate_stats.return_value = raw_stats_data

    # Create a task that will use these stats
    task_payload = {
        "name": "Ratio Calculation Test Task",
        "game_type": "valorant", # Use a valid game_type for schema validation
        "start_date": mock_stat_date.isoformat(),
        "end_date": mock_stat_date.isoformat(),
        "metrics": ["kills", "deaths", "wins", "losses", "kd_ratio", "win_rate"], # Include ratios
        "characters": ["charA", "charB", "charC", "charD", "charE"]
    }
    response = client.post("/api/tasks", json=task_payload)
    if response.status_code == 422:
        print("422 Error Response JSON:", response.json()) # Print details on 422
    assert response.status_code == 200
    task_id = response.json()["id"]

    # Wait for background task processing
    time.sleep(1) # Increased sleep time slightly for safety

    # Fetch processed stats from the database
    db = TestingSessionLocal()
    processed_stats = db.query(GameStatistic).filter(GameStatistic.task_id == task_id).order_by(GameStatistic.character).all()

    assert len(processed_stats) == len(raw_stats_data)

    expected_ratios = [
        {'character': 'charA', 'kd_ratio': 2.0, 'win_rate': 2.0 / 3.0},
        {'character': 'charB', 'kd_ratio': 5.0, 'win_rate': 1.0},
        {'character': 'charC', 'kd_ratio': 0.0, 'win_rate': 0.0},
        {'character': 'charD', 'kd_ratio': 1.0, 'win_rate': 0.0},
        {'character': 'charE', 'kd_ratio': 0.0, 'win_rate': 0.0},
    ]

    for i, p_stat in enumerate(processed_stats):
        assert p_stat.character == expected_ratios[i]['character']
        assert p_stat.kills == raw_stats_data[i]['kills'] # Verify raw data is stored correctly too
        assert p_stat.deaths == raw_stats_data[i]['deaths']
        assert p_stat.wins == raw_stats_data[i]['wins']
        assert p_stat.losses == raw_stats_data[i]['losses']

        assert p_stat.kd_ratio == pytest.approx(expected_ratios[i]['kd_ratio'])
        assert p_stat.win_rate == pytest.approx(expected_ratios[i]['win_rate'])

    db.close()
