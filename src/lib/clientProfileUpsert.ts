import { supabase } from "@/integrations/supabase/client";

export type SafeUpsertResult = {
  id?: string;
  error?: { message: string };
  droppedColumns: string[];
};

/**
 * Strict upsert into public.client_profile (external DB).
 *
 * Rules:
 * - Do NOT drop columns
 * - Do NOT retry with modified payload
 * - Log payload keys once per call
 * - Log full error response if any
 */
export async function safeUpsertClientProfile(
  payload: Record<string, any>
): Promise<SafeUpsertResult> {
  console.log("[client_profile] upsert payload keys", Object.keys(payload));

  const { data, error } = await supabase
    .from("client_profile")
    .upsert(payload as any, { onConflict: "owner_user_id" })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[client_profile] upsert error", error);
    return { droppedColumns: [], error: { message: error.message } };
  }

  return { id: data?.id, droppedColumns: [] };
}
