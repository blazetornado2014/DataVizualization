// API functions for interacting with the backend

// Base URL for API requests
const API_BASE_URL = '/api';

// Helper function for handling API responses
const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    throw new Error(error.detail || 'An error occurred');
  }
  return response.json();
};

// Get all tasks
export const fetchTasks = async () => {
  const response = await fetch(`${API_BASE_URL}/tasks`);
  return handleResponse(response);
};

// Get a specific task
export const fetchTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}`);
  return handleResponse(response);
};

// Create a new task
export const createTask = async (taskData) => {
  const response = await fetch(`${API_BASE_URL}/tasks`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: taskData.taskName,
      game_type: taskData.gameType,
      start_date: taskData.startDate,
      end_date: taskData.endDate,
      metrics: taskData.metrics,
    }),
  });
  return handleResponse(response);
};

// Get task results
export const fetchTaskResults = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/results`);
  return handleResponse(response);
};

// Cancel a task
export const cancelTask = async (taskId) => {
  const response = await fetch(`${API_BASE_URL}/tasks/${taskId}/cancel`, {
    method: 'POST',
  });
  return handleResponse(response);
};
