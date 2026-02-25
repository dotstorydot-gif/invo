const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- ORGANIZATIONS ---');
        const { data: orgs } = await supabase.from('organizations').select('id, name, subdomain');
        console.table(orgs);

        console.log('\n--- ADMIN USERS ---');
        const { data: users } = await supabase.from('users').select('organization_id, username, password_hash, role');
        console.table(users);

        console.log('\n--- STAFF (EMPLOYEES) ---');
        const { data: staff } = await supabase.from('staff').select('organization_id, full_name, email');
        console.table(staff);

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
