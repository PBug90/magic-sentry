// Minimal type declarations for window.Twitch.ext (Extension Helper v1)

interface TwitchExtAuth {
  channelId: string
  clientId: string
  token: string
  helixToken: string
  userId: string
}

interface TwitchExtContext {
  theme: 'light' | 'dark'
  mode: 'config' | 'dashboard' | 'viewer'
  language: string
  locale: string
  isPaused: boolean
  isFullScreen: boolean
  isTheatreMode: boolean
  arePlayerControlsVisible: boolean
  [key: string]: unknown
}

interface TwitchConfigSegment {
  version: string
  content: string
}

interface TwitchExtConfiguration {
  broadcaster?: TwitchConfigSegment
  developer?: TwitchConfigSegment
  global?: TwitchConfigSegment
  onChanged(cb: () => void): void
  set(segment: 'broadcaster' | 'developer' | 'global', version: string, content: string): void
}

interface TwitchExt {
  onAuthorized(cb: (auth: TwitchExtAuth) => void): void
  onContext(cb: (ctx: Partial<TwitchExtContext>, delta: string[]) => void): void
  onError(cb: (err: unknown) => void): void
  configuration: TwitchExtConfiguration
}

interface Window {
  Twitch: { ext: TwitchExt }
}
