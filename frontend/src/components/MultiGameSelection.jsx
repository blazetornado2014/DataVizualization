import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Checkbox, 
  FormControl, 
  FormLabel, 
  FormGroup, 
  FormControlLabel, 
  Divider, 
  Grid, 
  Button, 
  Chip,
  Stack,
  Avatar,
  LinearProgress,
  IconButton,
  Tooltip
} from '@mui/material';
import { getAvailableGames, getGameDisplayName, getCharactersForGame } from '../utils/gameData';

const GAME_COLORS = {
  'valorant': {
    primary: '#fa4454',
    secondary: '#1f2326',
    accent: '#ff4655'
  },
  'overwatch': {
    primary: '#fa9c1e',
    secondary: '#218ffe',
    accent: '#43484c'
  },
  'league_of_legends': {
    primary: '#0bc4e2',
    secondary: '#091428',
    accent: '#c89b3c'
  },
  'fortnite': {
    primary: '#9d4dbb',
    secondary: '#1f1f1f', 
    accent: '#ffdd33'
  },
  'apex_legends': {
    primary: '#da292a',
    secondary: '#000000',
    accent: '#cd3232'
  },
  'all': {
    primary: '#6a53bf',
    secondary: '#2c2c3d',
    accent: '#f4f4f5'
  }
};

/**
 * MultiGameSelection component for selecting multiple game sources and specific characters for each game
 * @param {Object} props - Component props
 * @param {Object} props.value - Current selection value with gameSources and gameCharacters
 * @param {Function} props.onChange - Function to call when selection changes
 */
