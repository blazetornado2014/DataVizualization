import React, { useState, useEffect } from 'react';
import { useTaskContext } from '../contexts/TaskContext'; // Add this if not already present, or ensure it's used.
import LineChart from './LineChart';
import BarChart from './BarChart';
import GameSelectionFilter from './GameSelectionFilter';
import CharacterFilter from './CharacterFilter';
// import { fetchTaskResults } from '../api'; // Removed as fetch is now via context

function Dashboard({ selectedTask }) {

  const {
    selectedTaskResults,
    isResultsLoading,
    resultsError,
    fetchAndSetTaskResults

  } = useTaskContext();
  // const [results, setResults] = useState(null); // Remove
  // const [loading, setLoading] = useState(false); // Remove
  // const [error, setError] = useState(null); // Remove
  const [activeTab, setActiveTab] = useState('trends');
  const [activeGameFilter, setActiveGameFilter] = useState('all');
  const [activeMetric, setActiveMetric] = useState('kills');
  
  const [dateRange, setDateRange] = useState({
    startDate: null,
    endDate: null
  });
  
  const [activeCharacter, setActiveCharacter] = useState('all');

  useEffect(() => {
    if (selectedTask) {
      setActiveGameFilter('all');
      setActiveCharacter('all');
      
      setDateRange({
        startDate: selectedTask.start_date,
        endDate: selectedTask.end_date
      });
    }
  }, [selectedTask]);

  useEffect(() => {
    if (selectedTask && selectedTask.status === 'complete') {
      fetchAndSetTaskResults(
        selectedTask.id,
        dateRange.startDate,
        dateRange.endDate,
        activeCharacter
      );
    } else {
      // Clear results if no task selected or task not complete
      fetchAndSetTaskResults(null); // Call with null taskId to clear
    }
  }, [selectedTask, dateRange.startDate, dateRange.endDate, activeCharacter, fetchAndSetTaskResults]);

  if (!selectedTask) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"></path>
        </svg>
        <h3 className="text-xl font-medium text-gray-300">No Data to Display</h3>
        <p className="mt-2 text-gray-400">Select a completed task from the list to view analytics</p>
      </div>
    );
  }

  if (selectedTask.status !== 'complete') {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <div className="flex flex-col items-center">
          {selectedTask.status === 'pending' && (
            <>
              <svg className="w-16 h-16 text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-medium text-gray-300">Task Pending</h3>
              <p className="mt-2 text-gray-400">This task is waiting to be processed</p>
            </>
          )}
          
          {selectedTask.status === 'in_progress' && (
            <>
              <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
              <h3 className="text-xl font-medium text-gray-300">Processing Data</h3>
              <p className="mt-2 text-gray-400">This task is currently being processed</p>
            </>
          )}
          
          {selectedTask.status === 'failed' && (
            <>
              <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              <h3 className="text-xl font-medium text-gray-300">Task Failed</h3>
              <p className="mt-2 text-gray-400">There was an error processing this task</p>
            </>
          )}
        </div>
      </div>
    );
  }

  if (isResultsLoading) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-300">Loading analytics data...</span>
      </div>
    );
  }

  if (resultsError) {
    return (
      <div className="bg-red-900 text-white p-6 rounded-lg">
        <h3 className="text-xl font-medium">Error Loading Results</h3>
        <p className="mt-2">{resultsError}</p>
        <button 
          onClick={() => { // Using fetchAndSetTaskResults to retry
            if (selectedTask) {
              fetchAndSetTaskResults(
                selectedTask.id,
                dateRange.startDate,
                dateRange.endDate,
                activeCharacter
              );
            }
          }}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!selectedTaskResults || !selectedTaskResults.data || selectedTaskResults.data.length === 0) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 text-center">
        <svg className="w-16 h-16 mx-auto text-gray-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
        </svg>
        <h3 className="text-xl font-medium text-gray-300">No Data Available</h3>
        <p className="mt-2 text-gray-400">This task has completed but there is no data to display</p>
      </div>
    );
  }

  const filteredData = selectedTaskResults.data
    .filter(item => {
      if (activeGameFilter !== 'all' && item.game !== activeGameFilter) {
        return false;
      }
      
      if (dateRange.startDate || dateRange.endDate) {
        const itemDate = new Date(item.date);
        
        if (dateRange.startDate && itemDate < new Date(dateRange.startDate)) {
          return false;
        }
        
        if (dateRange.endDate && itemDate > new Date(dateRange.endDate)) {
          return false;
        }
      }
      
      return true;
    });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-purple-400 font-orbitron mb-1">{selectedTask.name}</h3>
        <div className="flex flex-wrap items-center justify-between mb-2">
          <div className="text-sm text-gray-400">
            <span className="mr-4">
              Original Task Range: {new Date(selectedTask.start_date).toLocaleDateString()} to {new Date(selectedTask.end_date).toLocaleDateString()}
            </span>
            <span>
              Game Type: {selectedTask.game_type === 'all' ? 'All Games' : selectedTask.game_type}
            </span>
          </div>
        </div>
        
        <div className="bg-gray-800 p-3 rounded-md mt-3">
          <h4 className="text-sm font-medium text-purple-300 mb-2">Date Range Filter</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="start-date" className="block text-xs text-gray-400 mb-1">Start Date</label>
              <input 
                type="date" 
                id="start-date"
                value={dateRange.startDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                min={selectedTask.start_date}
                max={dateRange.endDate || selectedTask.end_date}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="end-date" className="block text-xs text-gray-400 mb-1">End Date</label>
              <input 
                type="date" 
                id="end-date"
                value={dateRange.endDate || ''}
                onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                min={dateRange.startDate || selectedTask.start_date}
                max={selectedTask.end_date}
                className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => setDateRange({
                startDate: selectedTask.start_date,
                endDate: selectedTask.end_date
              })}
              className="px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 text-white rounded-md"
            >
              Reset to Original Dates
            </button>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex space-x-2">
            <button 
              onClick={() => setActiveTab('trends')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'trends' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Performance Trends
            </button>
            <button 
              onClick={() => setActiveTab('comparison')}
              className={`px-4 py-2 rounded-md text-sm font-medium ${
                activeTab === 'comparison' 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Game Comparison
            </button>
          </div>
          
          <div className="flex items-center space-x-3">
            <GameSelectionFilter 
              selectedGame={activeGameFilter} 
              onGameChange={(game) => {
                setActiveGameFilter(game);
                setActiveCharacter('all'); 
              }}
              includeAllOption={true} 
            />
            
            {activeGameFilter !== 'all' && (
              <CharacterFilter
                gameType={activeGameFilter}
                selectedCharacter={activeCharacter}
                onCharacterChange={setActiveCharacter}
              />
            )}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex flex-wrap gap-2 mb-4">
            {['kills', 'deaths', 'kd_ratio', 'win_rate'].map((metric) => (
              <button
                key={metric}
                onClick={() => setActiveMetric(metric)}
                className={`px-3 py-1 text-xs rounded-full ${
                  activeMetric === metric
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                }`}
              >
                {metric === 'kd_ratio' ? 'K/D Ratio' : 
                 metric === 'win_rate' ? 'Win Rate' : 
                 metric.charAt(0).toUpperCase() + metric.slice(1)}
              </button>
            ))}
          </div>

          {activeTab === 'trends' ? (
            <LineChart 
              data={filteredData} 
              metric={activeMetric} 
              gameFilter={activeGameFilter}
            />
          ) : (
            <BarChart 
              data={filteredData} 
              metric={activeMetric}
              gameFilter={activeGameFilter}
            />
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
