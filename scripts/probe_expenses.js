const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        const columnsToTest = ['id', 'category', 'amount', 'date', 'description', 'type', 'unit_id', 'created_at'];
        console.log('--- TESTING EXPENSES COLUMNS ---');
        for (const col of columnsToTest) {
            const { error } = await supabase.from('expenses').select(col).limit(1);
            if (error) {
                console.log(`[${col}] FAIL: ${error.message}`);
            } else {
                console.log(`[${col}] OK`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Probe failed:', err.message);
        process.exit(1);
    }
}

run();
