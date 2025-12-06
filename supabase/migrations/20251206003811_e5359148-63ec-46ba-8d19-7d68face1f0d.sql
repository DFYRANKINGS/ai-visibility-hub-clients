-- Drop the existing restrictive INSERT policy
DROP POLICY IF EXISTS "Users can create client profiles " ON public.client_profile;

-- Create new policy that allows authenticated users to insert profiles
-- The owner_user_id comes from the invite link, not auth.uid()
CREATE POLICY "Authenticated users can create client profiles"
ON public.client_profile
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Note: The existing SELECT, UPDATE, DELETE policies remain unchanged
-- They use auth.uid() = owner_user_id which means only agency owners can view/edit their clients' profiles