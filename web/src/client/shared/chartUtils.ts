import { Sample } from './types'
import { WORKERS, HERO_OBSERVER, UNIT_SUPPLY } from './wc3data'

export const PLAYER_COLORS = ['#58a6ff', '#ff7b72', '#3fb950', '#d2a8ff', '#ffa657']
export const UNIT_COLORS = [
  '#58a6ff',
  '#3fb950',
  '#d4a843',
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

export const HERO_OBSERVER_NAMES = new Set(Object.keys(HERO_OBSERVER))

export function heroSupply(n: string): number {
  return HERO_OBSERVER_NAMES.has(n) ? 5 : (UNIT_SUPPLY[n] ?? 1)
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

export function buildLayers(samples: Sample[]): string[] {
  const unitNames = [
    ...new Set(samples.flatMap((s) => s.units.filter((u) => u.alive > 0).map((u) => u.name))),
  ]
  const heroNames = [
    ...new Set(samples.flatMap((s) => s.heroes.filter((h) => h.hp > 0).map((h) => h.name))),
  ]
  const allNames = [...new Set([...unitNames, ...heroNames])]
  const peakSupply = Object.fromEntries(
    allNames.map((n) => [
      n,
      Math.max(
        ...samples.map((s) => {
          if (HERO_OBSERVER_NAMES.has(n))
            return s.heroes.some((h) => h.name === n && h.hp > 0) ? 5 : 0
          return (s.units.find((u) => u.name === n)?.alive ?? 0) * heroSupply(n)
        }),
      ),
    ]),
  )
  const workers = allNames
    .filter((n) => WORKERS.has(n))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  const heroes = allNames
    .filter((n) => HERO_OBSERVER_NAMES.has(n))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  const others = allNames
    .filter((n) => !WORKERS.has(n) && !HERO_OBSERVER_NAMES.has(n))
    .sort((a, b) => peakSupply[b] - peakSupply[a])
  return [...workers, ...others, ...heroes]
}

export function buildByTime(samples: Sample[]): Record<string, number>[] {
  return samples.map((s) => {
    const map: Record<string, number> = Object.fromEntries(s.units.map((u) => [u.name, u.alive]))
    for (const h of s.heroes) if (h.hp > 0) map[h.name] = (map[h.name] ?? 0) + 1
    return map
  })
}

export function buildAreas(
  samples: Sample[],
  layers: string[],
  byTime: Record<string, number>[],
  xOf: (t: number) => number,
  yOf: (v: number) => number,
  weight: (name: string) => number = () => 1,
  colorOf: (name: string, idx: number) => string = (_, i) => UNIT_COLORS[i % UNIT_COLORS.length],
): { name: string; d: string; fill: string }[] {
  return layers.map((name, li) => {
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
    return { name, d: `${fwd} ${bwd} Z`, fill: colorOf(name, li) }
  })
}
