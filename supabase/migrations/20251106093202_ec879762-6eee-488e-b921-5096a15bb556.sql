-- Drop the restrictive user policy
DROP POLICY IF EXISTS "Users can view their own overtime records" ON public.overtime_records;

-- Create new policy allowing users to view all overtime records
CREATE POLICY "Users can view all overtime records"
ON public.overtime_records
FOR SELECT
USING (
  has_role(auth.uid(), 'user'::app_role) OR has_role(auth.uid(), 'admin'::app_role)
);