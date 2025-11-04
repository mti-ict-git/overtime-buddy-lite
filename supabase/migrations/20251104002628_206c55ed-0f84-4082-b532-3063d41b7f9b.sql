-- Secure helper to ensure an employee exists without causing conflicts
create or replace function public.ensure_employee_exists(
  p_employee_id text,
  p_name text,
  p_section text default null,
  p_email text default null
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.employees (employee_id, name, section, email)
  values (p_employee_id, p_name, p_section, p_email)
  on conflict (employee_id) do nothing;
end;
$$;

-- Allow authenticated users to call it
grant execute on function public.ensure_employee_exists(text, text, text, text) to authenticated;