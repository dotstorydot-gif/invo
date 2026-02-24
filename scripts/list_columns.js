const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        const tables = ['expenses', 'units', 'staff', 'suppliers', 'purchases'];
        for (const t of tables) {
            console.log(`--- [${t}] COLUMNS ---`);
            const { data, error } = await supabase.from(t).select('*').limit(1);
            if (error) {
                console.log(`Error: ${error.message}`);
            } else if (data && data.length > 0) {
                console.log(Object.keys(data[0]).join(', '));
            } else {
                console.log('No data to infer columns.');
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err.message);
        process.exit(1);
    }
}

run();
