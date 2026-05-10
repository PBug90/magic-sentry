import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ICON_MAP } from './standalone/iconMap'
import { StandaloneViewer } from './standalone/StandaloneViewer'
import type { GameRecord } from './shared/types'
import './index.css'
;(window as any).__ICON_MAP__ = ICON_MAP

const game = (window as any).__GAME_DATA__ as GameRecord

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StandaloneViewer game={game} />
  </StrictMode>,
)
