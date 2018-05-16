create table ML_DATA AS SELECT pbi.id, pbi.name, pbi.age, pbi.favourite_leg, pbi.position, pbi.country, pbi.team,
pys.year, pys.goals, pys.assists, pys.games_in_starting_linup, pys.games_entered_from_bench,
pys.yellow_cards, pys.red_cards, pys.average_km_per_game
FROM players_basic_info pbi, players_yearly_statistics pys
WHERE pbi.id = pys.player_id;

