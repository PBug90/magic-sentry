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

/** Lumber log — intrinsically green to match the lumber accent. */
export function LumberIcon({ size = 11 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" style={base(size)} aria-hidden="true">
      <rect
        x="2"
        y="5.5"
        width="12"
        height="5"
        rx="2.5"
        fill="#5a8f4a"
        stroke="#3a6230"
        strokeWidth={1}
      />
      <ellipse cx="3.4" cy="8" rx="1.1" ry="2.1" fill="#3a6230" />
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
