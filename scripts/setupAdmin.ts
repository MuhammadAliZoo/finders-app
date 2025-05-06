import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function setupAdmin() {
  try {
    console.log('Setting up admin user...');
    
    // Create admin user if it doesn't exist
    const { data: { user }, error: createError } = await supabase.auth.admin.createUser({
      email: 'admin@finders.com',
      password: 'admin123',
      email_confirm: true,
    });

    if (createError) {
      throw createError;
    }

    if (!user) {
      throw new Error('Failed to create admin user');
    }

    console.log('Admin user created or already exists:', user.id);

    // Update the profile with admin role
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        email: 'admin@finders.com',
        full_name: 'Admin User',
        role: 'admin',
        updated_at: new Date().toISOString(),
      });

    if (profileError) {
      throw profileError;
    }

    console.log('Admin profile setup complete!');
    console.log('Email: admin@finders.com');
    console.log('Password: admin123');
    console.log('Please change these credentials after first login.');

  } catch (error) {
    console.error('Error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin(); 