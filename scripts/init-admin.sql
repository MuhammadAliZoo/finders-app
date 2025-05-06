-- Drop existing type if it exists
DROP TYPE IF EXISTS user_role CASCADE;

-- Create an enum type for user roles
CREATE TYPE user_role AS ENUM ('user', 'admin');

-- Add missing columns to profiles table if they don't exist
DO $$ 
BEGIN 
    -- Add role column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'role') THEN
        ALTER TABLE profiles ADD COLUMN role user_role DEFAULT 'user';
    END IF;

    -- Add updated_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'updated_at') THEN
        ALTER TABLE profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
    END IF;

    -- Add created_at column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'profiles' AND column_name = 'created_at') THEN
        ALTER TABLE profiles ADD COLUMN created_at TIMESTAMPTZ DEFAULT now();
    END IF;
END $$;

-- Update existing admin profile
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Get the existing admin user ID
    SELECT id INTO admin_user_id
    FROM auth.users
    WHERE email = 'admin@finders.com';

    IF admin_user_id IS NOT NULL THEN
        -- Update or create admin profile
        INSERT INTO public.profiles (
            id,
            email,
            role,
            updated_at,
            created_at
        )
        VALUES (
            admin_user_id,
            'admin@finders.com',
            'admin',
            now(),
            now()
        )
        ON CONFLICT (id) DO UPDATE
        SET 
            role = 'admin',
            updated_at = now();
            
        RAISE NOTICE 'Admin profile updated successfully';
    ELSE
        RAISE EXCEPTION 'Admin user not found in auth.users';
    END IF;
END $$;

-- Add RLS policies if they don't exist
DO $$
BEGIN
    -- Enable RLS on profiles table
    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    -- Create policies if they don't exist
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Public profiles are viewable by everyone') THEN
        CREATE POLICY "Public profiles are viewable by everyone"
        ON profiles FOR SELECT
        USING (true);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile') THEN
        CREATE POLICY "Users can update own profile"
        ON profiles FOR UPDATE
        USING (auth.uid() = id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Only admins can update roles') THEN
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
    END IF;
END $$; 