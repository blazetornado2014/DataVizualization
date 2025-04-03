import React from 'react';

function GameSelectionFilter({ selectedGame, onGameChange, includeAllOption = true }) {
  const games = [
    { id: 'valorant', name: 'Valorant' },
    { id: 'overwatch', name: 'Overwatch' },
    { id: 'lol', name: 'League of Legends' },
    { id: 'apex', name: 'Apex Legends' },
    { id: 'fortnite', name: 'Fortnite' }
  ];

  return (
    <div className="relative w-full">
      <select
        value={selectedGame}
        onChange={(e) => onGameChange(e.target.value)}
        className="appearance-none w-full bg-gray-700 border border-gray-600 text-white py-2 px-3 pr-8 rounded-md leading-tight focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        {includeAllOption && (
          <option value="all">All Games</option>
        )}
        {games.map((game) => (
          <option key={game.id} value={game.id}>
            {game.name}
          </option>
        ))}
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
        <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </div>
    </div>
  );
}

export default GameSelectionFilter;
