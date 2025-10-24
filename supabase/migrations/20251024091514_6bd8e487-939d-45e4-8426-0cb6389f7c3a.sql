-- Drop the existing public SELECT policy
DROP POLICY IF EXISTS "Everyone can view employees" ON public.employees;

-- Create a new policy that requires authentication
CREATE POLICY "Authenticated users can view employees"
ON public.employees
FOR SELECT
TO authenticated
USING (auth.uid() IS NOT NULL);