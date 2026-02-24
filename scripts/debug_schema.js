const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- LISTING TABLES ---');
        // We can use RPC if defined, or just try to query information_schema if allowed (usually not via PostgREST)
        // Alternative: try to select from likely names
        const tables = ['inventory', 'stock', 'items', 'expenses', 'units', 'staff', 'suppliers', 'purchases'];
        for (const t of tables) {
            const { error } = await supabase.from(t).select('*').limit(1);
            if (error) {
                console.log(`[${t}] Table ERROR: ${error.message}`);
            } else {
                console.log(`[${t}] Table EXISTS`);
                // Try to check column 'category' for expenses
                if (t === 'expenses') {
                    const { data: exp, error: expErr } = await supabase.from('expenses').select('*').limit(1).single();
                    if (expErr) console.log(`[expenses] Column check error: ${expErr.message}`);
                    else console.log(`[expenses] Columns: ${Object.keys(exp).join(', ')}`);
                }
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Debug failed:', err.message);
        process.exit(1);
    }
}

run();
