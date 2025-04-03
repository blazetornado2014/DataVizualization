from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey, JSON
from sqlalchemy.orm import relationship
from database import Base

class Task(Base):
    """Database model for analytics tasks"""
    __tablename__ = "tasks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    game_type = Column(String, nullable=False)  # 'all', 'valorant', 'overwatch', etc. or 'custom'
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    metrics = Column(JSON, nullable=False)  # List of metrics to analyze
    characters = Column(JSON, nullable=True)  # List of specific characters to include (for simple filtering)
    gameSources = Column(JSON, nullable=True)  # List of game sources for advanced filtering
    gameCharacters = Column(JSON, nullable=True)  # Dict mapping game sources to character lists
    status = Column(String, nullable=False)  # 'pending', 'in_progress', 'complete', 'failed'
    
    statistics = relationship("GameStatistic", back_populates="task")


class GameStatistic(Base):
    """Database model for game statistics data"""
    __tablename__ = "game_statistics"
    
    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id"), nullable=False)
    game = Column(String, nullable=False)  # 'valorant', 'overwatch', 'lol', etc.
    character = Column(String, nullable=True)  # Game-specific character/hero/champion
    date = Column(Date, nullable=False)
    
    # Performance metrics
    kills = Column(Integer, default=0)
    deaths = Column(Integer, default=0)
    wins = Column(Integer, default=0)
    losses = Column(Integer, default=0)
    kd_ratio = Column(Float, default=0.0)
    win_rate = Column(Float, default=0.0)
    
    task = relationship("Task", back_populates="statistics")
