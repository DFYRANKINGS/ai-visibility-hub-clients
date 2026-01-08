// Agency user ID for all client profiles created in the Client Portal.
// The Agency App queries client_profile by agency_user_id = auth.uid() to see all client entities.
// This value must be configured via environment variable (client-side: VITE_AGENCY_USER_ID).
//
// IMPORTANT: Do not throw at module-import time (it would white-screen the app).
// Instead, callers should gate UI/actions when this is missing.
export const AGENCY_USER_ID = import.meta.env.VITE_AGENCY_USER_ID as string | undefined;

export function requireAgencyUserId(): string {
  if (!AGENCY_USER_ID) {
    throw new Error('VITE_AGENCY_USER_ID environment variable is required');
  }
  return AGENCY_USER_ID;
}

