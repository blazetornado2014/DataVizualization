import React, { useState, useEffect } from 'react';
import TaskCreationForm from './components/TaskCreationForm';
import TaskList from './components/TaskList';
import Dashboard from './components/Dashboard';
import { useTaskContext } from './contexts/TaskContext';

function App() {
  const [selectedTask, setSelectedTask] = useState(null);
  const { tasks, fetchTasks } = useTaskContext();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        await fetchTasks();
      } catch (error) {
        console.error("Failed to load initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
    
    // Set up polling for task status updates
    const intervalId = setInterval(() => {
      fetchTasks();
    }, 5000);

    return () => clearInterval(intervalId);
  }, [fetchTasks]);

  const handleTaskSelect = (task) => {
    setSelectedTask(task);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 shadow-lg">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-3xl font-orbitron text-purple-400 font-bold">
            Gaming Analytics Dashboard
          </h1>
          <p className="text-gray-400 mt-1">
            Track your performance across various games
          </p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Create Task Section - Full Width at Top */}
        <div className="bg-gray-800 rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-purple-400 font-orbitron">Create Task</h2>
          <TaskCreationForm />
        </div>
        
        {/* Main Content Grid - Task List and Dashboard */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-400 font-orbitron">Task Queue</h2>
              <TaskList onTaskSelect={handleTaskSelect} />
            </div>
          </div>
          
          <div className="lg:col-span-3">
            <div className="bg-gray-800 rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 text-purple-400 font-orbitron">Analytics Dashboard</h2>
              <Dashboard selectedTask={selectedTask} />
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-gray-800 mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-gray-400">
          <p>© 2023 Gaming Analytics Dashboard. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
