import { createContext, useContext, useCallback } from 'react'

const IconSrcContext = createContext<(path: string) => string>((p) => p)

export const IconSrcProvider = IconSrcContext.Provider

export function useIconSrc(): (path: string) => string {
  return useContext(IconSrcContext)
}

// Opacity applied to panel surface fills. Defaults to 1 (fully opaque) so the
// standalone and web viewers are unchanged; the Twitch overlay supplies the
// broadcaster's opacity slider value, letting inner panel surfaces reveal the
// stream just like the outer docked panel does. Tooltips deliberately opt out
// (they must stay legible), so they keep their own fixed colours.
const PanelOpacityContext = createContext<number>(1)

export const PanelOpacityProvider = PanelOpacityContext.Provider

export function usePanelOpacity(): number {
  return useContext(PanelOpacityContext)
}

/** Convert a `#rrggbb` (or `#rgb`) surface colour to an `rgba()` at `alpha`. */
export function withAlpha(hex: string, alpha: number): string {
  let h = hex.replace('#', '')
  if (h.length === 3) {
    h = h
      .split('')
      .map((c) => c + c)
      .join('')
  }
  const n = parseInt(h, 16)
  const r = (n >> 16) & 255
  const g = (n >> 8) & 255
  const b = n & 255
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * Returns a helper that tints a fixed panel-surface colour with the active panel
 * opacity. At the default opacity of 1 the result is the original colour, so
 * non-overlay viewers render identically.
 */
export function useSurfaceBg(): (hex: string) => string {
  const opacity = usePanelOpacity()
  return useCallback((hex: string) => withAlpha(hex, opacity), [opacity])
}
