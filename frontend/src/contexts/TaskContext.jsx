import React, { createContext, useContext, useState, useCallback } from 'react';
import * as api from '../api';

const TaskContext = createContext();

export function useTaskContext() {
  return useContext(TaskContext);
}

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const [selectedTaskResults, setSelectedTaskResults] = useState(null);
  const [isResultsLoading, setIsResultsLoading] = useState(false);
  const [resultsError, setResultsError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const taskData = await api.fetchTasks();
      setTasks(taskData);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createTask = useCallback(async (taskData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTask = await api.createTask(taskData);
      // setTasks(prevTasks => [...prevTasks, newTask]); // Remove this line
      fetchTasks(); // Add this line to re-fetch all tasks
      return newTask; // Still return the newTask object so UI can potentially use it
    } catch (err) {
      console.error('Error creating task:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const cancelTask = useCallback(async (taskId) => {
    setIsLoading(true);
    setError(null);
    
    try {
      await api.cancelTask(taskId);
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, status: 'cancelled' }
            : task
        )
      );
    } catch (err) {
      console.error('Error cancelling task:', err);
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAndSetTaskResults = useCallback(async (taskId, startDate, endDate, character) => {
    if (!taskId) {
      setSelectedTaskResults(null);
      return;
    }
    setIsResultsLoading(true);
    setResultsError(null);
    try {
      const results = await api.fetchTaskResults(taskId, startDate, endDate, character);
      setSelectedTaskResults(results);
    } catch (err) {
      console.error('Error fetching task results:', err);
      setResultsError(err.message);
      setSelectedTaskResults(null); // Clear results on error
    } finally {
      setIsResultsLoading(false);
    }
  }, []);

  const value = {
    tasks,
    isLoading, // for tasks list
    error,     // for tasks list
    fetchTasks,
    createTask,
    cancelTask,
    selectedTaskResults, // New
    isResultsLoading,    // New
    resultsError,        // New
    fetchAndSetTaskResults, // New
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
