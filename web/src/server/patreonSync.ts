import { authStore } from './authStore.js'
import { patreonConfigured, campaignId, fetchCampaignMembers, refreshTokens } from './patreon.js'

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000 // 6h

/**
 * One reconcile pass: refresh the creator token, then read the campaign members
 * and update every linked user.
 *
 * The creator access token expires (~31 days), so we refresh it proactively on
 * every run — tie the sync interval to roughly daily and it will never lapse.
 * Patreon issues a new refresh token on each use (single-use), so the fresh pair
 * is persisted immediately, before it's used.
 */
export async function runPatreonSync(): Promise<void> {
  if (!patreonConfigured() || !campaignId()) return
  const tokens = await authStore.getCreatorTokens()
  if (!tokens) {
    console.warn('[patreon] no creator token — set PATREON_CREATOR_ACCESS_TOKEN/REFRESH_TOKEN')
    return
  }

  try {
    const fresh = await refreshTokens(tokens.refreshToken)
    await authStore.saveCreatorTokens(fresh)
    const members = await fetchCampaignMembers(fresh.accessToken)
    const n = await authStore.syncAllPatreon(members)
    console.log(`[patreon] synced ${n} linked user(s)`)
  } catch (e) {
    console.error('[patreon] sync failed:', e)
  }
}

/** Kick off the periodic sync (no-op when Patreon isn't configured). */
export function startPatreonSync(): void {
  if (!patreonConfigured() || !campaignId()) {
    console.log('[patreon] periodic sync disabled (PATREON_CLIENT_ID / PATREON_CAMPAIGN_ID unset)')
    return
  }
  const interval = Number(process.env.PATREON_SYNC_INTERVAL_MS) || DEFAULT_INTERVAL_MS
  void runPatreonSync()
  setInterval(() => void runPatreonSync(), interval)
  console.log(`[patreon] periodic member sync every ${Math.round(interval / 1000)}s`)
}
