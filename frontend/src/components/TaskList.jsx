import React from 'react';
import { useTaskContext } from '../contexts/TaskContext';

function TaskList({ onTaskSelect }) {
  const { tasks, isLoading, error } = useTaskContext();

  const getStatusBadge = (status) => {
    const baseClasses = "status-badge";
    switch (status) {
      case 'pending':
        return (
          <span className={`${baseClasses} status-pending`}>
            Pending
          </span>
        );
      case 'in_progress':
        return (
          <span className={`${baseClasses} status-in-progress`}>
            Processing
          </span>
        );
      case 'complete':
        return (
          <span className={`${baseClasses} status-complete`}>
            Complete
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} status-failed`}>
            Failed
          </span>
        );
      default:
        return (
          <span className={`${baseClasses} status-default`}>
            Unknown
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-gray-700 p-4 rounded-md mb-3 h-20"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-white p-4 rounded-md">
        <p>Error loading tasks: {error}</p>
        <p className="text-sm mt-2">Please try refreshing the page.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="bg-gray-700 text-gray-300 p-4 rounded-md text-center">
        <p>No tasks created yet.</p>
        <p className="text-sm mt-2">Create your first analytics task above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
      {tasks.map((task) => (
        <div 
          key={task.id} 
          className={`bg-gray-700 p-4 rounded-md hover:bg-gray-600 cursor-pointer transition duration-200 border-l-4 ${
            task.status === 'complete' ? 'border-green-500' : 
            task.status === 'in_progress' ? 'border-blue-500' : 
            task.status === 'failed' ? 'border-red-500' : 'border-gray-500'
          }`}
          onClick={() => onTaskSelect(task)}
        >
          <div className="flex justify-between items-start">
            <h3 className="font-medium">{task.name}</h3>
            {getStatusBadge(task.status)}
          </div>
          
          <div className="mt-2 text-sm text-gray-400">
            <p>Game: {task.game_type === 'all' ? 'All Games' : task.game_type}</p>
            <p className="mt-1">
              {new Date(task.start_date).toLocaleDateString()} to {new Date(task.end_date).toLocaleDateString()}
            </p>
          </div>
          
          {task.status === 'complete' && (
            <div className="mt-2 text-xs text-green-400">
              Click to view results
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default TaskList;
