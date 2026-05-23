export interface TwitchUser {
  id: string
  login: string
  display_name: string
  profile_image_url: string
  allowed: boolean
}

export interface GameSummary {
  game_id: string
  channel: string
  map: string
  game: string
  is_final: boolean
  latest_seq: number
  patch_count: number
  updated_at: string
}
