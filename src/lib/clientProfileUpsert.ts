import { supabase } from "@/integrations/supabase/client";

const BLOCKED_COLUMNS_KEY = "aivp:client_profile:blocked_columns";

const loadBlockedColumns = (): string[] => {
  try {
    const raw = localStorage.getItem(BLOCKED_COLUMNS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((x) => typeof x === "string" && x.length > 0);
  } catch {
    return [];
  }
};

const saveBlockedColumns = (cols: string[]) => {
  try {
    localStorage.setItem(BLOCKED_COLUMNS_KEY, JSON.stringify(cols));
  } catch {
    // ignore
  }
};

const extractMissingColumn = (message?: string | null): string | null => {
  if (!message) return null;

  // PostgREST schema-cache message
  const a = message.match(/Could not find the '([^']+)' column/i);
  if (a?.[1]) return a[1];

  // Postgres error style
  const b = message.match(/column "([^"]+)" (of relation|does not exist)/i);
  if (b?.[1]) return b[1];

  return null;
};

export type SafeUpsertResult = {
  id?: string;
  error?: { message: string };
  droppedColumns: string[];
};

/**
 * Upserts into client_profile, automatically dropping unknown columns reported by the backend
 * ("schema cache" errors) and persisting that knowledge in localStorage.
 */
export async function safeUpsertClientProfile(
  payload: Record<string, any>
): Promise<SafeUpsertResult> {
  const droppedColumns: string[] = [];

  // Never send columns that we know don't exist in the canonical table.
  // (If you add new columns in the backend later, remove them from here.)
  const sanitizedBase: Record<string, any> = { ...payload };

  // Force-drop known non-canonical / legacy columns
  delete sanitizedBase.agency_user_id;
  delete sanitizedBase.entity_name;
  delete sanitizedBase.founding_year;
  delete sanitizedBase.same_as;

  let blocked = loadBlockedColumns();
  let working: Record<string, any> = { ...sanitizedBase };

  // Apply persisted blocklist
  for (const col of blocked) {
    if (col in working) delete working[col];
  }

  let lastError: any = null;

  for (let attempt = 0; attempt < 6; attempt++) {
    const { data, error } = await supabase
      .from("client_profile")
      .upsert(working)
      .select("id")
      .maybeSingle();

    if (!error) {
      return { id: data?.id, droppedColumns };
    }

    lastError = error;

    const missing = extractMissingColumn(error.message);
    if (!missing) break;

    if (!(missing in working)) {
      // If it isn't in our payload, retrying won't help.
      break;
    }

    // Drop this column and retry
    delete working[missing];
    if (!blocked.includes(missing)) {
      blocked = [...blocked, missing];
      saveBlockedColumns(blocked);
    }
    droppedColumns.push(missing);
  }

  return {
    droppedColumns,
    error: { message: lastError?.message || "Failed to save profile" },
  };
}
