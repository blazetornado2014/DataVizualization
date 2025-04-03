import React, { useState, useEffect } from 'react';
import { Box, Grid, TextField, Typography, MenuItem } from '@mui/material';

function DateRangeFilter({ startDate, endDate, onDateChange }) {
  // Get current year and generate a list of years (current year and 5 years back)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) => currentYear - i);
  
  // When form initializes or resets, set default values for year only
  const [startYear, setStartYear] = useState(startDate ? new Date(startDate).getFullYear().toString() : currentYear.toString());
  const [endYear, setEndYear] = useState(endDate ? new Date(endDate).getFullYear().toString() : currentYear.toString());
  
  // Update the date values using the first day of the year and last day of the year
  useEffect(() => {
    if (startYear) {
      const firstDayOfYear = `${startYear}-01-01`;
      onDateChange('startDate', firstDayOfYear);
    }
    
    if (endYear) {
      const lastDayOfYear = `${endYear}-12-31`;
      onDateChange('endDate', lastDayOfYear);
    }
  }, [startYear, endYear]);

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
            onChange={(e) => setStartYear(e.target.value)}
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
            onChange={(e) => setEndYear(e.target.value)}
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
