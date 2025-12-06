-- Drop the conflicting INSERT policy that allows any authenticated user to create profiles
-- This policy bypasses the intended multi-tenant isolation
DROP POLICY IF EXISTS "Authenticated users can create client profiles" ON public.client_profile;