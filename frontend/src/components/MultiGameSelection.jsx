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
  Stack
} from '@mui/material';
import { getAvailableGames, getGameDisplayName, getCharactersForGame } from '../utils/gameData';

/**
 * MultiGameSelection component for selecting multiple game sources and specific characters for each game
 * @param {Object} props - Component props
 * @param {Object} props.value - Current selection value with gameSources and gameCharacters
 * @param {Function} props.onChange - Function to call when selection changes
 */
const MultiGameSelection = ({ value = { gameSources: [], gameCharacters: {} }, onChange }) => {
  const availableGames = getAvailableGames();
  // Track expanded states for each game's character list
  const [expandedGames, setExpandedGames] = useState({});
  
  // Handle game selection/deselection
  const handleGameChange = (gameId, checked) => {
    let updatedSources = [...value.gameSources];
    let updatedCharacters = { ...value.gameCharacters };
    
    if (checked) {
      // Add game to sources if it's not already there
      if (!updatedSources.includes(gameId)) {
        updatedSources.push(gameId);
      }
      
      // Initialize empty character list for this game if needed
      if (!updatedCharacters[gameId]) {
        updatedCharacters[gameId] = [];
      }
    } else {
      // Remove game from sources
      updatedSources = updatedSources.filter(id => id !== gameId);
      
      // Remove characters for this game
      if (updatedCharacters[gameId]) {
        delete updatedCharacters[gameId];
      }
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  // Handle character selection/deselection for a specific game
  const handleCharacterChange = (gameId, characterId, checked) => {
    // Make sure the game is in our sources
    let updatedSources = [...value.gameSources];
    if (!updatedSources.includes(gameId)) {
      updatedSources.push(gameId);
    }
    
    // Update characters for this game
    let updatedCharacters = { ...value.gameCharacters };
    if (!updatedCharacters[gameId]) {
      updatedCharacters[gameId] = [];
    }
    
    if (checked) {
      // Add character if not already there
      if (!updatedCharacters[gameId].includes(characterId)) {
        updatedCharacters[gameId] = [...updatedCharacters[gameId], characterId];
      }
    } else {
      // Remove character
      updatedCharacters[gameId] = updatedCharacters[gameId].filter(id => id !== characterId);
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  // Toggle expand/collapse for a game's character list
  const toggleExpanded = (gameId) => {
    setExpandedGames(prev => ({
      ...prev,
      [gameId]: !prev[gameId]
    }));
  };
  
  // Select all characters for a game
  const selectAllCharacters = (gameId) => {
    const characters = getCharactersForGame(gameId);
    let updatedSources = [...value.gameSources];
    
    // Make sure game is in sources
    if (!updatedSources.includes(gameId)) {
      updatedSources.push(gameId);
    }
    
    // Set all characters
    let updatedCharacters = { ...value.gameCharacters };
    updatedCharacters[gameId] = [...characters];
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  // Deselect all characters for a game
  const deselectAllCharacters = (gameId) => {
    let updatedSources = [...value.gameSources];
    let updatedCharacters = { ...value.gameCharacters };
    
    // If game is in sources, keep it but empty character list
    if (updatedSources.includes(gameId)) {
      updatedCharacters[gameId] = [];
    }
    
    onChange({ gameSources: updatedSources, gameCharacters: updatedCharacters });
  };
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Game Sources & Character Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select games to include in your analysis and specific characters for each game
      </Typography>
      
      <Grid container spacing={2}>
        {availableGames.map(gameId => {
          const characters = getCharactersForGame(gameId);
          const selectedCount = value.gameCharacters[gameId]?.length || 0;
          const isExpanded = expandedGames[gameId] || false;
          
          return (
            <Grid lg={4} md={6} sm={12} key={gameId}>
              <Paper 
                elevation={2} 
                sx={{ 
                  p: 2, 
                  mb: 1, 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
              >
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={value.gameSources.includes(gameId)}
                          onChange={(e) => handleGameChange(gameId, e.target.checked)}
                        />
                      }
                      label={<Typography variant="subtitle1">{getGameDisplayName(gameId)}</Typography>}
                    />
                    
                    {/* Show character count badge if any are selected */}
                    {selectedCount > 0 && (
                      <Chip 
                        size="small" 
                        label={`${selectedCount} selected`} 
                        color="primary" 
                        variant="outlined"
                      />
                    )}
                  </Box>
                  
                  {/* Only show character selection when game is selected */}
                  {value.gameSources.includes(gameId) && characters.length > 0 && (
                    <Box sx={{ ml: 3, mt: 1 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <FormLabel component="legend">Characters</FormLabel>
                        <Stack direction="row" spacing={1}>
                          <Button 
                            size="small" 
                            variant="text" 
                            onClick={() => selectAllCharacters(gameId)}
                          >
                            All
                          </Button>
                          <Button 
                            size="small" 
                            variant="text" 
                            onClick={() => deselectAllCharacters(gameId)}
                          >
                            None
                          </Button>
                          <Button 
                            size="small" 
                            variant="text" 
                            onClick={() => toggleExpanded(gameId)}
                          >
                            {isExpanded ? 'Collapse' : 'Expand'}
                          </Button>
                        </Stack>
                      </Box>
                      
                      <Divider sx={{ mb: 1 }} />
                      
                      <FormGroup sx={{ 
                        display: 'grid', 
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '0.25rem',
                        maxHeight: isExpanded ? 'none' : '200px',
                        overflow: 'auto'
                      }}>
                        {characters.map(character => (
                          <FormControlLabel
                            key={character}
                            control={
                              <Checkbox
                                size="small"
                                checked={value.gameCharacters[gameId]?.includes(character) || false}
                                onChange={(e) => handleCharacterChange(gameId, character, e.target.checked)}
                              />
                            }
                            label={
                              <Typography variant="body2" noWrap title={character} sx={{ maxWidth: '120px' }}>
                                {character}
                              </Typography>
                            }
                          />
                        ))}
                      </FormGroup>
                    </Box>
                  )}
                </FormControl>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
};

export default MultiGameSelection;