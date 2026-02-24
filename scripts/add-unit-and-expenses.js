const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Simple manual env parsing
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
    const [key, ...value] = line.split('=');
    if (key && value.length > 0) {
        env[key.trim()] = value.join('=').trim();
    }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        console.log('Adding/Updating unit...');
        // Upsert unit
        const { data: unitData, error: unitError } = await supabase
            .from('units')
            .upsert({ name: 'برج 122 المباحث', type: 'Residential', status: 'Available' }, { onConflict: 'name' })
            .select()
            .single();

        if (unitError) throw unitError;
        const unitId = unitData.id;
        console.log('Unit ID:', unitId);

        // Add Expenses
        const expenses = [
            { unit_id: unitId, category: 'Construction', amount: 220000, date: '2025-12-28', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 190000, date: '2025-12-30', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 20000, date: '2025-12-31', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 40000, date: '2026-02-04', description: 'Expense from image (EGP)', type: 'Variable' }
        ];

        console.log('Adding expenses...');
        const { error: expError } = await supabase.from('expenses').insert(expenses);
        if (expError) throw expError;

        console.log('Successfully completed data insertion');
    } catch (err) {
        console.error('Operation failed:', err.message);
        process.exit(1);
    }
}

run();
