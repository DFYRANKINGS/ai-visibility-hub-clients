import { CLIENT_PROFILE_COLUMNS } from './clientProfileColumns';

// Flat address fields are NOT in the DB - all address data lives in locations[]
const ADDRESS_KEYS_TO_DROP = new Set([
  'address_street',
  'address_city',
  'address_state',
  'address_postal_code',
]);

export function buildClientProfilePayload(formData: any): Record<string, any> {
  return Object.fromEntries(
    Object.entries(formData).filter(([key]) =>
      CLIENT_PROFILE_COLUMNS.has(key) && !ADDRESS_KEYS_TO_DROP.has(key)
    )
  );
}
