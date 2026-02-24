const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- INSPECTING STAFF ---');
        const { data, error } = await supabase.from('staff').select('*').limit(1);
        if (error) {
            console.log(`Error: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log('Staff columns:', Object.keys(data[0]).join(', '));
            console.log('Sample record:', JSON.stringify(data[0], null, 2));
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspect failed:', err.message);
        process.exit(1);
    }
}

run();
