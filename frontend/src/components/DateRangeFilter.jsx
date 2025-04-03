import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import '../assets/datepicker.css';

function DateRangeFilter({ 
  startDate, 
  endDate, 
  onStartDateChange, 
  onEndDateChange,
  minDate,
  maxDate 
}) {
  return (
    <div className="bg-gray-700 p-4 rounded-md mb-4">
      <h3 className="text-white text-md font-medium mb-3">Filter Date Range</h3>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-gray-400 text-sm mb-1">Start Date</label>
          <DatePicker
            selected={startDate}
            onChange={onStartDateChange}
            selectsStart
            startDate={startDate}
            endDate={endDate}
            minDate={minDate}
            maxDate={endDate || maxDate}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
            dateFormat="MMM d, yyyy"
          />
        </div>
        
        <div>
          <label className="block text-gray-400 text-sm mb-1">End Date</label>
          <DatePicker
            selected={endDate}
            onChange={onEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || minDate}
            maxDate={maxDate}
            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500" 
            dateFormat="MMM d, yyyy"
          />
        </div>
      </div>
    </div>
  );
}

export default DateRangeFilter;