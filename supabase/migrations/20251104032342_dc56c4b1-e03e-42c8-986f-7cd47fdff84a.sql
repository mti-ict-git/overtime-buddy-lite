-- Allow deleting an employee along with their overtime records
ALTER TABLE public.overtime_records
  DROP CONSTRAINT IF EXISTS overtime_records_employee_id_fkey;

ALTER TABLE public.overtime_records
  ADD CONSTRAINT overtime_records_employee_id_fkey
  FOREIGN KEY (employee_id)
  REFERENCES public.employees(employee_id)
  ON UPDATE CASCADE
  ON DELETE CASCADE;