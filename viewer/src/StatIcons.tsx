const base = (size: number) =>
  ({ width: size, height: size, verticalAlign: '-2px', flexShrink: 0 }) as const

/** Mana droplet — intrinsically blue. */
export function ManaIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" style={base(size)} aria-hidden="true">
      <path d="M8 1.5C8 1.5 3 7 3 10.2A5 5 0 0 0 13 10.2C13 7 8 1.5 8 1.5Z" fill="#5aa9e6" />
    </svg>
  )
}

/** Cooldown clock — inherits text color via currentColor. */
export function CooldownIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      style={base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8.5" r="5.5" />
      <path d="M8 5.5V8.5L10.2 10" />
    </svg>
  )
}

/** Gold coin — intrinsically gold. */
export function GoldIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" style={base(size)} aria-hidden="true">
      <circle cx="8" cy="8" r="6" fill="#e8cd8a" stroke="#9a7a38" strokeWidth={1} />
      <circle cx="8" cy="8" r="2.8" fill="none" stroke="#9a7a38" strokeWidth={1} />
    </svg>
  )
}

/**
 * Lumber pine — mirrors the rail menu-button lumber icon (a green pine with a
 * brown trunk) so lumber reads the same across the rail and tooltips. Kept in
 * sync by hand: the rail's copy lives in the extension's icons.tsx, which this
 * shared package can't import.
 */
export function LumberIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" style={base(size)} aria-hidden="true">
      <rect x="10.7" y="15" width="2.6" height="6" rx="0.4" fill="#7a4a1e" />
      <path
        d="M12 3l4.6 6.6h-2.8L18 16H6l4.2-6.4H7.4z"
        fill="#3fa34d"
        stroke="#2f7d3a"
        strokeWidth={1}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Range target — inherits text color via currentColor. */
export function RangeIcon({ size = 11 }: { size?: number }) {
  return (
    <svg
      viewBox="0 0 16 16"
      style={base(size)}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="8" cy="8" r="5.5" />
      <path d="M8 1.5V3.5M8 12.5V14.5M1.5 8H3.5M12.5 8H14.5" />
      <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  )
}
