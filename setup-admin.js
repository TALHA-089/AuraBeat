const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://hpkklopnsnmuxpgyzgcx.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhwa2tsb3Buc25tdXhwZ3l6Z2N4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODE2MDY0NCwiZXhwIjoyMDkzNzM2NjQ0fQ.JoqdNO_g7d2zVy4gik-V4It9YBqpzfjZtpwngw56qY4'
);

(async () => {
  try {
    console.log('Setting up Admin privileges...\n');

    // Step 1: Check if column exists by trying to select it
    console.log('1. Checking is_admin column...');
    const { data: checkData, error: checkError } = await supabase
      .from('profiles')
      .select('is_admin')
      .limit(1);

    if (checkError && checkError.message.includes('is_admin')) {
      console.log('   Column does not exist. Attempting to add it via RPC...');
      // We can't directly execute ALTER TABLE via REST API with supabase-js
      // Need to use raw SQL via the admin API
      console.log('   ✗ Cannot add column via current method.');
      console.log('\n   MANUAL FIX REQUIRED:');
      console.log('   Go to: https://app.supabase.com');
      console.log('   1. Select your project');
      console.log('   2. Go to SQL Editor');
      console.log('   3. Run this command:');
      console.log('      ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;');
      process.exit(1);
    }

    console.log('   ✓ Column exists\n');

    // Step 2: Update Admin user
    console.log('2. Setting Admin user is_admin = true...');
    const { data: updateData, error: updateError } = await supabase
      .from('profiles')
      .update({ is_admin: true })
      .eq('display_name', 'Admin')
      .select('id, display_name, is_admin');

    if (updateError) {
      console.error('   ✗ Error updating:', updateError.message);
      process.exit(1);
    }

    if (!updateData || updateData.length === 0) {
      console.log('   ✗ No Admin user found with display_name = "Admin"');
      console.log('   Please check the exact name of the admin account.');
      process.exit(1);
    }

    console.log('   ✓ Admin privileges set successfully!');
    console.log('   Updated:', JSON.stringify(updateData[0], null, 2));
    console.log('\n✓ Setup complete! Refresh your browser to see the Admin menu.');
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
})();
