-- Step 1: Create user_roles table for secure role management
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Step 2: Migrate existing roles from profiles to user_roles
INSERT INTO public.user_roles (user_id, role)
SELECT user_id, role 
FROM public.profiles 
WHERE role IS NOT NULL
ON CONFLICT (user_id, role) DO NOTHING;

-- Step 3: Update has_role function to use user_roles table (prevents recursive RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Step 4: Create RLS policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Only admins can manage roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 5: Fix employees table RLS - remove unauthenticated insert
DROP POLICY IF EXISTS "Anyone can insert employees" ON public.employees;

CREATE POLICY "Authenticated users can insert employees"
  ON public.employees
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Restrict employee email visibility to admins only
DROP POLICY IF EXISTS "Authenticated users can view employees" ON public.employees;

CREATE POLICY "Admins can view all employees"
  ON public.employees
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 6: Fix overtime_records table RLS - remove unauthenticated insert
DROP POLICY IF EXISTS "Anyone can insert overtime records" ON public.overtime_records;

CREATE POLICY "Authenticated users can insert overtime records"
  ON public.overtime_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

-- Restrict overtime records visibility to admins only
DROP POLICY IF EXISTS "Authenticated users can view overtime records" ON public.overtime_records;

CREATE POLICY "Admins can view all overtime records"
  ON public.overtime_records
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 7: Update admin_settings RLS to use has_role function (fixes recursive RLS)
DROP POLICY IF EXISTS "Only admins can manage settings" ON public.admin_settings;

CREATE POLICY "Only admins can manage settings"
  ON public.admin_settings
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Step 8: Remove ms_graph_client_secret from database (should use Supabase secrets)
ALTER TABLE public.admin_settings DROP COLUMN IF EXISTS ms_graph_client_secret;

-- Step 9: Prevent users from updating their own roles on profiles table
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile name"
  ON public.profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id AND
    -- Prevent role column updates
    (SELECT role FROM public.profiles WHERE user_id = auth.uid()) = role
  );