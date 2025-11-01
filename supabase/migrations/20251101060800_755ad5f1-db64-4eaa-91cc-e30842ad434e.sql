-- Update overtime_records policies to allow 'user' role to insert their own records
DROP POLICY IF EXISTS "Authenticated users can insert overtime records" ON public.overtime_records;

CREATE POLICY "Users and admins can insert overtime records" 
ON public.overtime_records 
FOR INSERT 
WITH CHECK (
  auth.uid() IS NOT NULL AND (
    has_role(auth.uid(), 'admin'::app_role) OR 
    has_role(auth.uid(), 'user'::app_role)
  )
);

-- Allow users to view their own overtime records
CREATE POLICY "Users can view their own overtime records" 
ON public.overtime_records 
FOR SELECT 
USING (
  has_role(auth.uid(), 'user'::app_role) AND 
  employee_id IN (
    SELECT employee_id 
    FROM employees 
    WHERE email = (SELECT email FROM profiles WHERE user_id = auth.uid())
  )
);

-- Allow users to view employee data
DROP POLICY IF EXISTS "Admins can view all employees" ON public.employees;

CREATE POLICY "Admins and users can view employees" 
ON public.employees 
FOR SELECT 
USING (
  has_role(auth.uid(), 'admin'::app_role) OR 
  has_role(auth.uid(), 'user'::app_role)
);