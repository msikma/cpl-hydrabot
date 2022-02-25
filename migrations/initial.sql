pragma encoding = 'UTF-8';

begin transaction;

create table player (
  id integer primary key,
  screen_name text,
  discord_name text,
  bnet_name text,
  is_player boolean not null default false,
  is_coach boolean not null default false,
  is_asst_coach boolean not null default false,
  is_active boolean not null default false,
  cpl_mmr integer,
  tier integer check(tier in (3, 2, 1, 0)),
  race text check(race in ('t', 'p', 'z', 'r', 'declared', 'racepicker')),
  data text,
  created timestamp default current_timestamp not null,
  updated timestamp default current_timestamp not null
);

create table player_cpl_mmr (
  player_id integer not null,
  cpl_mmr integer,
  timestamp timestamp default current_timestamp not null
);

create table player_race (
  player_id integer not null,
  race text check(race in ('t', 'p', 'z', 'r', 'declared', 'racepicker')),
  timestamp timestamp default current_timestamp not null
);

create table player_tier (
  player_id integer not null,
  tier integer check(tier in (3, 2, 1, 0)),
  timestamp timestamp default current_timestamp not null
);

create table team (
  id integer primary key,
  team_name text,
  team_number integer,
  discord_category_id text,
  created timestamp default current_timestamp not null,
  updated timestamp default current_timestamp not null
);

create table tournament_week (
  id integer primary key,
  tournament_season_id integer,
  start timestamp,
  end timestamp
);

create table tournament_team_matchup (
  tournament_week_id integer,
  team_id_a integer,
  team_id_b integer,

  primary key (tournament_week_id, team_id_a, team_id_b)
);

create table tournament_season (
  id integer primary key,
  season_number text,
  is_ongoing boolean not null default false
);

create table player_team (
  player_id integer,
  team_id integer,
  is_active_member boolean not null default true,
  joined timestamp default current_timestamp,
  left timestamp,

  primary key (player_id, team_id)
);

create table msg_component (
  id integer primary key,
  msg_id integer,
  remote_id text
);

create table msg (
  id integer primary key,
  namespace text,
  name text,
  unique (namespace, name)
);

create table setting (
  namespace text,
  name text,
  value text,
  unique (namespace, name)
);

create trigger player_update after update on player
begin
  update player set updated = current_timestamp where id = OLD.id;
end;

create trigger team_update after update on team
begin
  update team set updated = current_timestamp where id = OLD.id;
end;

commit;
