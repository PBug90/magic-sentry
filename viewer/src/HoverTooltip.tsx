import { useRef, useLayoutEffect, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

export function HoverTooltip({ children }: { children: ReactNode }) {
  const anchorRef = useRef<HTMLSpanElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const anchor = anchorRef.current
    const tip = tooltipRef.current
    if (!anchor || !tip) return

    // Inherit computed font size from the anchor's CSS context, scale down for tooltip
    const parentFontSize = parseFloat(getComputedStyle(anchor).fontSize)
    tip.style.fontSize = `${parentFontSize * 0.7}px`

    const ar = anchor.getBoundingClientRect()
    const tr = tip.getBoundingClientRect()

    const pad = 8
    let left = ar.left + ar.width / 2 - tr.width / 2
    let top = ar.top - tr.height - 4

    // Clamp horizontally
    left = Math.max(pad, Math.min(left, window.innerWidth - tr.width - pad))
    // Flip below if too close to top
    if (top < pad) top = ar.bottom + 4

    tip.style.left = `${left}px`
    tip.style.top = `${top}px`
    tip.style.visibility = 'visible'
  })

  return (
    <>
      {/* Zero-size anchor fills the parent to give us its bounding rect */}
      <span ref={anchorRef} style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />
      {createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            left: 0,
            top: 0,
            visibility: 'hidden',
            background: '#0f0f1a',
            border: '1px solid #2a2a3a',
            borderRadius: 3,
            padding: '4px 8px',
            whiteSpace: 'nowrap',
            zIndex: 9999,
            pointerEvents: 'none',
            lineHeight: 1.5,
            color: '#f0ece0',
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
          }}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  )
}
