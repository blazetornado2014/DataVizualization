export const GAME_CHARACTERS = {
  valorant: [
    'Jett', 'Phoenix', 'Raze', 'Reyna', 'Neon', 'Yoru', 'Breach', 'Fade', 
    'KAY/O', 'Skye', 'Sova', 'Astra', 'Brimstone', 'Harbor', 'Omen', 'Viper',
    'Chamber', 'Cypher', 'Killjoy', 'Sage'
  ],
  overwatch: [
    'Ana', 'Ashe', 'Baptiste', 'Bastion', 'Brigitte', 'Cassidy', 'D.Va', 'Doomfist',
    'Echo', 'Genji', 'Hanzo', 'Junker Queen', 'Junkrat', 'Kiriko', 'Lifeweaver',
    'Lucio', 'Mei', 'Mercy', 'Moira', 'Orisa', 'Pharah', 'Ramattra', 'Reaper',
    'Reinhardt', 'Roadhog', 'Sigma', 'Sojourn', 'Soldier: 76', 'Sombra', 'Symmetra',
    'Torbjorn', 'Tracer', 'Widowmaker', 'Winston', 'Wrecking Ball', 'Zarya', 'Zenyatta'
  ],
  'league_of_legends': [
    'Aatrox', 'Ahri', 'Akali', 'Akshan', 'Alistar', 'Amumu', 'Anivia', 'Annie',
    'Aphelios', 'Ashe', 'Aurelion Sol', 'Azir', 'Bard', 'Blitzcrank', 'Brand', 'Braum',
    'Caitlyn', 'Camille', 'Cassiopeia', 'Cho\'Gath', 'Corki', 'Darius', 'Diana', 'Dr. Mundo',
    'Draven', 'Ekko', 'Elise', 'Evelynn', 'Ezreal', 'Fiddlesticks', 'Fiora', 'Fizz',
    'Galio', 'Gangplank', 'Garen', 'Gnar', 'Gragas', 'Graves', 'Gwen', 'Hecarim',
    'Heimerdinger', 'Illaoi', 'Irelia', 'Ivern', 'Janna', 'Jarvan IV', 'Jax', 'Jayce',
    'Jhin', 'Jinx', 'Kai\'Sa', 'Kalista', 'Karma', 'Karthus', 'Kassadin', 'Katarina',
    'Kayle', 'Kayn', 'Kennen', 'Kha\'Zix', 'Kindred', 'Kled', 'Kog\'Maw', 'LeBlanc',
    'Lee Sin', 'Leona', 'Lillia', 'Lissandra', 'Lucian', 'Lulu', 'Lux', 'Malphite',
    'Malzahar', 'Maokai', 'Master Yi', 'Miss Fortune', 'Mordekaiser', 'Morgana', 'Nami',
    'Nasus', 'Nautilus', 'Neeko', 'Nidalee', 'Nocturne', 'Nunu & Willump', 'Olaf',
    'Orianna', 'Ornn', 'Pantheon', 'Poppy', 'Pyke', 'Qiyana', 'Quinn', 'Rakan',
    'Rammus', 'Rek\'Sai', 'Rell', 'Renata Glasc', 'Renekton', 'Rengar', 'Riven',
    'Rumble', 'Ryze', 'Samira', 'Sejuani', 'Senna', 'Seraphine', 'Sett', 'Shaco',
    'Shen', 'Shyvana', 'Singed', 'Sion', 'Sivir', 'Skarner', 'Sona', 'Soraka',
    'Swain', 'Sylas', 'Syndra', 'Tahm Kench', 'Taliyah', 'Talon', 'Taric', 'Teemo',
    'Thresh', 'Tristana', 'Trundle', 'Tryndamere', 'Twisted Fate', 'Twitch', 'Udyr',
    'Urgot', 'Varus', 'Vayne', 'Veigar', 'Vel\'Koz', 'Vex', 'Vi', 'Viego', 'Viktor',
    'Vladimir', 'Volibear', 'Warwick', 'Wukong', 'Xayah', 'Xerath', 'Xin Zhao', 'Yasuo',
    'Yone', 'Yorick', 'Yuumi', 'Zac', 'Zed', 'Zeri', 'Ziggs', 'Zilean', 'Zoe', 'Zyra'
  ],
  fortnite: [
    'Jonesy', 'Ramirez', 'Banshee', 'Spitfire', 'Wildcat', 'Renegade', 'Hawk', 'Headhunter',
    'Peely', 'Fishstick', 'Meowscles', 'Midas', 'Skye', 'TNTina', 'Brutus', 'Agent Jones',
    'The Foundation', 'The Scientist', 'The Visitor', 'The Paradigm'
  ],
  apex_legends: [
    'Bangalore', 'Bloodhound', 'Caustic', 'Crypto', 'Fuse', 'Gibraltar', 'Horizon',
    'Lifeline', 'Loba', 'Mad Maggie', 'Mirage', 'Newcastle', 'Octane', 'Pathfinder',
    'Rampart', 'Revenant', 'Seer', 'Valkyrie', 'Wattson', 'Wraith'
  ]
};

export const getGameDisplayName = (gameId) => {
  const displayNames = {
    'valorant': 'Valorant',
    'overwatch': 'Overwatch',
    'league_of_legends': 'League of Legends',
    'fortnite': 'Fortnite',
    'apex_legends': 'Apex Legends',
    'all': 'All Games'
  };
  
  return displayNames[gameId] || gameId;
};

export const getCharactersForGame = (gameId) => {
  if (gameId === 'all') {
    return [];
  }
  
  return GAME_CHARACTERS[gameId] || [];
};

export const getAvailableGames = () => {
  return [
    'all',
    'valorant',
    'overwatch',
    'league_of_legends',
    'fortnite',
    'apex_legends'
  ];
};