-- Create a function to ensure the current authenticated user has the 'user' role
create or replace function public.ensure_user_role()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Grant 'user' role to the current user if not already present
  insert into public.user_roles (user_id, role)
  values (auth.uid(), 'user'::app_role)
  on conflict (user_id, role) do nothing;
end;
$$;

-- Allow authenticated users to execute this function
grant execute on function public.ensure_user_role() to authenticated;