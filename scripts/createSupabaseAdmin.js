const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

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

async function updateAdminProfile() {
  try {
    console.log('Updating admin profile...');
    
    // First, get the user by email
    const { data: { users }, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      throw userError;
    }

    const adminUser = users.find(user => user.email === 'admin@finders.com');
    
    if (!adminUser) {
      throw new Error('Admin user not found. Please create the user first through the Supabase dashboard.');
    }

    console.log('Found admin user:', adminUser.id);

    // Update the profile with admin role
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .upsert([
        {
          id: adminUser.id,
          email: 'admin@finders.com',
          full_name: 'Admin User',
          role: 'admin',
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (profileError) {
      throw profileError;
    }

    console.log('Admin profile updated successfully:');
    console.log('Email:', profileData.email);
    console.log('Name:', profileData.full_name);
    console.log('Role:', profileData.role);

  } catch (error) {
    console.error('Error updating admin profile:', error);
    process.exit(1);
  }
}

updateAdminProfile(); 