import React from 'react';

function DateRangeFilter({ startDate, endDate, onDateChange }) {
  // Calculate default dates
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  const defaultStartDate = oneMonthAgo.toISOString().split('T')[0];
  const defaultEndDate = today.toISOString().split('T')[0];

  return (
    <div className="grid grid-cols-2 gap-3">
      <div>
        <label htmlFor="startDate" className="block text-xs font-medium text-gray-400 mb-1">
          Start Date
        </label>
        <input
          type="date"
          id="startDate"
          value={startDate || ''}
          onChange={(e) => onDateChange('startDate', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={defaultStartDate}
        />
      </div>
      
      <div>
        <label htmlFor="endDate" className="block text-xs font-medium text-gray-400 mb-1">
          End Date
        </label>
        <input
          type="date"
          id="endDate"
          value={endDate || ''}
          onChange={(e) => onDateChange('endDate', e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          placeholder={defaultEndDate}
          min={startDate || defaultStartDate}
          max={today.toISOString().split('T')[0]}
        />
      </div>
    </div>
  );
}

export default DateRangeFilter;
