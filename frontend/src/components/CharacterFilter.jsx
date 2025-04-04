import React, { useState, useEffect } from 'react';
import { getCharactersForGame } from '../utils/gameData';

function CharacterFilter({ gameType, selectedCharacter = 'all', onCharacterChange }) {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    if (gameType && gameType !== 'all') {
      const gameCharacters = getCharactersForGame(gameType);
      setCharacters(gameCharacters || []);
    } else {
      setCharacters([]);
    }
  }, [gameType]);

  if (!gameType || gameType === 'all' || characters.length === 0) {
    return null;
  }

  return (
    <div className="inline-block relative w-48">
      <select
        value={selectedCharacter}
        onChange={(e) => onCharacterChange(e.target.value)}
        className="block appearance-none w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 pr-8 rounded-md text-sm leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="all">All Characters</option>
        {characters.map(character => (
          <option key={character} value={character}>{character}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
        </svg>
      </div>
    </div>
  );
}

export default CharacterFilter;