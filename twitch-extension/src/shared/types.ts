export type {
  HeroSample,
  UnitSnapshot,
  Sample,
  HeroFinal,
  UnitSummary,
  PlayerSummary,
  PlayerRecord,
  GameRecord,
  ChartPlayer,
  PlayerPatch,
  GamePatch,
} from '@magic-sentry/shared'

// ---------------------------------------------------------------------------
// Extension configuration stored in Twitch Configuration Service
// ---------------------------------------------------------------------------

export interface ExtensionConfig {
  endpointUrl: string
  pollIntervalSec: number
  token: string
}

export const DEFAULT_CONFIG: ExtensionConfig = {
  endpointUrl: '',
  pollIntervalSec: 5,
  token: '',
}
