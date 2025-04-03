import React, { useState } from 'react';
import { Box, Typography, Paper, Checkbox, FormControl, FormLabel, FormGroup, FormControlLabel, Divider, Grid } from '@mui/material';
import { getAvailableGames, getGameDisplayName, getCharactersForGame } from '../utils/gameData';

/**
 * MultiGameSelection component for selecting multiple game sources and specific characters for each game
 * @param {Object} props - Component props
 * @param {Object} props.value - Current selection value with gameSources and gameCharacters
 * @param {Function} props.onChange - Function to call when selection changes
 */
const MultiGameSelection = ({ value = { gameSources: [], gameCharacters: {} }, onChange }) => {
  const availableGames = getAvailableGames();
  
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
  
  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" gutterBottom>
        Game Sources & Character Selection
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select games to include in your analysis and specific characters for each game
      </Typography>
      
      <Grid container spacing={2}>
        {availableGames.map(gameId => (
          <Grid container={false} xs={12} sm={6} key={gameId}>
            <Paper elevation={2} sx={{ p: 2, mb: 1 }}>
              <FormControl component="fieldset">
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={value.gameSources.includes(gameId)}
                      onChange={(e) => handleGameChange(gameId, e.target.checked)}
                    />
                  }
                  label={<Typography variant="subtitle1">{getGameDisplayName(gameId)}</Typography>}
                />
                
                {/* Only show character selection when game is selected */}
                {value.gameSources.includes(gameId) && (
                  <Box sx={{ ml: 3, mt: 1 }}>
                    <FormLabel component="legend">Characters</FormLabel>
                    <Divider sx={{ mb: 1 }} />
                    <FormGroup>
                      {getCharactersForGame(gameId).map(character => (
                        <FormControlLabel
                          key={character}
                          control={
                            <Checkbox
                              size="small"
                              checked={value.gameCharacters[gameId]?.includes(character) || false}
                              onChange={(e) => handleCharacterChange(gameId, character, e.target.checked)}
                            />
                          }
                          label={<Typography variant="body2">{character}</Typography>}
                        />
                      ))}
                    </FormGroup>
                  </Box>
                )}
              </FormControl>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default MultiGameSelection;