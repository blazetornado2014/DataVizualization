import random
from datetime import datetime, timedelta
import math

GAME_CHARACTERS = {
    'valorant': ['Jett', 'Phoenix', 'Reyna', 'Raze', 'Sage', 'Cypher', 'Sova', 'Viper', 'Omen', 'Brimstone'],
    'overwatch': ['Tracer', 'Genji', 'Mercy', 'Reinhardt', 'D.Va', 'Ana', 'Hanzo', 'Widowmaker', 'Winston', 'Zarya'],
    'lol': ['Ahri', 'Yasuo', 'Lux', 'Lee Sin', 'Jinx', 'Thresh', 'Teemo', 'Darius', 'Garen', 'Ashe'],
    'apex': ['Wraith', 'Pathfinder', 'Bloodhound', 'Lifeline', 'Bangalore', 'Gibraltar', 'Octane', 'Wattson', 'Caustic', 'Mirage'],
    'fortnite': ['Default', 'Jonesy', 'Ramirez', 'Headhunter', 'Wildcat', 'Renegade', 'Banshee', 'Hawk', 'Spitfire', 'Special Forces']
}

SUPPORTED_GAMES = list(GAME_CHARACTERS.keys())

GAME_MODIFIERS = {
    'valorant': {'kills': 1.2, 'deaths': 0.9},
    'overwatch': {'kills': 1.5, 'deaths': 1.2},
    'lol': {'kills': 0.8, 'deaths': 1.0},
    'apex': {'kills': 1.3, 'deaths': 1.1},
    'fortnite': {'kills': 1.0, 'deaths': 1.4},
    # Default modifiers can be handled in the function or defined here
    # For now, we'll handle unknown games in the function to match existing logic
}

def generate_daily_stat(game, character, stat_date, skill_level=0.5):
    """Generate realistic daily stats for a single game/character"""
    base_kills = random.randint(5, 25) * skill_level
    base_deaths = random.randint(5, 20) * (1.5 - skill_level)  
    base_win_chance = 0.3 + (skill_level * 0.4)  
    
    # Add this block in place of the removed one
    game_specific_modifiers = GAME_MODIFIERS.get(game, {'kills': 1.0, 'deaths': 1.0})
    kills_modifier = game_specific_modifiers['kills']
    deaths_modifier = game_specific_modifiers['deaths']
        
    kills = max(0, int(base_kills * kills_modifier * random.uniform(0.8, 1.2)))
    deaths = max(1, int(base_deaths * deaths_modifier * random.uniform(0.8, 1.2)))  # At least 1 death
    
    matches = random.randint(5, 15)
    
    wins = 0
    for _ in range(matches):
        if random.random() < base_win_chance:
            wins += 1
    
    losses = matches - wins
    
    kd_ratio = kills / deaths if deaths > 0 else kills
    win_rate = (wins / matches) * 100 if matches > 0 else 0
    
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
    if isinstance(start_date, str):
        start_date = datetime.strptime(start_date, "%Y-%m-%d").date()
    if isinstance(end_date, str):
        end_date = datetime.strptime(end_date, "%Y-%m-%d").date()
    
    date_range = (end_date - start_date).days + 1
    
    games_to_generate = [game_type] if game_type != 'all' else SUPPORTED_GAMES
    
    result_stats = []

    base_skill_level = random.uniform(0.3, 0.8)
    
    current_date = start_date
    while current_date <= end_date:
        for game in games_to_generate:
            if game_type == 'all' and random.random() > 0.6:
                continue
                
            available_characters = GAME_CHARACTERS.get(game, ['Unknown'])
            
            if characters and len(characters) > 0 and game_type != 'all':
                filtered_characters = [c for c in characters if c in available_characters]
                if filtered_characters:
                    daily_characters = filtered_characters
                else:
                    daily_characters = random.sample(available_characters, 1)
            else:
                characters_played = random.randint(1, 3)
                daily_characters = random.sample(available_characters, min(characters_played, len(available_characters)))
            
            for character in daily_characters:
                character_skill = base_skill_level * random.uniform(0.9, 1.1)
                if random.random() > 0.8:  
                    character_skill = character_skill * random.uniform(0.6, 1.4)
                
                daily_stat = generate_daily_stat(
                    game, 
                    character, 
                    current_date,
                    character_skill
                )
                
                result_stats.append(daily_stat)
        
        current_date += timedelta(days=1)
    
    min_expected_stats = date_range * len(games_to_generate)
    if len(result_stats) < min_expected_stats / 2:
        extra_dates = [start_date + timedelta(days=random.randint(0, date_range-1)) for _ in range(min_expected_stats)]
        for extra_date in extra_dates:
            game = random.choice(games_to_generate)
            character = random.choice(GAME_CHARACTERS.get(game, ['Unknown']))
            result_stats.append(generate_daily_stat(game, character, extra_date))
    
    return result_stats
