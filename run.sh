#!/bin/bash

# Start the backend server in the background
cd backend
python -m uvicorn main:app --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!

# Give the backend a moment to start up
sleep 2

# Start the frontend (this will block)
cd ../frontend
npm run dev

# If frontend exits, kill the backend
kill $BACKEND_PID