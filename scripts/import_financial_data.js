const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(process.cwd(), '.env.local');
const envFile = fs.readFileSync(envPath, 'utf8');
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
    console.error('CRITICAL: Missing Supabase URL or Key in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const RATE = 50; // Conversion rate USD to EGP

async function run() {
    try {
        console.log('--- STARTING CONSOLIDATED IMPORT ---');

        // 1. Add Unit
        console.log('Step 1: Unit "برج 122 المباحث"...');
        const { data: unitData, error: unitError } = await supabase
            .from('units')
            .upsert({ name: 'برج 122 المباحث', type: 'Residential', status: 'Available' }, { onConflict: 'name' })
            .select().single();
        if (unitError) throw unitError;
        const unitId = unitData.id;
        console.log('Unit ID:', unitId);

        // 2. Add Unit Expenses (Image 1)
        console.log('Step 2: Unit Expenses...');
        const unitExpenses = [
            { unit_id: unitId, category: 'Construction', amount: 220000 * RATE, date: '2025-12-28', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 190000 * RATE, date: '2025-12-30', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 20000 * RATE, date: '2025-12-31', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 40000 * RATE, date: '2026-02-04', description: 'Expense from image (EGP)', type: 'Variable' }
        ];
        const { error: expError } = await supabase.from('expenses').insert(unitExpenses);
        if (expError) throw expError;

        // 3. Create Suppliers (Image 2)
        console.log('Step 3: Suppliers...');
        const suppliers = [
            { name: 'Sébaka (سباكة)', category: 'Plumbing' },
            { name: 'Kahraba (كهربا)', category: 'Electrical' }
        ];
        
        const supplierMap = {};
        for (const s of suppliers) {
            const { data, error } = await supabase.from('suppliers').upsert(s, { onConflict: 'name' }).select().single();
            if (error) throw error;
            supplierMap[s.category] = data.id;
        }

        // 4. Add Invoices (Image 2)
        console.log('Step 4: Supplier Invoices...');
        const purchases = [
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 5021 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة سباكة (42)' }] },
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 666 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة سباكة (43)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1505 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة كهربا (21)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 650 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة كهربا (22)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1012 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة كهربا (23)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 650 * RATE, created_at: '2025-03-12', items: [{ desc: 'فاتورة كهربا (67)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1300 * RATE, created_at: '2025-09-05', items: [{ desc: 'كهربا (161)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 5729 * RATE, created_at: '2025-09-05', items: [{ desc: 'كهربا (154 و156 و159)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 3017 * RATE, created_at: '2025-09-05', items: [{ desc: 'كهربا (150 و 136)' }] },
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 1854 * RATE, created_at: '2025-09-05', items: [{ desc: 'سباكة (107 و105 و132)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 3885 * RATE, created_at: '2025-09-05', items: [{ desc: 'كهربا (126 و142)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1924 * RATE, created_at: '2025-03-07', items: [{ desc: 'كهربا (178 و180 و182)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 324 * RATE, created_at: '2025-12-11', items: [{ desc: 'كهربا (271)' }] }
        ];

        const { error: purError } = await supabase.from('purchases').insert(purchases);
        if (purError) throw purError;

        console.log('--- ALL DATA IMPORTED SUCCESSFULLY ---');
        process.exit(0);
    } catch (err) {
        console.error('FAILED:', err.message);
        process.exit(1);
    }
}

run();
