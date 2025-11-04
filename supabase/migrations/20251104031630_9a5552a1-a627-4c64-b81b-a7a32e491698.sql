-- Add DELETE policy for admins on employees table
CREATE POLICY "Admins can delete employees"
ON public.employees
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));