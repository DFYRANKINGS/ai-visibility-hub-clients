import { createClient } from '@supabase/supabase-js';

// Connect to the agency Supabase project (shared with agency-assistant-gpt.lovable.app)
const SUPABASE_URL = "https://cuqqzmjkrwlnarxbfwjw.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN1cXF6bWprcndsbmFyeGJmd2p3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIxOTY3NDQsImV4cCI6MjA3Nzc3Mjc0NH0.lEykgqf7pK4PrXLRyl3L4aVGoqIt16rnOt2WSNnnOEk";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
