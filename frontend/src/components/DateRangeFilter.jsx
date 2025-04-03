import React from 'react';
import { Box, Grid, TextField, Typography } from '@mui/material';

function DateRangeFilter({ startDate, endDate, onDateChange }) {
  // Calculate default dates
  const today = new Date();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(today.getMonth() - 1);
  
  const defaultStartDate = oneMonthAgo.toISOString().split('T')[0];
  const defaultEndDate = today.toISOString().split('T')[0];

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
            Start Date
          </Typography>
          <TextField
            fullWidth
            type="date"
            id="startDate"
            value={startDate || ''}
            onChange={(e) => onDateChange('startDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            sx={inputStyles}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            End Date
          </Typography>
          <TextField
            fullWidth
            type="date"
            id="endDate"
            value={endDate || ''}
            onChange={(e) => onDateChange('endDate', e.target.value)}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            inputProps={{
              min: startDate || defaultStartDate,
              max: today.toISOString().split('T')[0]
            }}
            sx={inputStyles}
          />
        </Grid>
      </Grid>
    </Box>
  );
}

export default DateRangeFilter;
