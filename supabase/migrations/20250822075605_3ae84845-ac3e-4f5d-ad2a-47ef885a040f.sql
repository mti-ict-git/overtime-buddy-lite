-- Set widji.santoso@merdekabattery.com as admin
UPDATE public.profiles 
SET role = 'admin'::app_role 
WHERE email = 'widji.santoso@merdekabattery.com';