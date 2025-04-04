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
      setTasks(prevTasks => [...prevTasks, newTask]);
      await new Promise(resolve => setTimeout(resolve, 2000));
      return newTask;
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

  const value = {
    tasks,
    isLoading,
    error,
    fetchTasks,
    createTask,
    cancelTask,
  };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}
