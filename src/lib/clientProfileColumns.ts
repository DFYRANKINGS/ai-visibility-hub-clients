// clientProfileColumns.ts
// Canonical whitelist of allowed DB columns for client_profile table
// Keep this in sync with the actual Supabase schema
export const CLIENT_PROFILE_COLUMNS = new Set([
  // Identity & ownership
  'entity_id',
  'owner_user_id',
  'agency_user_id',
  'vertical',

  // Core business info
  'business_name',
  'alternate_name',
  'category',
  'business_url',
  'logo_url',
  'short_description',
  'long_description',
  'year_established',
  'team_size',

  // Contact
  'phone',
  'email',

  // JSONB arrays - locations & team
  'locations',
  'team_members',

  // Credentials
  'certifications',
  'accreditations',
  'legal_profile',
  'medical_profile',

  // Offerings by vertical
  'services',
  'practice_areas',
  'medical_specialties',
  'products',

  // Content JSONB arrays
  'reviews',
  'case_studies',
  'media_mentions',
  'awards',
  'faqs',
  'help_articles',
  'articles',

  // Authority / social profiles
  'google_business_url',
  'google_maps_url',
  'yelp_url',
  'bbb_url',
  'apple_maps_url',
  'linkedin_url',
  'facebook_url',
  'instagram_url',
  'youtube_url',
  'twitter_url',
  'tiktok_url',
  'pinterest_url',
  'other_profiles'
]);
