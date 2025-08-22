-- Create user roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'guest');

-- Create profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  display_name TEXT,
  role app_role NOT NULL DEFAULT 'guest',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create admin settings table
CREATE TABLE public.admin_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  ms_graph_enabled BOOLEAN NOT NULL DEFAULT false,
  ms_graph_tenant_id TEXT,
  ms_graph_client_id TEXT,
  ms_graph_client_secret TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on admin_settings
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Only admins can access admin settings
CREATE POLICY "Only admins can manage settings" 
ON public.admin_settings 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() AND role = 'admin'
  )
);

-- Security definer function to check if user has role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Update overtime_records policies to allow guests to insert
DROP POLICY IF EXISTS "Anyone can insert overtime records" ON public.overtime_records;
DROP POLICY IF EXISTS "Anyone can update overtime records" ON public.overtime_records;
DROP POLICY IF EXISTS "Anyone can delete overtime records" ON public.overtime_records;
DROP POLICY IF EXISTS "Everyone can view overtime records" ON public.overtime_records;

-- New policies for overtime_records
CREATE POLICY "Authenticated users can view overtime records" 
ON public.overtime_records 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Anyone can insert overtime records" 
ON public.overtime_records 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update overtime records" 
ON public.overtime_records 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete overtime records" 
ON public.overtime_records 
FOR DELETE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Update employees policies
DROP POLICY IF EXISTS "Anyone can insert employees" ON public.employees;
DROP POLICY IF EXISTS "Anyone can update employees" ON public.employees;
DROP POLICY IF EXISTS "Everyone can view employees" ON public.employees;

-- New policies for employees
CREATE POLICY "Everyone can view employees" 
ON public.employees 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can insert employees" 
ON public.employees 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only admins can update employees" 
ON public.employees 
FOR UPDATE 
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger for automatic profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name, role)
  VALUES (
    NEW.id, 
    NEW.email, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.email),
    'guest'::app_role
  );
  RETURN NEW;
END;
$$;

-- Trigger to create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add trigger for updating timestamps
CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
BEFORE UPDATE ON public.admin_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();