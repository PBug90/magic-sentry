import { useState, useEffect } from 'react'
import { ExtensionConfig, DEFAULT_CONFIG } from '../../shared/types'

export function useTwitchConfig(): { config: ExtensionConfig; configReady: boolean } {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG)
  const [configReady, setConfigReady] = useState(false)

  useEffect(() => {
    const ext = window.Twitch?.ext
    if (!ext) return

    function applyConfig() {
      const seg = ext.configuration.broadcaster
      if (seg?.content) {
        try {
          const parsed = JSON.parse(seg.content) as ExtensionConfig
          setConfig(parsed)
        } catch {
          // ignore malformed config
        }
      }
      setConfigReady(true)
    }

    ext.configuration.onChanged(() => {
      applyConfig()
    })
    ext.onAuthorized(() => {
      applyConfig()
    })
  }, [])

  return { config, configReady }
}
