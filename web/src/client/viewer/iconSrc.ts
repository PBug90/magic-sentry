export function iconSrc(path: string): string {
  return (window as any).__ICON_MAP__?.[path] ?? path
}
