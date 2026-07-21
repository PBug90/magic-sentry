import { useState, type CSSProperties } from 'react'
import type { TabKey, VIEWER_TABS } from '@magic-sentry/viewer'
import { TAB_ICONS, SettingsIcon, type RailKey } from './icons'

export const RAIL_WIDTH = 52

/** Everything the rail can open in the docked panel. */
export type PanelKey = RailKey | 'settings'

const btnBase: CSSProperties = {
  width: 38,
  height: 38,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid transparent',
  borderRadius: 9,
  cursor: 'pointer',
  background: 'rgba(14,14,16,0.62)',
  color: '#9a9aa2',
  transition: 'color .12s, background .12s, border-color .12s',
  padding: 0,
  // The rail strip itself is click-through; each button opts back in so the
  // collapsed stream stays fully interactive except where a control sits.
  pointerEvents: 'auto',
}

function RailButton({
  icon,
  label,
  active,
  onClick,
  dim,
}: {
  icon: React.ReactNode
  label: string
  active?: boolean
  onClick: () => void
  dim?: boolean
}) {
  const [hover, setHover] = useState(false)
  const style: CSSProperties = {
    ...btnBase,
    background: active
      ? 'rgba(200,160,80,0.18)'
      : hover
        ? 'rgba(40,40,54,0.78)'
        : btnBase.background,
    border: active ? '1px solid rgba(200,160,80,0.55)' : btnBase.border,
    color: active ? '#c8a050' : dim && !hover ? '#5a5a64' : hover ? '#efeff1' : btnBase.color,
  }
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={style}
    >
      {icon}
    </button>
  )
}

export function OverlayRail({
  tabs,
  activeKey,
  onSelect,
  open,
  onToggleOpen,
}: {
  tabs: typeof VIEWER_TABS
  activeKey: PanelKey | null
  onSelect: (key: PanelKey | null) => void
  open: boolean
  onToggleOpen: () => void
}) {
  const toggle = (key: PanelKey) => onSelect(activeKey === key ? null : key)

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        right: 0,
        bottom: 0,
        width: RAIL_WIDTH,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 6,
        padding: '8px 0',
        overflowY: 'auto',
        // Strip is click-through; only the buttons inside capture pointer events.
        pointerEvents: 'none',
      }}
    >
      {/* Always-visible Magic Sentry logo: toggles the rest of the rail. */}
      <RailButton
        icon={
          <img
            src="./magicsentry.webp"
            alt=""
            width={22}
            height={22}
            style={{ imageRendering: 'auto', flexShrink: 0 }}
          />
        }
        label={open ? 'Hide panels' : 'Show panels'}
        active={open}
        onClick={onToggleOpen}
      />

      {open && (
        <>
          <div
            style={{ width: 22, height: 1, background: '#2a2a3a', margin: '4px 0', flexShrink: 0 }}
          />

          {tabs.map(({ key, label }: { key: TabKey; label: string }) => (
            <RailButton
              key={key}
              icon={TAB_ICONS[key]}
              label={label}
              active={activeKey === key}
              onClick={() => toggle(key)}
            />
          ))}
          <RailButton
            icon={TAB_ICONS.encyclopedia}
            label="Encyclopedia"
            active={activeKey === 'encyclopedia'}
            onClick={() => toggle('encyclopedia')}
          />

          <div
            style={{ width: 22, height: 1, background: '#2a2a3a', margin: '4px 0', flexShrink: 0 }}
          />

          <RailButton
            icon={SettingsIcon}
            label="Settings"
            active={activeKey === 'settings'}
            onClick={() => toggle('settings')}
          />
        </>
      )}
    </div>
  )
}
