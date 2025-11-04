-- Change plan_overtime_hour from integer to numeric to support decimal hours
ALTER TABLE public.overtime_records 
ALTER COLUMN plan_overtime_hour TYPE numeric(5,2);

-- Update the RPC function to accept numeric instead of integer
CREATE OR REPLACE FUNCTION public.submit_overtime_entry(
  p_employee_id text,
  p_overtime_date date,
  p_calculation_based_on_time boolean,
  p_plan_overtime_hour numeric,  -- Changed from integer to numeric
  p_date_in date,
  p_from_time time without time zone,
  p_date_out date,
  p_to_time time without time zone,
  p_reason text,
  p_break_from_time time without time zone DEFAULT NULL,
  p_break_to_time time without time zone DEFAULT NULL,
  p_name text DEFAULT NULL,
  p_section text DEFAULT NULL,
  p_email text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Ensure caller has at least 'user' role
  PERFORM public.ensure_user_role();

  -- Ensure employee exists (no-op if already present)
  INSERT INTO public.employees (employee_id, name, section, email)
  VALUES (p_employee_id, COALESCE(p_name, 'Employee ' || p_employee_id), p_section, p_email)
  ON CONFLICT (employee_id) DO NOTHING;

  -- Insert overtime record
  INSERT INTO public.overtime_records (
    employee_id,
    overtime_date,
    calculation_based_on_time,
    plan_overtime_hour,
    date_in,
    from_time,
    date_out,
    to_time,
    break_from_time,
    break_to_time,
    reason
  ) VALUES (
    p_employee_id,
    p_overtime_date,
    p_calculation_based_on_time,
    p_plan_overtime_hour,
    p_date_in,
    p_from_time,
    p_date_out,
    p_to_time,
    p_break_from_time,
    p_break_to_time,
    p_reason
  ) RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;