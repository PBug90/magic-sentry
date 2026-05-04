import { ChartPlayer, HeroSample } from '../shared/types'
import { HERO_OBSERVER } from '@magic-sentry/shared'

function resolveHeroDisplayName(name: string): string {
  return HERO_OBSERVER[name.toLowerCase().replace(/\s+/g, '')]?.display ?? name
}

const _HERO_ICON: Record<string, string> = {
  Archmage: 'Hamg',
  'Mountain King': 'Hmkg',
  Paladin: 'Hpal',
  'Blood Mage': 'Hblm',
  Blademaster: 'Obla',
  'Far Seer': 'Ofar',
  'Shadow Hunter': 'Oshd',
  'Tauren Chieftain': 'Otch',
  'Death Knight': 'Udea',
  Dreadlord: 'Udre',
  Lich: 'Ulic',
  'Crypt Lord': 'Ucrl',
  'Demon Hunter': 'Edem',
  'Keeper of the Grove': 'Ekee',
  'Priestess of the Moon': 'Emoo',
  Warden: 'Ewar',
  Alchemist: 'Nalc',
  Beastmaster: 'Nbst',
  'Fire Lord': 'Nfir',
  'Naga Sea Witch': 'Nngs',
  'Pandaren Brewmaster': 'Npbm',
  'Pit Lord': 'Nplh',
  Tinker: 'Ntin',
}

function resolveHeroIconId(name: string): string | null {
  return _HERO_ICON[name] ?? HERO_OBSERVER[name.toLowerCase().replace(/\s+/g, '')]?.icon ?? null
}

// Unified hero display shape — works for both HeroFinal (summary) and HeroSample (live).
interface HeroDisplay {
  name: string
  level: number
  xp: number
  deaths: number
  damage_dealt: number
  damage_received: number
  healing_done: number
}

/** When the final summary isn't available yet, derive one entry per hero from the
 *  most recent sample that mentions them. */
function heroesFromSamples(player: ChartPlayer): HeroDisplay[] {
  const latest = new Map<string, HeroSample>()
  for (const sample of player.samples) {
    for (const h of sample.heroes) {
      latest.set(h.name, h)
    }
  }
  return [...latest.values()]
}

function HeroIcon({ name, size = 44 }: { name: string; size?: number }) {
  const id = resolveHeroIconId(name)
  if (!id) {
    return (
      <div
        style={{
          width: size,
          height: size,
          background: '#1a1a23',
          border: '1px solid #2a2a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 8, color: '#555' }}>?</span>
      </div>
    )
  }
  return (
    <div
      style={{
        width: size,
        height: size,
        border: '1px solid #2a2a3a',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <img
        src={`/heroes/${id}.png`}
        alt={name}
        title={name}
        width={size}
        height={size}
        style={{ display: 'block', imageRendering: 'pixelated', width: '100%', height: '100%' }}
        onError={(e) => {
          ;(e.currentTarget as HTMLImageElement).style.display = 'none'
        }}
      />
    </div>
  )
}

function HeroCard({
  hero,
  player,
  index,
}: {
  hero: HeroDisplay
  player: ChartPlayer
  index: number
}) {
  return (
    <div
      style={{
        display: 'flex',
        gap: 10,
        alignItems: 'center',
        padding: '8px 10px',
        background: '#12121a',
        border: '1px solid #2a2a3a',
        borderLeft: `3px solid ${player.color}`,
      }}
    >
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <HeroIcon name={hero.name} size={44} />
        <span
          style={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            fontSize: '.48rem',
            background: 'rgba(0,0,0,0.78)',
            color: '#c8a050',
            padding: '1px 4px',
            letterSpacing: '.06em',
            fontFamily: 'monospace',
          }}
        >
          {index + 1}
        </span>
      </div>
      <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
          <span style={{ fontSize: '.8rem', color: '#efeff1', letterSpacing: '.02em' }}>
            {resolveHeroDisplayName(hero.name)}
          </span>
          <span
            style={{ fontSize: '.65rem', color: '#c8a050', fontFamily: 'monospace', opacity: 0.85 }}
          >
            Lv.{hero.level}
          </span>
          <span style={{ fontSize: '.58rem', color: '#555', fontFamily: 'monospace' }}>
            {hero.xp.toLocaleString()} xp
          </span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
          {(
            [
              ['Deaths', hero.deaths],
              ['Dmg dealt', hero.damage_dealt.toLocaleString()],
              ['Dmg recv', hero.damage_received.toLocaleString()],
              ['Healing', hero.healing_done.toLocaleString()],
            ] as Array<[string, string | number]>
          ).map(([label, val]) => (
            <span key={label} style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <span
                style={{
                  fontSize: '.5rem',
                  color: '#555',
                  letterSpacing: '.06em',
                  fontFamily: 'monospace',
                }}
              >
                {label}
              </span>
              <span style={{ fontSize: '.66rem', color: '#efeff1', fontFamily: 'monospace' }}>
                {val}
              </span>
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}

export function HeroPanel({ players }: { players: ChartPlayer[] }) {
  const playersWithHeroes = players
    .map((player) => {
      const heroes: HeroDisplay[] =
        player.summary.heroes.length > 0
          ? [...player.summary.heroes].reverse()
          : heroesFromSamples(player)
      return { player, heroes }
    })
    .filter(({ heroes }) => heroes.length > 0)

  if (playersWithHeroes.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {playersWithHeroes.map(({ player, heroes }) => (
        <div key={player.name} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            style={{
              fontSize: '.62rem',
              letterSpacing: '.12em',
              color: player.color,
              fontFamily: 'monospace',
              textTransform: 'uppercase',
            }}
          >
            {player.name}
          </div>
          {heroes.map((hero, i) => (
            <HeroCard key={hero.name} hero={hero} player={player} index={i} />
          ))}
        </div>
      ))}
    </div>
  )
}
