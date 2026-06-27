import type { ReactNode } from 'react'
import type { TabKey } from '@magic-sentry/viewer'

// Minimal hand-authored icons (no icon-library dependency). Monochrome icons
// draw with currentColor so the rail can recolor them on active/hover; the two
// resource icons (gold, lumber) carry their own thematic colours.

function Svg({ children, size = 18 }: { children: ReactNode; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  )
}

export type RailKey = TabKey | 'encyclopedia'

export const TAB_ICONS: Record<RailKey, ReactNode> = {
  heroes: (
    <Svg>
      <path d="M5 17h14l1-9-5 3-3-5-3 5-5-3z" />
      <path d="M5 20h14" />
    </Svg>
  ),
  // Open treasure chest with a pile of gold inside.
  items: (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 9.5l1-2.6A1.6 1.6 0 0 1 6.5 6h11A1.6 1.6 0 0 1 19 6.9l1 2.6z"
        fill="#9c6329"
        stroke="#5a3514"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M4.5 9.5h15V19a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1z"
        fill="#8a5524"
        stroke="#5a3514"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path
        d="M6 10.5h12c-.4 2.6-3 4-6 4s-5.6-1.4-6-4z"
        fill="#e6b23a"
        stroke="#a9781b"
        strokeWidth="0.8"
      />
      <circle cx="9" cy="10.4" r="1.1" fill="#f5d061" stroke="#a9781b" strokeWidth="0.6" />
      <circle cx="12" cy="10" r="1.1" fill="#f5d061" stroke="#a9781b" strokeWidth="0.6" />
      <circle cx="15" cy="10.4" r="1.1" fill="#f5d061" stroke="#a9781b" strokeWidth="0.6" />
    </svg>
  ),
  // Golden coin — keeps its colour so it always reads as gold.
  gold: (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="9" fill="#e6b23a" stroke="#a9781b" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="5.4" fill="none" stroke="#a9781b" strokeWidth="1.5" />
      <path
        d="M8.6 8.6a5 5 0 0 1 2.9-1.5"
        fill="none"
        stroke="#fff3d0"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.75"
      />
    </svg>
  ),
  // Green pine tree with a brown trunk.
  lumber: (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <rect x="10.7" y="15" width="2.6" height="6" rx="0.4" fill="#7a4a1e" />
      <path
        d="M12 3l4.6 6.6h-2.8L18 16H6l4.2-6.4H7.4z"
        fill="#3fa34d"
        stroke="#2f7d3a"
        strokeWidth="1"
        strokeLinejoin="round"
      />
    </svg>
  ),
  // Chicken drumstick — browned meat with a cream bone.
  food: (
    <svg width={18} height={18} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M18.4 5.6a5 5 0 0 0-8.4 5.2l-1.7 1.7a2.2 2.2 0 1 0 3.1 3.1l1.7-1.7a5 5 0 0 0 5.3-8.3z"
        fill="#cd7f3f"
        stroke="#8a4e22"
        strokeWidth="1"
        strokeLinejoin="round"
      />
      <path d="M8.9 14.3l-2.6 2.6" stroke="#efe3c8" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="5.5" cy="17" r="1.5" fill="#efe3c8" />
      <circle cx="7.2" cy="18.7" r="1.3" fill="#efe3c8" />
    </svg>
  ),
  // Two crossed swords.
  armies: (
    <Svg>
      <polyline points="14.5 17.5 3 6 3 3 6 3 17.5 14.5" />
      <line x1="13" y1="19" x2="19" y2="13" />
      <line x1="16" y1="16" x2="20" y2="20" />
      <line x1="19" y1="21" x2="21" y2="19" />
      <polyline points="14.5 6.5 18 3 21 3 21 6 17.5 9.5" />
      <line x1="5" y1="14" x2="9" y2="18" />
      <line x1="7" y1="17" x2="4" y2="20" />
      <line x1="3" y1="19" x2="5" y2="21" />
    </Svg>
  ),
  army: (
    <Svg>
      <path d="M4 5v14h16" />
      <path d="M7 14l3-4 3 2 4-6" />
    </Svg>
  ),
  apm: (
    <Svg>
      <path d="M3 12h4l2-6 4 12 2-6h6" />
    </Svg>
  ),
  fights: (
    <Svg>
      <path d="M14 3h4v4l-9 9-4-4z" />
      <path d="M9 17l-2 2 M5 13l-2 2 4 4 2-2" />
    </Svg>
  ),
  timeline: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4l3 2" />
    </Svg>
  ),
  // Tourist-information "i" in a circle.
  encyclopedia: (
    <Svg>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5" />
      <path d="M12 8h.01" />
    </Svg>
  ),
}

// Cog wheel with teeth.
export const SettingsIcon = (
  <Svg>
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
)

export const HideIcon = (
  <Svg>
    <path d="M3 3l18 18" />
    <path d="M10.6 10.6a3 3 0 0 0 4.2 4.2" />
    <path d="M9.9 4.5A9 9 0 0 1 21 12a9 9 0 0 1-1.5 2.5" />
    <path d="M6.3 6.3A9 9 0 0 0 3 12a9 9 0 0 0 12 5" />
  </Svg>
)
