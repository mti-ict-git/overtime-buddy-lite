-- Sync existing roles from profiles to user_roles table
INSERT INTO user_roles (user_id, role)
SELECT user_id, role::app_role 
FROM profiles 
WHERE NOT EXISTS (
  SELECT 1 FROM user_roles WHERE user_roles.user_id = profiles.user_id
)
ON CONFLICT (user_id, role) DO NOTHING;