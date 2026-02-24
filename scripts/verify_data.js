const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing URL or Key in .env.local');
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        console.log('--- VERIFYING DATA PUMP ---');

        const tables = [
            'projects', 'units', 'staff', 'inventory', 'expenses',
            'customers', 'sales_invoices', 'stash_transactions'
        ];

        for (const table of tables) {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (error) {
                console.log(`[${table}] ERROR: ${error.message}`);
            } else {
                console.log(`[${table}] OK - ${count} rows`);
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Check failed:', err.message);
        process.exit(1);
    }
}

run();
