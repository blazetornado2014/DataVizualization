import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import DateRangeFilter from './DateRangeFilter';
import GameSelectionFilter from './GameSelectionFilter';

function TaskCreationForm() {
  const { createTask } = useTaskContext();
  const [formData, setFormData] = useState({
    taskName: '',
    gameType: 'all',
    startDate: '',
    endDate: '',
    metrics: ['kills', 'deaths', 'wins'],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (dateType, date) => {
    setFormData({
      ...formData,
      [dateType]: date,
    });
  };

  const handleGameTypeChange = (gameType) => {
    setFormData({
      ...formData,
      gameType,
    });
  };

  const handleMetricsChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setFormData({
        ...formData,
        metrics: [...formData.metrics, value],
      });
    } else {
      setFormData({
        ...formData,
        metrics: formData.metrics.filter(metric => metric !== value),
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      // Validate form
      if (!formData.taskName.trim()) {
        throw new Error('Task name is required');
      }

      if (!formData.startDate || !formData.endDate) {
        throw new Error('Date range is required');
      }

      if (new Date(formData.startDate) > new Date(formData.endDate)) {
        throw new Error('Start date must be before end date');
      }

      if (formData.metrics.length === 0) {
        throw new Error('At least one metric must be selected');
      }

      await createTask(formData);
      
      // Reset form
      setFormData({
        taskName: '',
        gameType: 'all',
        startDate: '',
        endDate: '',
        metrics: ['kills', 'deaths', 'wins'],
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900 text-white p-3 rounded-md">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-900 text-white p-3 rounded-md">
          Task created successfully!
        </div>
      )}
      
      <div>
        <label htmlFor="taskName" className="block text-sm font-medium text-gray-300 mb-1">
          Task Name
        </label>
        <input
          type="text"
          id="taskName"
          name="taskName"
          value={formData.taskName}
          onChange={handleInputChange}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder="Performance Analysis Q2"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Game Type
        </label>
        <GameSelectionFilter 
          selectedGame={formData.gameType} 
          onGameChange={handleGameTypeChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Date Range
        </label>
        <DateRangeFilter
          startDate={formData.startDate}
          endDate={formData.endDate}
          onDateChange={handleDateChange}
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Metrics to Track
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metric-kills"
              value="kills"
              checked={formData.metrics.includes('kills')}
              onChange={handleMetricsChange}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 rounded"
            />
            <label htmlFor="metric-kills" className="ml-2 text-sm text-gray-300">
              Kills
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metric-deaths"
              value="deaths"
              checked={formData.metrics.includes('deaths')}
              onChange={handleMetricsChange}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 rounded"
            />
            <label htmlFor="metric-deaths" className="ml-2 text-sm text-gray-300">
              Deaths
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metric-wins"
              value="wins"
              checked={formData.metrics.includes('wins')}
              onChange={handleMetricsChange}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 rounded"
            />
            <label htmlFor="metric-wins" className="ml-2 text-sm text-gray-300">
              Wins
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metric-kd"
              value="kd_ratio"
              checked={formData.metrics.includes('kd_ratio')}
              onChange={handleMetricsChange}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 rounded"
            />
            <label htmlFor="metric-kd" className="ml-2 text-sm text-gray-300">
              KD Ratio
            </label>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="metric-winrate"
              value="win_rate"
              checked={formData.metrics.includes('win_rate')}
              onChange={handleMetricsChange}
              className="h-4 w-4 text-purple-500 focus:ring-purple-400 rounded"
            />
            <label htmlFor="metric-winrate" className="ml-2 text-sm text-gray-300">
              Win Rate
            </label>
          </div>
        </div>
      </div>
      
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 
          ${isSubmitting 
            ? 'bg-gray-600 cursor-not-allowed' 
            : 'bg-purple-600 hover:bg-purple-700'}`}
      >
        {isSubmitting ? 'Creating...' : 'Create Analytics Task'}
      </button>
    </form>
  );
}

export default TaskCreationForm;
