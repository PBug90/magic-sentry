import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Config } from './Config'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Config />
  </StrictMode>,
)
