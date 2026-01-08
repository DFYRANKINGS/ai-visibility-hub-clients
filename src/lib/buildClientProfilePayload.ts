import { CLIENT_PROFILE_COLUMNS } from './clientProfileColumns';

// Keys that exist in UI state but are NOT database columns
// These are assembled into JSONB or are purely UI helpers - safe to ignore
const UI_ONLY_KEYS = new Set([
  'id', // UI/XLSX row identifier - not a payload column
  'address_street',
  'address_city',
  'address_state',
  'address_postal_code',
]);

/**
 * Strict payload builder for client_profile upserts.
 * 
 * Rules:
 * - UI-only keys are silently dropped (they're assembled into JSONB elsewhere)
 * - Unknown keys cause a HARD FAILURE - never save with bad data
 * - Returns only whitelisted columns
 */
export function buildClientProfilePayload(formData: any): Record<string, any> {
  const payload: Record<string, any> = {};
  const unknownKeys: string[] = [];

  for (const [key, value] of Object.entries(formData)) {
    // Skip UI-only helper keys
    if (UI_ONLY_KEYS.has(key)) {
      continue;
    }

    // Check if key is in the whitelist
    if (CLIENT_PROFILE_COLUMNS.has(key)) {
      payload[key] = value;
    } else {
      // Unknown key - collect for error
      unknownKeys.push(key);
    }
  }

  // HARD FAIL on unknown keys - never save bad data
  if (unknownKeys.length > 0) {
    const errorMsg = `[client_profile] BLOCKED: Unknown keys detected: ${unknownKeys.join(', ')}. Payload rejected.`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  return payload;
}
