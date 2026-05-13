import { useState, useEffect } from 'react'
import { ExtensionConfig, DEFAULT_CONFIG } from '../../shared/types'

export function useTwitchConfig(): { config: ExtensionConfig; configReady: boolean } {
  const [config, setConfig] = useState<ExtensionConfig>(DEFAULT_CONFIG)
  const [configReady, setConfigReady] = useState(false)

  useEffect(() => {
    const ext = window.Twitch?.ext
    console.log('[viewer] useEffect — window.Twitch.ext present:', !!ext)
    if (!ext) {
      console.warn('[viewer] window.Twitch.ext not available — overlay will not load config')
      return
    }

    function applyConfig() {
      console.log('[viewer] applyConfig called')
      const seg = ext.configuration.broadcaster
      console.log('[viewer] broadcaster segment:', seg ?? 'undefined')
      if (seg?.content) {
        try {
          const parsed = JSON.parse(seg.content) as ExtensionConfig
          console.log('[viewer] parsed config:', parsed)
          setConfig(parsed)
        } catch (e) {
          console.error('[viewer] failed to parse broadcaster segment:', e)
        }
      } else {
        console.log(
          '[viewer] no broadcaster segment content — polling disabled until config is set',
        )
      }
      setConfigReady(true)
    }

    console.log('[viewer] registering onAuthorized + onChanged')
    ext.configuration.onChanged(() => {
      console.log('[viewer] onChanged fired')
      applyConfig()
    })
    ext.onAuthorized((auth) => {
      console.log('[viewer] onAuthorized fired — full auth object:', auth)
      console.log('[viewer] ext.viewer:', (ext as any).viewer)
      console.log('[viewer] ext.features:', (ext as any).features)
      console.log('[viewer] ext.configuration.broadcaster:', ext.configuration.broadcaster)
      console.log('[viewer] ext.configuration.developer:', ext.configuration.developer)
      console.log('[viewer] ext.configuration.global:', ext.configuration.global)
      applyConfig()
    })
    ext.onContext((context, changed) => {
      console.log('[viewer] onContext fired — changed fields:', changed)
      console.log('[viewer] full context:', context)
    })
    ext.onError((e) => console.error('[viewer] Twitch ext error:', e))
  }, [])

  return { config, configReady }
}
