import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, MenuItem } from '@mui/material';

function DateRangeFilter({ startDate, endDate, onDateChange }) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  const defaultStartDate = `${currentYear}-01-01`;
  const defaultEndDate = `${currentYear}-12-31`;
  
  const [startYear, setStartYear] = useState(startDate ? new Date(startDate).getFullYear().toString() : currentYear.toString());
  const [endYear, setEndYear] = useState(endDate ? new Date(endDate).getFullYear().toString() : currentYear.toString());
  
  useEffect(() => {
    if (!startDate) {
      onDateChange('startDate', defaultStartDate);
    }
    
    if (!endDate) {
      onDateChange('endDate', defaultEndDate);
    }
  }, []);
  
  const handleStartYearChange = (year) => {
    setStartYear(year);
    const firstDayOfYear = `${year}-01-01`;
    onDateChange('startDate', firstDayOfYear);
    
    if (parseInt(endYear) < parseInt(year)) {
      setEndYear(year);
      onDateChange('endDate', `${year}-12-31`);
    }
  };
  
  const handleEndYearChange = (year) => {
    setEndYear(year);
    const lastDayOfYear = `${year}-12-31`;
    onDateChange('endDate', lastDayOfYear);
  };

  const inputStyles = {
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#4a5568',
      },
      '&:hover fieldset': {
        borderColor: '#6a53bf',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#6a53bf',
      },
    },
    '& .MuiInputBase-input': {
      color: 'white',
    },
    '& .MuiSelect-icon': {
      color: 'white',
    },
    '& .MuiInputLabel-root': {
      color: '#a0aec0',
    },
    '& .MuiInputLabel-root.Mui-focused': {
      color: '#6a53bf',
    },
  };

  return (
    <Box 
      sx={{
        p: 2, 
        borderRadius: '10px', 
        bgcolor: '#1e293b',
      }}
    >
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Start Year
          </Typography>
          <TextField
            fullWidth
            select
            id="startYear"
            value={startYear}
            onChange={(e) => handleStartYearChange(e.target.value)}
            variant="outlined"
            size="small"
            sx={inputStyles}
          >
            {years.map((year) => (
              <MenuItem key={`start-${year}`} value={year.toString()}>
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            End Year
          </Typography>
          <TextField
            fullWidth
            select
            id="endYear"
            value={endYear}
            onChange={(e) => handleEndYearChange(e.target.value)}
            variant="outlined"
            size="small"
            sx={inputStyles}
          >
            {years.map((year) => (
              <MenuItem 
                key={`end-${year}`} 
                value={year.toString()}
                disabled={parseInt(year) < parseInt(startYear)} // Disable years before start year
              >
                {year}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>
    </Box>
  );
}

export default DateRangeFilter;
