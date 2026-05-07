import { GamePatchSchema, MAX_TOKEN_LABEL, TOKEN_RE, CHANNEL_RE } from '@magic-sentry/shared'
import type { GamePatch } from './types.js'

export { MAX_TOKEN_LABEL, TOKEN_RE, CHANNEL_RE }

// ---------------------------------------------------------------------------
// Patch validation
// ---------------------------------------------------------------------------

type PatchResult = { error: string } | { data: GamePatch }

export function validatePatch(body: unknown): PatchResult {
  const result = GamePatchSchema.safeParse(body)
  if (!result.success) {
    const issue = result.error.issues[0]
    const path = issue?.path.join('.')
    const msg = issue?.message ?? 'invalid'
    return { error: path ? `${path}: ${msg}` : msg }
  }
  return { data: result.data }
}

// ---------------------------------------------------------------------------
// Token label
// ---------------------------------------------------------------------------

export function validateTokenLabel(label: unknown): string | null {
  if (label === undefined || label === null) return null
  if (typeof label !== 'string') return 'label must be a string'
  if (label.length > MAX_TOKEN_LABEL) return `label too long (max ${MAX_TOKEN_LABEL} chars)`
  return null
}
