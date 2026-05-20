import { EncyclopediaPanel } from '@magic-sentry/viewer'

function webIconSrc(path: string): string {
  return (window as any).__ICON_MAP__?.[path] ?? path
}

export function EncyclopediaPage() {
  return (
    <div style={{ height: 'calc(100vh - 48px)', overflow: 'hidden' }}>
      <EncyclopediaPanel iconSrc={webIconSrc} />
    </div>
  )
}
