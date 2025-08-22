-- Create employees table
CREATE TABLE public.employees (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  section TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create overtime_records table
CREATE TABLE public.overtime_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT NOT NULL REFERENCES public.employees(employee_id),
  overtime_date DATE NOT NULL,
  calculation_based_on_time BOOLEAN NOT NULL DEFAULT false,
  plan_overtime_hour INTEGER NOT NULL,
  date_in DATE NOT NULL,
  from_time TIME NOT NULL,
  date_out DATE NOT NULL,
  to_time TIME NOT NULL,
  break_from_time TIME,
  break_to_time TIME,
  reason TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.overtime_records ENABLE ROW LEVEL SECURITY;

-- Create policies for employees (public read, authenticated users can manage)
CREATE POLICY "Everyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert employees" 
ON public.employees 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update employees" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (true);

-- Create policies for overtime_records (public read, authenticated users can manage)
CREATE POLICY "Everyone can view overtime records" 
ON public.overtime_records 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can insert overtime records" 
ON public.overtime_records 
FOR INSERT 
TO authenticated
WITH CHECK (true);

CREATE POLICY "Authenticated users can update overtime records" 
ON public.overtime_records 
FOR UPDATE 
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can delete overtime records" 
ON public.overtime_records 
FOR DELETE 
TO authenticated
USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_overtime_records_updated_at
  BEFORE UPDATE ON public.overtime_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_employees_employee_id ON public.employees(employee_id);
CREATE INDEX idx_overtime_records_employee_id ON public.overtime_records(employee_id);
CREATE INDEX idx_overtime_records_overtime_date ON public.overtime_records(overtime_date);

-- Insert sample employees from the CSV data
INSERT INTO public.employees (employee_id, name, section) VALUES
('MTI240264', 'Employee 1', 'IT Section'),
('MTI240265', 'Employee 2', 'IT Section'),
('MTI240266', 'Employee 3', 'IT Section'),
('MTI250130', 'Employee 4', 'IT Section');