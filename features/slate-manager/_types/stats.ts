export interface PassingStats {
    id: string
    player: string
    player_id: number
    player_game_count: number
    position: string
    accuracy_percent: number | null
    aimed_passes: number | null
    attempts: number | null
    avg_depth_of_target: number | null
    avg_time_to_throw: number | null
    big_time_throws: number | null
    btt_rate: number | null
    completions: number | null
    drop_rate: number | null
    dropbacks: number | null
    first_downs: number | null
    grades_hands_fumble: number | null
    grades_offense: number | null
    grades_pass: number | null
    grades_run: number | null
    interceptions: number | null
    qb_rating: number | null
    sacks: number | null
    scrambles: number | null
    spikes: number | null
    thrown_aways: number | null
    touchdowns: number | null
    turnover_worthy_plays: number | null
    twp_rate: number | null
    yards: number | null
    ypa: number | null
  }
  
  export interface RushingStats {
    id: string
    player: string
    player_id: number
    player_game_count: number
    position: string
    attempts: number | null
    avoided_tackles: number | null
    breakaway_attempts: number | null
    breakaway_percent: number | null
    breakaway_yards: number | null
    designed_yards: number | null
    elusive_rating: number | null
    explosive: number | null
    first_downs: number | null
    fumbles: number | null
    grades_hands_fumble: number | null
    grades_offense: number | null
    grades_run: number | null
    longest: number | null
    rec_yards: number | null
    receptions: number | null
    run_plays: number | null
    rushing_share: number | null
    scramble_yards: number | null
    scrambles: number | null
    touchdowns: number | null
    yards: number | null
    yards_after_contact: number | null
    yco_attempt: number | null
    ypa: number | null
    yprr: number | null
    zone_attempts: number | null
  }
  
  export interface ReceivingStats {
    id: string
    player: string
    player_id: number
    player_game_count: number
    position: string
    avg_depth_of_target: number | null
    avoided_tackles: number | null
    caught_percent: number | null
    contested_catch_rate: number | null
    contested_receptions: number | null
    contested_targets: number | null
    drop_rate: number | null
    drops: number | null
    first_downs: number | null
    grades_hands_drop: number | null
    grades_hands_fumble: number | null
    grades_offense: number | null
    grades_pass_block: number | null
    grades_pass_route: number | null
    longest: number | null
    pass_block_rate: number | null
    pass_blocks: number | null
    pass_plays: number | null
    penalties: number | null
    receptions: number | null
    route_rate: number | null
    routes: number | null
    slot_rate: number | null
    slot_snaps: number | null
    targeted_qb_rating: number | null
    targets: number | null
    touchdowns: number | null
    wide_rate: number | null
    wide_snaps: number | null
    yards: number | null
    yards_after_catch: number | null
    yards_after_catch_per_reception: number | null
    yards_per_reception: number | null
    yprr: number | null
    rb_target_share: number | null
    wr_target_share: number | null
  }

  export interface TeamStats {
    id: string
    rank: number
    team: string
    team_id: number
    current_year: number
    current_year_avg: number
    last_1: number | null
    last_3: number | null
    previous_year: number | null
    previous_year_avg: number | null
    away: number | null
    away_avg: number | null
    home: number | null
    home_avg: number | null
    source_sheet: string
  }