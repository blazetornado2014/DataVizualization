import React, { useState } from 'react';
import { useTaskContext } from '../contexts/TaskContext';
import { 
  Box, 
  Typography, 
  Paper, 
  Button, 
  Chip,
  TextField,
  FormControl,
  FormControlLabel,
  Switch,
  Stack,
  Alert,
  LinearProgress,
  CircularProgress,
  Checkbox
} from '@mui/material';
import DateRangeFilter from './DateRangeFilter';
import MultiGameSelection from './MultiGameSelection';

function TaskCreationForm() {
  const { createTask } = useTaskContext();
  const [formData, setFormData] = useState({
    taskName: '',
    startDate: '',
    endDate: '',
    metrics: ['kills', 'deaths', 'wins'],
    gameSources: [],
    gameCharacters: {}
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [useAdvancedFiltering, setUseAdvancedFiltering] = useState(false);

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

  const handleGameSelectionChange = (selection) => {
    setFormData({
      ...formData,
      gameSources: selection.gameSources,
      gameCharacters: selection.gameCharacters
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
      if (!formData.taskName.trim()) {
        throw new Error('Task name is required');
      }

      if (!formData.startDate || !formData.endDate) {
        const currentYear = new Date().getFullYear();
        if (!formData.startDate) {
          setFormData({
            ...formData,
            startDate: `${currentYear}-01-01`
          });
        }
        if (!formData.endDate) {
          setFormData({
            ...formData,
            endDate: `${currentYear}-12-31`
          });
        }
      }

      if (formData.metrics.length === 0) {
        throw new Error('At least one metric must be selected');
      }

      if (useAdvancedFiltering && formData.gameSources.length === 0) {
        throw new Error('Please select at least one game source');
      }

      const taskData = {
        name: formData.taskName,
        start_date: formData.startDate,
        end_date: formData.endDate,
        metrics: formData.metrics
      };

      if (useAdvancedFiltering) {
        taskData.game_type = 'custom';
        taskData.gameSources = formData.gameSources;
        taskData.gameCharacters = formData.gameCharacters;
      } else {
        taskData.game_type = 'all';
        taskData.characters = [];
      }

      await createTask(taskData);
      
      setFormData({
        taskName: '',
        startDate: '',
        endDate: '',
        metrics: ['kills', 'deaths', 'wins'],
        gameSources: [],
        gameCharacters: {}
      });
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to create task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalMetrics = 5; 
  const selectedMetrics = formData.metrics.length;
  const metricsPercentage = (selectedMetrics / totalMetrics) * 100;

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3, 
            borderRadius: '10px',
            boxShadow: 2
          }}
        >
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3, 
            borderRadius: '10px',
            boxShadow: 2
          }}
        >
          Task created successfully!
        </Alert>
      )}
      
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Create Analytics Task
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
          Configure your analytics parameters to generate insights across your game performance
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
          {formData.startDate && formData.endDate && (
            <Chip 
              size="medium" 
              label={`${new Date(formData.startDate).getFullYear()} to ${new Date(formData.endDate).getFullYear()}`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold' 
              }}
            />
          )}
          {useAdvancedFiltering && formData.gameSources.length > 0 && (
            <Chip 
              size="medium" 
              label={`${formData.gameSources.length} games selected`} 
              sx={{ 
                bgcolor: 'rgba(255,255,255,0.2)', 
                color: 'white',
                fontWeight: 'bold' 
              }}
            />
          )}
        </Box>
      </Paper>
      
      <Stack spacing={3}>
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
            Task Name
          </Typography>
          <TextField
            fullWidth
            id="taskName"
            name="taskName"
            value={formData.taskName}
            onChange={handleInputChange}
            placeholder="Performance Analysis Q2"
            variant="outlined"
            sx={{
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
            }}
          />
        </Box>
        
        <Box>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
            Date Range
          </Typography>
          <DateRangeFilter
            startDate={formData.startDate}
            endDate={formData.endDate}
            onDateChange={handleDateChange}
          />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
            Advanced Filtering
          </Typography>
          <FormControlLabel
            control={
              <Switch 
                checked={useAdvancedFiltering}
                onChange={() => setUseAdvancedFiltering(!useAdvancedFiltering)}
                sx={{
                  '& .MuiSwitch-switchBase.Mui-checked': {
                    color: '#6a53bf',
                    '&:hover': {
                      backgroundColor: '#6a53bf20',
                    },
                  },
                  '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                    backgroundColor: '#6a53bf',
                  },
                }}
              />
            }
            label=""
          />
        </Box>
        
        {useAdvancedFiltering ? (
          <Box>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'medium' }}>
              Game Source Filtering
            </Typography>
            <MultiGameSelection 
              value={{ 
                gameSources: formData.gameSources, 
                gameCharacters: formData.gameCharacters 
              }}
              onChange={handleGameSelectionChange} 
            />
          </Box>
        ) : (
          <Paper 
            elevation={1} 
            sx={{ 
              p: 3, 
              mb: 2, 
              borderRadius: '12px',
              bgcolor: '#1e293b',
              color: 'white',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px dashed #4a5568'
            }}
          >
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium', mb: 1 }}>
              Using Default Filtering
            </Typography>
            <Typography variant="body2" sx={{ color: '#94a3b8', textAlign: 'center' }}>
              Enable advanced filtering to select specific games and characters for more detailed analysis
            </Typography>
          </Paper>
        )}
        
        <Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
              Metrics to Track
            </Typography>
            <Chip 
              size="small" 
              label={`${selectedMetrics} of ${totalMetrics} selected`} 
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <LinearProgress 
            variant="determinate" 
            value={metricsPercentage} 
            sx={{ 
              height: 4, 
              mb: 2,
              borderRadius: 2,
              '& .MuiLinearProgress-bar': {
                bgcolor: '#6a53bf'
              }
            }}
          />
          
          <Paper 
            elevation={1} 
            sx={{ 
              p: 2,
              borderRadius: '12px',
              bgcolor: '#1e293b',
            }}
          >
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: 1 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    id="metric-kills"
                    value="kills"
                    checked={formData.metrics.includes('kills')}
                    onChange={handleMetricsChange}
                    size="small"
                    sx={{
                      color: '#a0aec0',
                      '&.Mui-checked': {
                        color: '#6a53bf',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" color="white">Kills</Typography>}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    id="metric-deaths"
                    value="deaths"
                    checked={formData.metrics.includes('deaths')}
                    onChange={handleMetricsChange}
                    size="small"
                    sx={{
                      color: '#a0aec0',
                      '&.Mui-checked': {
                        color: '#6a53bf',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" color="white">Deaths</Typography>}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    id="metric-wins"
                    value="wins"
                    checked={formData.metrics.includes('wins')}
                    onChange={handleMetricsChange}
                    size="small"
                    sx={{
                      color: '#a0aec0',
                      '&.Mui-checked': {
                        color: '#6a53bf',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" color="white">Wins</Typography>}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    id="metric-kd"
                    value="kd_ratio"
                    checked={formData.metrics.includes('kd_ratio')}
                    onChange={handleMetricsChange}
                    size="small"
                    sx={{
                      color: '#a0aec0',
                      '&.Mui-checked': {
                        color: '#6a53bf',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" color="white">KD Ratio</Typography>}
              />
              
              <FormControlLabel
                control={
                  <Checkbox
                    id="metric-winrate"
                    value="win_rate"
                    checked={formData.metrics.includes('win_rate')}
                    onChange={handleMetricsChange}
                    size="small"
                    sx={{
                      color: '#a0aec0',
                      '&.Mui-checked': {
                        color: '#6a53bf',
                      },
                    }}
                  />
                }
                label={<Typography variant="body2" color="white">Win Rate</Typography>}
              />
            </Box>
          </Paper>
        </Box>
        
        <Button
          type="submit"
          disabled={isSubmitting}
          variant="contained"
          size="large"
          sx={{
            py: 1.5,
            background: 'linear-gradient(90deg, #6a53bf 0%, #8a70d6 100%)',
            borderRadius: '10px',
            fontWeight: 'bold',
            mt: 2,
            '&:hover': {
              background: 'linear-gradient(90deg, #5a46a8 0%, #7a62c1 100%)',
            },
            '&.Mui-disabled': {
              background: '#2d3748',
              color: '#a0aec0'
            }
          }}
        >
          {isSubmitting ? (
            <>
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center' }}>
                Creating Task...
                <Box sx={{ ml: 2, display: 'inline-block', width: 16, height: 16 }}>
                  <CircularProgress size={16} color="inherit" />
                </Box>
              </Box>
            </>
          ) : 'Create Analytics Task'}
        </Button>
      </Stack>
    </Box>
  );
}

export default TaskCreationForm;
