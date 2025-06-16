
# Gaming Dashboard

## Overview
A full-stack analytics dashboard for gamers to visualize and analyze performance statistics across multiple games (Valorant, Overwatch, League of Legends). The application provides real-time tracking, interactive visualizations, and customizable analytics.

## Features
- Multi-game statistics tracking
- Real-time task status updates
- Interactive D3.js visualizations
- Custom filtering options
- Character-specific analytics
- Date range selection
- Background task processing

## Tech Stack
- Frontend: React.js + D3.js + Vite
- Backend: FastAPI (Python)
- Database: SQLite with SQLAlchemy ORM
- Styling: Tailwind CSS

## Project Structure
```
├── frontend/               # React frontend application
│   ├── src/               # Source code
│   │   ├── components/    # React components
│   │   ├── contexts/      # React contexts
│   │   ├── api/          # API integration
│   │   └── utils/        # Utility functions
├── backend/               # FastAPI backend
│   ├── main.py           # Main application entry
│   ├── models.py         # Database models
│   └── schemas.py        # Pydantic schemas
```

## Setup and Installation

1. Clone the repository

2. Install frontend dependencies:
   ```bash
   # Navigate to frontend directory
   cd frontend
   
   # Install React, D3.js and other dependencies
   npm install react react-dom d3
   npm install @vitejs/plugin-react
   npm install @mui/material @emotion/react @emotion/styled
   ```

3. Install backend dependencies:
   ```bash
   # Navigate to backend directory
   cd backend
   
   # Install FastAPI and required packages
   pip install fastapi uvicorn 
   pip install pydantic python-dateutil sqlalchemy
   
   # Or install all dependencies at once using requirements.txt
   pip install -r requirements.txt
   ```

## Running the Application

1. Start the backend server:
   ```bash
   cd backend
   python main.py
   ```
   Server runs on port 8000

2. Start the frontend development server:
   ```bash
   cd frontend
   npm run dev
   ```
   Frontend runs on port 5000

## API Endpoints

### Tasks
- `GET /api/tasks` - List all tasks
- `POST /api/tasks` - Create new task
- `GET /api/tasks/{task_id}` - Get task details
- `POST /api/tasks/{task_id}/cancel` - Cancel task
- `GET /api/tasks/{task_id}/results` - Get task results

## Data Visualization

The dashboard includes two main types of visualizations:
1. Line Charts: Track performance metrics over time
2. Bar Charts: Compare aggregated statistics

## Task Processing System

Tasks go through the following states:
- Pending
- In Progress
- Complete
- Failed
- Cancelled

## Character Support

Supports characters from:
- Valorant
- Overwatch
- League of Legends

## Performance Metrics

Available metrics include:
- Kills
- Deaths
- K/D Ratio
- Win Rate
- Wins/Losses

## Browser Compatibility

Tested and supported on:
- Chrome (latest)
- Firefox (latest)
- Edge (latest)
