import React, { useState, useEffect } from 'react';
import { getCharactersForGame } from '../utils/gameData';

function CharacterSelection({ gameType, selectedCharacters = [], onChange }) {
  const [characters, setCharacters] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  
  // Load characters when game type changes
  useEffect(() => {
    if (gameType && gameType !== 'all') {
      const gameCharacters = getCharactersForGame(gameType);
      setCharacters(gameCharacters || []);
      
      // Reset select all state when game changes
      setSelectAll(false);
    } else {
      setCharacters([]);
    }
  }, [gameType]);
  
  // Toggle select all characters
  const handleSelectAll = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    
    if (checked) {
      // Select all characters
      onChange(characters);
    } else {
      // Deselect all characters
      onChange([]);
    }
  };
  
  // Toggle individual character selection
  const handleCharacterToggle = (character, checked) => {
    if (checked) {
      // Add character to selection
      onChange([...selectedCharacters, character]);
    } else {
      // Remove character from selection
      onChange(selectedCharacters.filter(c => c !== character));
    }
  };
  
  // If All Games is selected, no character selection
  if (!gameType || gameType === 'all' || characters.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-4">
      <h4 className="text-sm font-medium text-gray-200 mb-2">Select Characters</h4>
      
      <div className="bg-gray-800 p-3 rounded-md mb-3">
        <label className="flex items-center text-sm text-gray-300">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="mr-2 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
          />
          Select All Characters
        </label>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto bg-gray-800 p-3 rounded-md">
        {characters.map(character => (
          <label key={character} className="flex items-center text-sm text-gray-300">
            <input
              type="checkbox"
              checked={selectedCharacters.includes(character)}
              onChange={(e) => handleCharacterToggle(character, e.target.checked)}
              className="mr-2 h-4 w-4 rounded text-purple-600 focus:ring-purple-500 bg-gray-700 border-gray-600"
            />
            {character}
          </label>
        ))}
      </div>
      
      {selectedCharacters.length > 0 && (
        <div className="mt-2 text-xs text-gray-400">
          Selected: {selectedCharacters.length} character{selectedCharacters.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}

export default CharacterSelection;