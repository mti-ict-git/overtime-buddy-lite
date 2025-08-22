-- Temporarily allow public access for employees and overtime records
-- until authentication is implemented

-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON public.employees;
DROP POLICY IF EXISTS "Authenticated users can insert overtime records" ON public.overtime_records;
DROP POLICY IF EXISTS "Authenticated users can update overtime records" ON public.overtime_records;
DROP POLICY IF EXISTS "Authenticated users can delete overtime records" ON public.overtime_records;

-- Create more permissive policies for now
CREATE POLICY "Anyone can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update employees" 
ON public.employees 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can insert overtime records" 
ON public.overtime_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update overtime records" 
ON public.overtime_records 
FOR UPDATE 
USING (true);

CREATE POLICY "Anyone can delete overtime records" 
ON public.overtime_records 
FOR DELETE 
USING (true);