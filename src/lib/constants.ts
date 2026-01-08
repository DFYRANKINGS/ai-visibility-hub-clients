// Agency user ID for all client profiles created in the Client Portal.
// The Agency App queries client_profile by agency_user_id = auth.uid() to see all client entities.
// This value must be configured via environment variable - not hardcoded.
const agencyUserId = import.meta.env.VITE_AGENCY_USER_ID;

if (!agencyUserId) {
  throw new Error('VITE_AGENCY_USER_ID environment variable is required');
}

export const AGENCY_USER_ID: string = agencyUserId;
