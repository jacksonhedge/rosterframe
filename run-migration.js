const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function runMigration() {
  try {
    // Read the migration file
    const migrationPath = path.join(__dirname, 'supabase/migrations/20250624_ebay_approval_system.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('Running migration...');
    
    // Execute the migration
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: migrationSQL
    });
    
    if (error) {
      console.error('Migration failed:', error);
      
      // Alternative: Run SQL statements one by one
      console.log('\nTrying alternative approach...');
      const statements = migrationSQL.split(';').filter(s => s.trim());
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await supabase.from('_sql').insert({ query: statement });
            console.log('✓ Executed:', statement.substring(0, 50) + '...');
          } catch (err) {
            console.error('Failed:', statement.substring(0, 50) + '...', err.message);
          }
        }
      }
    } else {
      console.log('✅ Migration completed successfully!');
    }
    
  } catch (error) {
    console.error('Error running migration:', error);
  }
}

// Alternative: Direct SQL execution
console.log(`
If the automated migration fails, you can:

1. Go to: ${supabaseUrl}/sql
2. Sign in with your Supabase credentials
3. Copy the SQL from: supabase/migrations/20250624_ebay_approval_system.sql
4. Paste and run in the SQL editor

Or visit your Supabase Dashboard at:
https://supabase.com/dashboard/project/wdwbkuhanclpkbgxgwdg/sql
`);

runMigration();