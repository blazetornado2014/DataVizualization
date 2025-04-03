from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import date

class TaskBase(BaseModel):
    """Base schema for Task"""
    name: str
    game_type: str
    start_date: date
    end_date: date
    metrics: List[str]
    
    @validator('end_date')
    def end_date_must_be_after_start_date(cls, v, values):
        if 'start_date' in values and v < values['start_date']:
            raise ValueError('end_date must be after start_date')
        return v
    
    @validator('game_type')
    def validate_game_type(cls, v):
        valid_game_types = ['all', 'valorant', 'overwatch', 'lol', 'apex', 'fortnite']
        if v not in valid_game_types:
            raise ValueError(f'game_type must be one of {valid_game_types}')
        return v
    
    @validator('metrics')
    def validate_metrics(cls, v):
        valid_metrics = ['kills', 'deaths', 'wins', 'kd_ratio', 'win_rate']
        for metric in v:
            if metric not in valid_metrics:
                raise ValueError(f'metrics must contain only valid values: {valid_metrics}')
        return v

class TaskCreate(TaskBase):
    """Schema for creating a new Task"""
    pass

class TaskResponse(TaskBase):
    """Schema for Task response"""
    id: int
    status: str
    
    class Config:
        orm_mode = True

class GameStatisticBase(BaseModel):
    """Base schema for game statistics data"""
    game: str
    character: Optional[str] = None
    date: str
    kills: Optional[int] = 0
    deaths: Optional[int] = 0
    wins: Optional[int] = 0
    losses: Optional[int] = 0
    kd_ratio: Optional[float] = 0.0
    win_rate: Optional[float] = 0.0

class TaskResult(BaseModel):
    """Schema for task results"""
    task_id: int
    data: List[Dict[str, Any]]
    
    class Config:
        orm_mode = True
