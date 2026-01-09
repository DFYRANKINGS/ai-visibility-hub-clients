import { supabase } from "@/integrations/supabase/client";
import { buildClientProfilePayload } from './buildClientProfilePayload';

export type SafeUpsertResult = {
  id?: string;
  entity_id?: string;
  error?: { message: string };
};

/**
 * Ensure a business_entities row exists for this user.
 * Returns the entity_id to use for client_profile.
 */
async function ensureBusinessEntity(
  userId: string,
  businessName: string
): Promise<{ entity_id?: string; error?: { message: string } }> {
  // Read env var directly to ensure it's available at insert time
  const agencyUserId = import.meta.env.VITE_AGENCY_USER_ID as string | undefined;
  
  if (!agencyUserId) {
    console.error("[business_entities] VITE_AGENCY_USER_ID is missing or empty");
    return { error: { message: "Missing required configuration: VITE_AGENCY_USER_ID" } };
  }
  
  console.log("[business_entities] using agency_user_id:", agencyUserId);

  // Check for existing entity (fetch agency_user_id so we can backfill before returning)
  const { data: existing, error: fetchError } = await supabase
    .from("business_entities")
    .select("id, agency_user_id")
    .eq("user_id", userId)
    .maybeSingle();

  if (fetchError) {
    console.error("[business_entities] fetch error", fetchError);
    return { error: { message: fetchError.message } };
  }

  // If an entity already exists, ensure agency_user_id is populated BEFORE returning
  if (existing?.id) {
    console.log("[business_entities] found existing entity", existing.id);

    if (existing.agency_user_id == null) {
      const { error: updateError } = await supabase
        .from("business_entities")
        .update({ agency_user_id: import.meta.env.VITE_AGENCY_USER_ID })
        .eq("id", existing.id);

      if (updateError) {
        console.error("[business_entities] backfill agency_user_id failed", updateError);
        return { error: { message: updateError.message } };
      }

      console.log("[business_entities] backfilled agency_user_id on existing entity");
    }

    return { entity_id: existing.id };
  }

  // Create new entity - always include agency_user_id from VITE_AGENCY_USER_ID
  const { data: created, error: insertError } = await supabase
    .from("business_entities")
    .insert({
      user_id: userId,
      agency_user_id: import.meta.env.VITE_AGENCY_USER_ID,
      entity_name: businessName || "Untitled Business",
    })
    .select("id")
    .single();

  if (insertError) {
    console.error("[business_entities] insert error", insertError);
    return { error: { message: insertError.message } };
  }

  console.log("[business_entities] created new entity", created.id);
  return { entity_id: created.id };
}

/**
 * Strict upsert into public.client_profile (external DB).
 *
 * Invariant: client_profile.entity_id must always reference an existing business_entities.id.
 *
 * Flow:
 * 1. Ensure business_entities row exists for owner_user_id
 * 2. Use resulting entity_id for client_profile upsert
 * 3. Filter payload to only allowed columns
 * 4. Do NOT retry with modified payload
 */
export async function safeUpsertClientProfile(
  rawPayload: Record<string, any>
): Promise<SafeUpsertResult> {
  // Validate and filter payload - throws on unknown keys
  let payload: Record<string, any>;
  try {
    payload = buildClientProfilePayload(rawPayload);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Payload validation failed';
    return { error: { message } };
  }

  // Extract required fields
  const ownerUserId = payload.owner_user_id;
  if (!ownerUserId) {
    return { error: { message: "owner_user_id is required" } };
  }

  // Step 1: Ensure business_entities row exists
  const entityResult = await ensureBusinessEntity(
    ownerUserId,
    payload.business_name || ""
  );

  if (entityResult.error) {
    return { error: entityResult.error };
  }

  const entityId = entityResult.entity_id!;

  // Step 2: Set entity_id on payload
  payload.entity_id = entityId;

  console.log("[client_profile] upsert payload keys", Object.keys(payload));
  console.log("[client_profile] using entity_id", entityId);

  const { data, error } = await supabase
    .from("client_profile")
    .upsert(payload as any, { onConflict: "entity_id" })
    .select("id")
    .maybeSingle();

  if (error) {
    console.error("[client_profile] upsert error", error);
    return { error: { message: error.message } };
  }

  return { id: data?.id, entity_id: entityId };
}
