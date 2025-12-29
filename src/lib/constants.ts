// Default agency user ID for all client profiles created in the Client Visibility App.
// The Agency App queries client_profile by owner_user_id = auth.uid() to see all client entities.
// This hardcoded UUID ensures all profiles are assigned to the agency owner.
export const DEFAULT_AGENCY_USER_ID = 'aa2ff0b5-a1c8-469e-9386-fb01a71a9d1b';