const MultiGameSelection = ({ value = { gameSources: [], gameCharacters: {} }, onChange }) => {
  const availableGames = getAvailableGames();
  const [expandedGames, setExpandedGames] = useState({});
  
  const handleGameChange = (gameId, checked) => {
    let updatedSources = [...value.gameSources];
    let updatedCharacters = { ...value.gameCharacters };
    
    if (checked) {
      if (!updatedSources.includes(gameId)) {
        updatedSources.push(gameId);
      }
      
      if (!updatedCharacters[gameId]) {
        updatedCharacters[gameId] = [];
      }
    } else {
      updatedSources = updatedSources.filter(id => id !== gameId);
      
      if (updatedCharacters[gameId]) {
        delete updatedCharacters[gameId];
      }
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  const handleCharacterChange = (gameId, characterId, checked) => {
    let updatedSources = [...value.gameSources];
    if (!updatedSources.includes(gameId)) {
      updatedSources.push(gameId);
    }
    
    let updatedCharacters = { ...value.gameCharacters };
    if (!updatedCharacters[gameId]) {
      updatedCharacters[gameId] = [];
    }
    
    if (checked) {
      if (!updatedCharacters[gameId].includes(characterId)) {
        updatedCharacters[gameId] = [...updatedCharacters[gameId], characterId];
      }
    } else {
      updatedCharacters[gameId] = updatedCharacters[gameId].filter(id => id !== characterId);
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  const toggleExpanded = (gameId) => {
    setExpandedGames(prev => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };
  
  const selectAllCharacters = (gameId) => {
    const characters = getCharactersForGame(gameId);
    let updatedSources = [...value.gameSources];
    
    if (!updatedSources.includes(gameId)) {
      updatedSources.push(gameId);
    }
    
    let updatedCharacters = { ...value.gameCharacters };
    updatedCharacters[gameId] = [...characters];
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  const deselectAllCharacters = (gameId) => {
    let updatedSources = [...value.gameSources];
    let updatedCharacters = { ...value.gameCharacters };
    
    if (updatedSources.includes(gameId)) {
      updatedCharacters[gameId] = [];
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  const selectedGamesCount = value.gameSources.length;
  const totalCharactersCount = Object.values(value.gameCharacters)
    .reduce((total, chars) => total + chars.length, 0);
  
  return (
    <Box sx={{ mt: 2 }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 2, 
          mb: 3, 
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #2c3e50 0%, #4a6572 100%)',
          color: 'white'
        }}
      >
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
          Game Sources & Character Selection
        </Typography>
        <Typography variant="body1" sx={{ mb: 2, opacity: 0.9 }}>
          Select games to include in your analysis and specific characters for each game
        </Typography>
        
        {(selectedGamesCount > 0 || totalCharactersCount > 0) && (
          <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
            {selectedGamesCount > 0 && (
              <Chip 
                size="medium" 
                label={`${selectedGamesCount} Games Selected`} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold' 
                }}
              />
            )}
            {totalCharactersCount > 0 && (
              <Chip 
                size="medium" 
                label={`${totalCharactersCount} Characters Selected`} 
                sx={{ 
                  bgcolor: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  fontWeight: 'bold' 
                }}
              />
            )}
          </Box>
        )}
      </Paper>
      
      <Grid container spacing={2}>
        {availableGames.map(gameId => {
          const characters = getCharactersForGame(gameId);
          const selectedCount = value.gameCharacters[gameId]?.length || 0;
          const isExpanded = expandedGames[gameId] || false;
          
          const gameColors = GAME_COLORS[gameId] || GAME_COLORS.all;
          const selectionPercentage = characters.length > 0 
            ? (selectedCount / characters.length) * 100 
            : 0;
          
          const gameInitial = getGameDisplayName(gameId).charAt(0);
          
          return (
            <Grid xs={12} sm={6} md={4} key={gameId}>
              <Paper 
                elevation={3} 
                sx={{ 
                  p: 0, 
                  mb: 2,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: value.gameSources.includes(gameId) 
                    ? `2px solid ${gameColors.primary}` 
                    : '2px solid transparent',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <Box sx={{ 
                  bgcolor: gameColors.secondary,
                  color: 'white',
                  p: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: gameColors.primary, 
                        color: 'white',
                        width: 36,
                        height: 36,
                        mr: 1,
                        fontWeight: 'bold'
                      }}
                    >
                      {gameInitial}
                    </Avatar>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                      {getGameDisplayName(gameId)}
                    </Typography>
                  </Box>
                  
                  <Checkbox
                    checked={value.gameSources.includes(gameId)}
                    onChange={(e) => handleGameChange(gameId, e.target.checked)}
                    sx={{
                      color: 'white',
                      '&.Mui-checked': {
                        color: gameColors.primary,
                      }
                    }}
                  />
                </Box>
                
                {value.gameSources.includes(gameId) && characters.length > 0 && (
                  <LinearProgress 
                    variant="determinate" 
                    value={selectionPercentage} 
                    sx={{ 
                      height: 4, 
                      '& .MuiLinearProgress-bar': {
                        bgcolor: gameColors.primary
                      }
                    }}
                  />
                )}
                
                <Box sx={{ p: 2, flexGrow: 1 }}>
                  <FormControl component="fieldset" sx={{ width: '100%' }}>
                    {selectedCount > 0 && (
                      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 1 }}>
                        <Chip 
                          size="small" 
                          label={`${selectedCount} of ${characters.length} characters`} 
                          sx={{ 
                            bgcolor: gameColors.primary + '20', // Add transparency
                            color: gameColors.primary,
                            fontWeight: 'bold',
                            border: `1px solid ${gameColors.primary}`
                          }}
                        />
                      </Box>
                    )}
                    
                    {value.gameSources.includes(gameId) && characters.length > 0 && (
                      <Box>
                        <Box sx={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          mb: 1,
                          bgcolor: gameColors.primary + '10', 
                          p: 1,
                          borderRadius: '8px'
                        }}>
                          <FormLabel component="legend" sx={{ 
                            color: gameColors.primary, 
                            fontWeight: 'bold'
                          }}>
                            Characters
                          </FormLabel>
                          <Stack direction="row" spacing={0.5}>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => selectAllCharacters(gameId)}
                              sx={{ 
                                color: gameColors.primary,
                                borderColor: gameColors.primary,
                                '&:hover': {
                                  borderColor: gameColors.primary,
                                  bgcolor: gameColors.primary + '20',
                                }
                              }}
                            >
                              All
                            </Button>
                            <Button 
                              size="small" 
                              variant="outlined" 
                              onClick={() => deselectAllCharacters(gameId)}
                              sx={{ 
                                color: gameColors.primary,
                                borderColor: gameColors.primary,
                                '&:hover': {
                                  borderColor: gameColors.primary,
                                  bgcolor: gameColors.primary + '20',
                                }
                              }}
                            >
                              None
                            </Button>
                            <Tooltip title={isExpanded ? "Show fewer characters" : "Show all characters"}>
                              <Button 
                                size="small" 
                                variant="contained" 
                                onClick={() => toggleExpanded(gameId)}
                                sx={{ 
                                  bgcolor: gameColors.primary,
                                  '&:hover': {
                                    bgcolor: gameColors.primary + 'dd', 
                                  }
                                }}
                              >
                                {isExpanded ? 'Less' : 'More'}
                              </Button>
                            </Tooltip>
                          </Stack>
                        </Box>
                        
                        <FormGroup sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                          gap: '0.25rem',
                          maxHeight: isExpanded ? 'none' : '200px',
                          overflowY: 'auto',
                          pr: 1,
                          pt: 1,
                          pb: 1
                        }}>
                          {characters.map(character => (
                            <FormControlLabel
                              key={character}
                              control={
                                <Checkbox
                                  size="small"
                                  checked={value.gameCharacters[gameId]?.includes(character) || false}
                                  onChange={(e) => handleCharacterChange(gameId, character, e.target.checked)}
                                  sx={{
                                    '&.Mui-checked': {
                                      color: gameColors.primary,
                                    }
                                  }}
                                />
                              }
                              label={
                                <Tooltip title={character} arrow placement="top">
                                  <Typography 
                                    variant="body2" 
                                    noWrap 
                                    sx={{ 
                                      maxWidth: '100px',
                                      fontWeight: value.gameCharacters[gameId]?.includes(character) ? 'bold' : 'normal'
                                    }}
                                  >
                                    {character}
                                  </Typography>
                                </Tooltip>
                              }
                            />
                          ))}
                        </FormGroup>
                      </Box>
                    )}
                  </FormControl>
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MultiGameSelection;