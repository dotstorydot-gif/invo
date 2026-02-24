const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase URL or Key');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    try {
        // 1. Get or Create Unit
        console.log('Adding unit...');
        const { data: unitData, error: unitError } = await supabase
            .from('units')
            .upsert({ name: 'برج 122 المباحث', type: 'Residential', status: 'Available' }, { onConflict: 'name' })
            .select()
            .single();

        if (unitError) throw unitError;
        const unitId = unitData.id;
        console.log('Unit ID:', unitId);

        // 2. Add Expenses
        const expenses = [
            { unit_id: unitId, category: 'Construction', amount: 220000, date: '2025-12-28', description: 'Expense from image (converted to EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 190000, date: '2025-12-30', description: 'Expense from image (converted to EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 20000, date: '2025-12-31', description: 'Expense from image (converted to EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 40000, date: '2026-02-04', description: 'Expense from image (converted to EGP)', type: 'Variable' }
        ];

        console.log('Adding expenses...');
        const { error: expError } = await supabase.from('expenses').insert(expenses);
        if (expError) throw expError;

        console.log('Data added successfully');
    } catch (err) {
        console.error('Error:', err.message);
    }
}

run();
