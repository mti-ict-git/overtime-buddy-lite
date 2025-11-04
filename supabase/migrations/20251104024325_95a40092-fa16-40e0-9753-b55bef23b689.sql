-- Allow authenticated users to grant themselves the basic 'user' role once
CREATE POLICY "Users can grant themselves user role"
ON public.user_roles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND role = 'user'::app_role
);

-- Ensure RPC can be called by authenticated users
GRANT EXECUTE ON FUNCTION public.submit_overtime_entry(
  text,           -- p_employee_id
  date,           -- p_overtime_date
  boolean,        -- p_calculation_based_on_time
  integer,        -- p_plan_overtime_hour
  date,           -- p_date_in
  time without time zone, -- p_from_time
  date,           -- p_date_out
  time without time zone, -- p_to_time
  text,           -- p_reason
  time without time zone, -- p_break_from_time DEFAULT NULL
  time without time zone, -- p_break_to_time DEFAULT NULL
  text,           -- p_name DEFAULT NULL
  text,           -- p_section DEFAULT NULL
  text            -- p_email DEFAULT NULL
) TO authenticated;