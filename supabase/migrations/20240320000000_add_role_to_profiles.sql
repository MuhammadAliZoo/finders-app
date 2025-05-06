-- Create an enum type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add role column to profiles table if it doesn't exist
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Create an admin user if it doesn't exist
INSERT INTO auth.users (email, encrypted_password, email_confirmed_at)
SELECT 'admin@finders.com', crypt('admin123', gen_salt('bf')), now()
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@finders.com'
);

-- Set the admin role for the admin user
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
    id,
    'admin@finders.com',
    'Admin User',
    'admin'
FROM auth.users 
WHERE email = 'admin@finders.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin';

-- Add RLS policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
ON profiles FOR SELECT
USING (true);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Only admins can update roles"
ON profiles FOR UPDATE
USING (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
)
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM profiles WHERE role = 'admin'
    )
); 