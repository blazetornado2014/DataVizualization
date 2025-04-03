// API functions for interacting with the backend

// Base URL for API requests - simplified to work in Replit
// We'll use a simple relative path approach, and let the Vite proxy handle it
const API_BASE_URL = '/api';

// Add debugging logs to track API requests
const logRequest = (url, method = 'GET') => {
  console.log(`Making ${method} request to: ${url}`);
};

// Helper function for handling API responses
const handleResponse = async (response) => {
  console.log('Response status:', response.status);
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      detail: `HTTP error ${response.status}`,
    }));
    console.error('API Error:', error);
    throw new Error(error.detail || 'An error occurred');
  }
  return response.json();
};

// Get all tasks
export const fetchTasks = async () => {
  const url = `${API_BASE_URL}/tasks`;
  logRequest(url);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};

// Get a specific task
export const fetchTask = async (taskId) => {
  const url = `${API_BASE_URL}/tasks/${taskId}`;
  logRequest(url);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};

// Create a new task
export const createTask = async (taskData) => {
  const url = `${API_BASE_URL}/tasks`;
  logRequest(url, 'POST');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
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
  const url = `${API_BASE_URL}/tasks/${taskId}/results`;
  logRequest(url);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};

// Cancel a task
export const cancelTask = async (taskId) => {
  const url = `${API_BASE_URL}/tasks/${taskId}/cancel`;
  logRequest(url, 'POST');
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};
