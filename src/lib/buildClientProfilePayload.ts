import { CLIENT_PROFILE_COLUMNS } from './clientProfileColumns';

export function buildClientProfilePayload(formData: any): Record<string, any> {
  return Object.fromEntries(
    Object.entries(formData).filter(([key]) =>
      CLIENT_PROFILE_COLUMNS.has(key)
    )
  );
}
