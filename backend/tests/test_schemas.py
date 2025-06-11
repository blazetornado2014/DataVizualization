import pytest
from pydantic import ValidationError
from datetime import date
from backend.schemas import TaskCreate

# Base valid data for task creation
BASE_TASK_DATA = {
    "name": "Test Task",
    "start_date": date(2024, 1, 1),
    "end_date": date(2024, 1, 31),
    "metrics": ["kills", "deaths"],
}

def test_valorant_overwatch_characters_required():
    # Test Valorant
    with pytest.raises(ValidationError) as excinfo_valorant_empty:
        TaskCreate(**BASE_TASK_DATA, game_type="valorant", characters=[])
    assert any(
        "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in err["msg"]
        for err in excinfo_valorant_empty.value.errors()
    )

    with pytest.raises(ValidationError) as excinfo_valorant_missing:
        # Create a copy of base data to avoid modifying it for other tests
        data = BASE_TASK_DATA.copy()
        data["game_type"] = "valorant"
        # 'characters' field is intentionally omitted, relying on default []
        TaskCreate(**data)
    assert any(
        "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in err["msg"]
        for err in excinfo_valorant_missing.value.errors()
    )

    # Test Overwatch
    with pytest.raises(ValidationError) as excinfo_overwatch_empty:
        TaskCreate(**BASE_TASK_DATA, game_type="overwatch", characters=[])
    assert any(
        "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in err["msg"]
        for err in excinfo_overwatch_empty.value.errors()
    )

    with pytest.raises(ValidationError) as excinfo_overwatch_missing:
        data = BASE_TASK_DATA.copy()
        data["game_type"] = "overwatch"
        TaskCreate(**data)
    assert any(
        "Characters must be provided for Valorant or Overwatch tasks and cannot be empty." in err["msg"]
        for err in excinfo_overwatch_missing.value.errors()
    )

def test_valorant_overwatch_characters_valid():
    # Valorant with characters
    task_valorant = TaskCreate(**BASE_TASK_DATA, game_type="valorant", characters=["Jett", "Sova"])
    assert task_valorant.game_type == "valorant"
    assert task_valorant.characters == ["Jett", "Sova"]

    # Overwatch with characters
    task_overwatch = TaskCreate(**BASE_TASK_DATA, game_type="overwatch", characters=["Tracer", "Reinhardt"])
    assert task_overwatch.game_type == "overwatch"
    assert task_overwatch.characters == ["Tracer", "Reinhardt"]

def test_other_game_types_characters_optional():
    # Apex Legends with empty characters
    task_apex = TaskCreate(**BASE_TASK_DATA, game_type="apex_legends", characters=[])
    assert task_apex.game_type == "apex_legends"
    assert task_apex.characters == []

    # Apex Legends with no characters field (should default to empty list)
    data_apex_no_chars = BASE_TASK_DATA.copy()
    data_apex_no_chars["game_type"] = "apex_legends"
    task_apex_no_chars = TaskCreate(**data_apex_no_chars)
    assert task_apex_no_chars.game_type == "apex_legends"
    assert task_apex_no_chars.characters == []

    # League of Legends with some characters
    task_lol = TaskCreate(**BASE_TASK_DATA, game_type="league_of_legends", characters=["Ahri"])
    assert task_lol.game_type == "league_of_legends"
    assert task_lol.characters == ["Ahri"]

    # Custom game type with empty characters (requires gameSources for its own validation)
    task_custom_empty_chars = TaskCreate(
        **BASE_TASK_DATA,
        game_type="custom",
        gameSources=["TestSource"],
        characters=[]
    )
    assert task_custom_empty_chars.game_type == "custom"
    assert task_custom_empty_chars.characters == []

    # Custom game type with no characters field
    task_custom_no_chars = TaskCreate(
        **BASE_TASK_DATA,
        game_type="custom",
        gameSources=["TestSource"]
        # characters field omitted
    )
    assert task_custom_no_chars.game_type == "custom"
    assert task_custom_no_chars.characters == []
