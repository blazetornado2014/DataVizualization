import React, { useState, useEffect } from 'react';
import LineChart from './LineChart';
import BarChart from './BarChart';
import GameSelectionFilter from './GameSelectionFilter';
import DateRangeFilter from './DateRangeFilter';
import { fetchTaskResults } from '../api';

function Dashboard({ selectedTask }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('trends');
  const [activeGameFilter, setActiveGameFilter] = useState('all');
  const [activeMetric, setActiveMetric] = useState('kills');
  
  // Date range filter state
  const [filterStartDate, setFilterStartDate] = useState(null);
  const [filterEndDate, setFilterEndDate] = useState(null);

  // Reset filters when task changes
  useEffect(() => {
    if (selectedTask) {
      // Reset game filter
      setActiveGameFilter('all');
      
      // Reset date filters to the task's original date range when a task is selected
      if (selectedTask.status === 'complete') {
        const taskStartDate = new Date(selectedTask.start_date);
        const taskEndDate = new Date(selectedTask.end_date);
        setFilterStartDate(taskStartDate);
        setFilterEndDate(taskEndDate);
      } else {
        setFilterStartDate(null);
        setFilterEndDate(null);
      }
    }
  }, [selectedTask && selectedTask.id]); // Only run when task ID changes

  // Fetch results when a completed task is selected
  useEffect(() => {
    const getResults = async () => {
      if (!selectedTask || selectedTask.status !== 'complete') {
        setResults(null);
        return;
      }
      
      setLoading(true);
      setError(null);
      
      try {
        const taskResults = await fetchTaskResults(selectedTask.id);
        setResults(taskResults);
      } catch (err) {
        console.error('Error fetching task results:', err);
        setError('Failed to load results. Please try again.');
        setResults(null);
      } finally {
        setLoading(false);
      }
    };
    
    getResults();
  }, [selectedTask]);

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

  if (loading) {
    return (
      <div className="bg-gray-700 rounded-lg p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
        <span className="ml-3 text-gray-300">Loading analytics data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-900 text-white p-6 rounded-lg">
        <h3 className="text-xl font-medium">Error Loading Results</h3>
        <p className="mt-2">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-800 rounded-md"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!results || !results.data || results.data.length === 0) {
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

  // Filter data based on active game filter and date range
  const filteredData = results.data.filter(item => {
    // Apply game filter
    if (activeGameFilter !== 'all' && item.game !== activeGameFilter) {
      return false;
    }
    
    // Apply date range filter if both dates are set
    if (filterStartDate && filterEndDate) {
      const itemDate = new Date(item.date);
      
      // Create new date objects to avoid modifying the original date objects
      const startDate = new Date(filterStartDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(filterEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      if (!(itemDate >= startDate && itemDate <= endDate)) {
        return false;
      }
    }
    
    return true;
  });

  return (
    <div>
      <div className="mb-6">
        <h3 className="text-xl font-bold text-purple-400 font-orbitron mb-1">{selectedTask.name}</h3>
        <div className="flex flex-wrap items-center text-sm text-gray-400">
          <span className="mr-4">
            {new Date(selectedTask.start_date).toLocaleDateString()} to {new Date(selectedTask.end_date).toLocaleDateString()}
          </span>
          <span>
            Game Type: {selectedTask.game_type === 'all' ? 'All Games' : selectedTask.game_type}
          </span>
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
          
          <div>
            <GameSelectionFilter 
              selectedGame={activeGameFilter} 
              onGameChange={setActiveGameFilter}
              includeAllOption={true} 
            />
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="bg-gray-700 p-4 rounded-lg mb-4">
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex flex-wrap gap-2">
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
          </div>
          
          {/* Date Range Filter inside visualization area */}
          <div className="mb-6 bg-gray-800 p-3 rounded-md">
            <h4 className="text-white text-sm font-medium mb-2">Filter By Date Range</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-gray-400 text-xs mb-1">Start Date</label>
                <DatePicker
                  selected={filterStartDate}
                  onChange={(date) => {
                    console.log("Setting start date:", date);
                    setFilterStartDate(date);
                  }}
                  selectsStart
                  startDate={filterStartDate}
                  endDate={filterEndDate}
                  minDate={new Date(selectedTask.start_date)}
                  maxDate={filterEndDate || new Date(selectedTask.end_date)}
                  className="w-full bg-gray-900 text-white px-2 py-1 text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  dateFormat="MMM d, yyyy"
                  showPopperArrow={false}
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        padding: 8,
                      },
                    },
                  ]}
                  fixedHeight
                />
              </div>
              <div>
                <label className="block text-gray-400 text-xs mb-1">End Date</label>
                <DatePicker
                  selected={filterEndDate}
                  onChange={(date) => {
                    console.log("Setting end date:", date);
                    setFilterEndDate(date);
                  }}
                  selectsEnd
                  startDate={filterStartDate}
                  endDate={filterEndDate}
                  minDate={filterStartDate || new Date(selectedTask.start_date)}
                  maxDate={new Date(selectedTask.end_date)}
                  className="w-full bg-gray-900 text-white px-2 py-1 text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  dateFormat="MMM d, yyyy"
                  showPopperArrow={false}
                  popperPlacement="bottom-start"
                  popperModifiers={[
                    {
                      name: "offset",
                      options: {
                        offset: [0, 8],
                      },
                    },
                    {
                      name: "preventOverflow",
                      options: {
                        rootBoundary: "viewport",
                        padding: 8,
                      },
                    },
                  ]}
                  fixedHeight
                />
              </div>
            </div>
            {filterStartDate && filterEndDate && (
              <div className="mt-2 flex justify-between items-center">
                <div className="text-xs text-gray-400">
                  Filtering: {filterStartDate.toLocaleDateString()} - {filterEndDate.toLocaleDateString()}
                </div>
                <button 
                  onClick={() => {
                    setFilterStartDate(new Date(selectedTask.start_date));
                    setFilterEndDate(new Date(selectedTask.end_date));
                  }}
                  className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
                >
                  Reset
                </button>
              </div>
            )}
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
