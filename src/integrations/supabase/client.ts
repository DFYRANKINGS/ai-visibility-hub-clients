import { createClient } from '@supabase/supabase-js';

// Connect to the agency Supabase project (shared with agency-assistant-gpt.lovable.app)
// Project ID: iesadgbgprugtlycream
const SUPABASE_URL = "https://iesadgbgprugtlycream.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imllc2FkZ2JncHJ1Z3RseWNyZWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkwNTcxNzUsImV4cCI6MjA2NDYzMzE3NX0.quXlTFhTrBbMVI8dVf-ckNc4dFntlNcI3ny5F8ljpCg";

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  },
});
