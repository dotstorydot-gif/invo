const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- INSPECTING EXPENSES ---');
        // We'll insert a dummy record and see what columns are available or just select
        const { data, error } = await supabase.from('expenses').select('*').limit(1);
        if (error) {
            console.log(`Error: ${error.message}`);
        } else if (data && data.length > 0) {
            console.log('Available columns:', Object.keys(data[0]).join(', '));
        } else {
            console.log('Table is empty. Trying to insert a record to trigger schema discovery...');
            const { data: insData, error: insError } = await supabase.from('expenses').insert({ amount: 1 }).select();
            if (insError) console.log('Insert error:', insError.message);
            else {
                console.log('Newly inserted columns:', Object.keys(insData[0]).join(', '));
                // Clean up
                await supabase.from('expenses').delete().match({ id: insData[0].id });
            }
        }

        process.exit(0);
    } catch (err) {
        console.error('Inspect failed:', err.message);
        process.exit(1);
    }
}

run();
