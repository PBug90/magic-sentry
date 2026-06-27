import type { Sample } from './types.js'
import { WORKERS_BY_ID, HERO_OBSERVER_IDS, UNIT_SUPPLY_BY_ID } from '@magic-sentry/wc3data'

export const PLAYER_COLORS = ['#58a6ff', '#ff7b72', '#3fb950', '#d2a8ff', '#ffa657']
export const UNIT_COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d2a8ff',
  '#ffa657',
  '#ff7b72',
  '#79c0ff',
  '#56d364',
  '#f0c040',
  '#bc8cff',
  '#ff9bce',
  '#87d96c',
  '#ffb77e',
  '#a5d6ff',
  '#c9e0a0',
]

/** All heroes share this amber color regardless of race. */
export const HERO_COLOR = '#d4a843'

function hashId(id: string): number {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) & 0x7fffffff
  return h
}

/** Deterministic color for a unit or hero id. All heroes share HERO_COLOR. */
export function unitColor(id: string): string {
  if (HERO_OBSERVER_IDS.has(id)) return HERO_COLOR
  return UNIT_COLORS[hashId(id) % UNIT_COLORS.length]
}

/** Supply cost for a unit or hero id. Heroes cost 5 food in the army chart. */
export function heroSupply(id: string): number {
  return HERO_OBSERVER_IDS.has(id) ? 5 : (UNIT_SUPPLY_BY_ID[id] ?? 1)
}

export function formatDuration(ms: number): string {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  const h = Math.floor(m / 60)
  if (h > 0) return `${h}:${String(m % 60).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
  return `${m}:${String(s % 60).padStart(2, '0')}`
}

export function fmtTime(sec: number): string {
  const m = Math.floor(sec / 60)
  const s = Math.floor(sec % 60)
  return `${m}:${String(s).padStart(2, '0')}`
}

export function niceMax(val: number, step: number): number {
  return Math.ceil(Math.max(val, step) / step) * step
}

export function timeTicks(maxSec: number): number[] {
  const step = maxSec > 1800 ? 600 : maxSec > 600 ? 300 : 120
  const ticks: number[] = []
  for (let t = 0; t <= maxSec; t += step) ticks.push(t)
  return ticks
}

export function nearestSample(samples: Sample[], targetSec: number): Sample | null {
  if (samples.length === 0) return null
  const ms = targetSec * 1000
  return samples.reduce((best, s) =>
    Math.abs(s.time_ms - ms) < Math.abs(best.time_ms - ms) ? s : best,
  )
}

export function nearestSampleIdx(samples: Sample[], targetSec: number): number {
  const ms = targetSec * 1000
  return samples.reduce(
    (best, s, i) => (Math.abs(s.time_ms - ms) < Math.abs(samples[best].time_ms - ms) ? i : best),
    0,
  )
}

/** Build sorted layer order: workers first, then others by peak supply desc, heroes on top. */
export function buildLayers(samples: Sample[]): string[] {
  const unitIds = [
    ...new Set(samples.flatMap((s) => s.units.filter((u) => u.alive > 0).map((u) => u.id))),
  ]
  const heroIds = [
    ...new Set(samples.flatMap((s) => s.heroes.filter((h) => h.hp > 0).map((h) => h.id))),
  ]
  const allIds = [...new Set([...unitIds, ...heroIds])]
  const peakSupply = Object.fromEntries(
    allIds.map((id) => [
      id,
      Math.max(
        ...samples.map((s) => {
          if (HERO_OBSERVER_IDS.has(id))
            return s.heroes.some((h) => h.id === id && h.hp > 0) ? 5 : 0
          return (s.units.find((u) => u.id === id)?.alive ?? 0) * heroSupply(id)
        }),
      ),
    ]),
  )
  const workers = allIds
    .filter((id) => WORKERS_BY_ID.has(id))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  const heroes = allIds
    .filter((id) => HERO_OBSERVER_IDS.has(id))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  const others = allIds
    .filter((id) => !WORKERS_BY_ID.has(id) && !HERO_OBSERVER_IDS.has(id))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  return [...workers, ...others, ...heroes]
}

/** Map id → count (alive units + alive heroes) per sample. */
export function buildByTime(samples: Sample[]): Record<string, number>[] {
  return samples.map((s) => {
    const map: Record<string, number> = Object.fromEntries(s.units.map((u) => [u.id, u.alive]))
    for (const h of s.heroes) if (h.hp > 0) map[h.id] = (map[h.id] ?? 0) + 1
    return map
  })
}

/** Compute stacked SVG closed-area paths for a set of layers. */
export function buildAreas(
  samples: Sample[],
  layers: string[],
  byTime: Record<string, number>[],
  xOf: (t: number) => number,
  yOf: (v: number) => number,
  weight: (id: string) => number = () => 1,
  colorOf: (id: string, idx: number) => string = (_, i) => UNIT_COLORS[i % UNIT_COLORS.length],
): { name: string; d: string; fill: string }[] {
  return layers.map((id, li) => {
    const topPts = samples.map((_, si) => {
      const cum = layers
        .slice(0, li + 1)
        .reduce((sum, n) => sum + (byTime[si][n] ?? 0) * weight(n), 0)
      return [xOf(samples[si].time_ms / 1000), yOf(cum)] as [number, number]
    })
    const botPts = samples.map((_, si) => {
      const cum = layers.slice(0, li).reduce((sum, n) => sum + (byTime[si][n] ?? 0) * weight(n), 0)
      return [xOf(samples[si].time_ms / 1000), yOf(cum)] as [number, number]
    })
    const fwd = topPts
      .map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ')
    const bwd = [...botPts]
      .reverse()
      .map(([x, y]) => `L${x.toFixed(1)},${y.toFixed(1)}`)
      .join(' ')
    return { name: id, d: `${fwd} ${bwd} Z`, fill: colorOf(id, li) }
  })
}
