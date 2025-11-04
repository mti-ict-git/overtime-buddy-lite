-- Create helper to submit overtime and ensure employee exists atomically
create or replace function public.submit_overtime_entry(
  p_employee_id text,
  p_overtime_date date,
  p_calculation_based_on_time boolean,
  p_plan_overtime_hour integer,
  p_date_in date,
  p_from_time time,
  p_date_out date,
  p_to_time time,
  p_reason text,
  p_break_from_time time default null,
  p_break_to_time time default null,
  p_name text default null,
  p_section text default null,
  p_email text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id uuid;
begin
  -- Ensure caller has at least 'user' role
  perform public.ensure_user_role();

  -- Ensure employee exists (no-op if already present)
  insert into public.employees (employee_id, name, section, email)
  values (p_employee_id, coalesce(p_name, 'Employee ' || p_employee_id), p_section, p_email)
  on conflict (employee_id) do nothing;

  -- Insert overtime record
  insert into public.overtime_records (
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
  ) values (
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
  ) returning id into v_id;

  return v_id;
end;
$$;

-- Allow authenticated users to call the function
grant execute on function public.submit_overtime_entry(
  text, date, boolean, integer, date, time, date, time, text, time, time, text, text, text
) to authenticated;