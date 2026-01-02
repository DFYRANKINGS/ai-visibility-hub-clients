import { supabase } from "@/integrations/supabase/client";
import { buildClientProfilePayload } from './buildClientProfilePayload';

export type SafeUpsertResult = {
  id?: string;
  error?: { message: string };
};

/**
 * Strict upsert into public.client_profile (external DB).
 *
 * Rules:
 * - Filter payload to only allowed columns before upsert
 * - Do NOT retry with modified payload
 * - Log payload keys once per call
 * - Log full error response if any
 */
export async function safeUpsertClientProfile(
  rawPayload: Record<string, any>
): Promise<SafeUpsertResult> {
  // Filter to allowed columns only
  const payload = buildClientProfilePayload(rawPayload);

  console.log("[client_profile] upsert payload keys", Object.keys(payload));

  const { data, error } = await supabase
    .from("client_profile")
    .upsert(payload as any, { onConflict: "entity_id" })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[client_profile] upsert error", error);
    return { error: { message: error.message } };
  }

  return { id: data?.id };
}
