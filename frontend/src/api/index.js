
const API_BASE_URL = '/api';

const logRequest = (url, method = 'GET') => {
  console.log(`Making ${method} request to: ${url}`);
};

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

export const createTask = async (taskData) => {
  const url = `${API_BASE_URL}/tasks`;
  logRequest(url, 'POST');
  
  const requestBody = {
    name: taskData.name,
    game_type: taskData.game_type,
    start_date: taskData.start_date,
    end_date: taskData.end_date,
    metrics: taskData.metrics,
    characters: taskData.characters || [],
  };
  
  if (taskData.gameSources && taskData.gameSources.length > 0) {
    requestBody.gameSources = taskData.gameSources;
  }
  
  if (taskData.gameCharacters && Object.keys(taskData.gameCharacters).length > 0) {
    requestBody.gameCharacters = taskData.gameCharacters;
  }
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(requestBody),
  });
  return handleResponse(response);
};

export const fetchTaskResults = async (taskId, startDate = null, endDate = null, character = null) => {
  let url = `${API_BASE_URL}/tasks/${taskId}/results`;
  
  const params = new URLSearchParams();
  if (startDate) {
    params.append('start_date', startDate);
  }
  if (endDate) {
    params.append('end_date', endDate);
  }
  if (character && character !== 'all') {
    params.append('character', character);
  }
  
  const queryString = params.toString();
  if (queryString) {
    url = `${url}?${queryString}`;
  }
  
  logRequest(url);
  const response = await fetch(url, {
    headers: {
      'Accept': 'application/json'
    }
  });
  return handleResponse(response);
};

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
