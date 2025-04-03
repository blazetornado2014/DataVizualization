import random
from datetime import datetime, timedelta
import math

# Game-specific character lists
GAME_CHARACTERS = {
    'valorant': ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Sage', 'Cypher', 'Sova', 'Viper', 'Omen', 'Brimstone'],
    'overwatch': ['Tracer', 'Genji', 'Mercy', 'Reinhardt', 'D.Va', 'Ana', 'Hanzo', 'Widowmaker', 'Winston', 'Zarya'],
    'lol': ['Ahri', 'Yasuo', 'Lux', 'Lee Sin', 'Jinx', 'Thresh', 'Teemo', 'Darius', 'Garen', 'Ashe'],
    'apex': ['Wraith', 'Pathfinder', 'Bloodhound', 'Lifeline', 'Bangalore', 'Gibraltar', 'Octane', 'Wattson', 'Caustic', 'Mirage'],
    'fortnite': ['Default', 'Jonesy', 'Ramirez', 'Headhunter', 'Wildcat', 'Renegade', 'Banshee', 'Hawk', 'Spitfire', 'Special Forces']
}

# List of supported games
SUPPORTED_GAMES = list(GAME_CHARACTERS.keys())

def generate_daily_stat(game, character, stat_date, skill_level=0.5):
    """Generate realistic daily stats for a single game/character"""
    # Base metrics with some randomness based on skill level
    base_kills = random.randint(5, 25) * skill_level
    base_deaths = random.randint(5, 20) * (1.5 - skill_level)  # Lower skill = more deaths
    base_win_chance = 0.3 + (skill_level * 0.4)  # 30-70% win chance based on skill
    
    # Add some game-specific variations
    if game == 'valorant':
        kills_modifier = 1.2
        deaths_modifier = 0.9
    elif game == 'overwatch':
        kills_modifier = 1.5
        deaths_modifier = 1.2
    elif game == 'lol':
        kills_modifier = 0.8
        deaths_modifier = 1.0
    elif game == 'apex':
        kills_modifier = 1.3
        deaths_modifier = 1.1
    elif game == 'fortnite':
        kills_modifier = 1.0
        deaths_modifier = 1.4
    else:
        kills_modifier = 1.0
        deaths_modifier = 1.0
        
    # Apply modifiers and add random noise
    kills = max(0, int(base_kills * kills_modifier * random.uniform(0.8, 1.2)))
    deaths = max(1, int(base_deaths * deaths_modifier * random.uniform(0.8, 1.2)))  # At least 1 death
    
    # Determine number of matches played (between 5-15)
    matches = random.randint(5, 15)
    
    # Calculate wins based on win chance
    wins = 0
    for _ in range(matches):
        if random.random() < base_win_chance:
            wins += 1
    
    # Calculate losses
    losses = matches - wins
    
    # Calculate derived metrics
    kd_ratio = kills / deaths if deaths > 0 else kills
    win_rate = (wins / matches) * 100 if matches > 0 else 0
    
    # Create the stat dictionary
    stat = {
        "game": game,
        "character": character,
        "date": stat_date,
        "kills": kills,
        "deaths": deaths,
        "wins": wins,
        "losses": losses,
        "kd_ratio": round(kd_ratio, 2),
        "win_rate": round(win_rate, 2)
    }
    
    return stat

def generate_game_statistics(game_type, start_date, end_date, metrics, characters=None):
    """Generate synthetic game statistics for the specified period and game type with optional character filtering"""
    # Convert string dates to datetime objects if needed
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    # Calculate date range
    date_range = (end_date - start_date).days + 1
    
    # Determine which games to generate data for
    games_to_generate = [game_type] if game_type != 'all' else SUPPORTED_GAMES
    
    # Resulting list of game statistics
    result_stats = []
    
    # Create a player profile with a consistent skill level
    base_skill_level = random.uniform(0.3, 0.8)
    
    # Generate data for each day in the range
    current_date = start_date
    while current_date <= end_date:
        # For each game
        for game in games_to_generate:
            if game_type == 'all' and random.random() > 0.6:
                # Only generate data for some games on some days (for variety)
                continue
                
            # Get available characters for this game
            available_characters = GAME_CHARACTERS.get(game, ['Unknown'])
            
            # If specific characters are requested, use those (if they're available for this game)
            if characters and len(characters) > 0 and game_type != 'all':
                # Filter characters to only include ones available for this game
                filtered_characters = [c for c in characters if c in available_characters]
                if filtered_characters:
                    daily_characters = filtered_characters
                else:
                    # If none of the requested characters are available, use a random one
                    daily_characters = random.sample(available_characters, 1)
            else:
                # Otherwise, determine how many characters were played on this day
                characters_played = random.randint(1, 3)
                # Select random characters
                daily_characters = random.sample(available_characters, min(characters_played, len(available_characters)))
            
            # For each character, generate a daily stat
            for character in daily_characters:
                # Slightly vary skill level by game and character
                character_skill = base_skill_level * random.uniform(0.9, 1.1)
                if random.random() > 0.8:  # Occasionally have a very good or bad day
                    character_skill = character_skill * random.uniform(0.6, 1.4)
                
                # Generate the stat
                daily_stat = generate_daily_stat(
                    game, 
                    character, 
                    current_date,
                    character_skill
                )
                
                # Add to results
                result_stats.append(daily_stat)
        
        # Move to next day
        current_date += timedelta(days=1)
    
    # Ensure we have a healthy amount of data
    min_expected_stats = date_range * len(games_to_generate)
    if len(result_stats) < min_expected_stats / 2:
        # Generate more data to ensure we have enough
        extra_dates = [start_date + timedelta(days=random.randint(0, date_range-1)) for _ in range(min_expected_stats)]
        for extra_date in extra_dates:
            game = random.choice(games_to_generate)
            character = random.choice(GAME_CHARACTERS.get(game, ['Unknown']))
            result_stats.append(generate_daily_stat(game, character, extra_date))
    
    return result_stats
