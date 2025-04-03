import React from 'react';

function SimpleDateFilter({ startDate, endDate, onStartDateChange, onEndDateChange, minDate, maxDate }) {
  // Format the date to YYYY-MM-DD for the input value
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  // Parse the date from the input value
  const parseInputDate = (dateString) => {
    if (!dateString) return null;
    return new Date(dateString);
  };

  return (
    <div className="mb-6 bg-gray-800 p-3 rounded-md">
      <h4 className="text-white text-sm font-medium mb-2">Filter By Date Range</h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-gray-400 text-xs mb-1">Start Date</label>
          <input
            type="date"
            value={formatDateForInput(startDate)}
            onChange={(e) => onStartDateChange(parseInputDate(e.target.value))}
            min={formatDateForInput(minDate)}
            max={formatDateForInput(endDate || maxDate)}
            className="w-full bg-gray-900 text-white px-2 py-1 text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
        <div>
          <label className="block text-gray-400 text-xs mb-1">End Date</label>
          <input
            type="date"
            value={formatDateForInput(endDate)}
            onChange={(e) => onEndDateChange(parseInputDate(e.target.value))}
            min={formatDateForInput(startDate || minDate)}
            max={formatDateForInput(maxDate)}
            className="w-full bg-gray-900 text-white px-2 py-1 text-sm rounded-md border border-gray-700 focus:outline-none focus:ring-1 focus:ring-purple-500"
          />
        </div>
      </div>
      {startDate && endDate && (
        <div className="mt-2 flex justify-between items-center">
          <div className="text-xs text-gray-400">
            Filtering: {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}
          </div>
          <button 
            onClick={() => {
              onStartDateChange(minDate);
              onEndDateChange(maxDate);
            }}
            className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded"
          >
            Reset
          </button>
        </div>
      )}
    </div>
  );
}

export default SimpleDateFilter;