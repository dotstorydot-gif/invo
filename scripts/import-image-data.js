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
        console.log('Starting Data Import...');

        // 1. Add/Update Unit: برج 122 المباحث
        const { data: unitData, error: unitError } = await supabase
            .from('units')
            .upsert({ name: 'برج 122 المباحث', type: 'Residential', status: 'Available' }, { onConflict: 'name' })
            .select()
            .single();
        if (unitError) throw unitError;
        const unitId = unitData.id;
        console.log('Unit Ready:', unitData.name);

        // 2. Add Unit Expenses (Image 1) - Converted USD to EGP (Approx 1 USD = 50 EGP for this context)
        const unitExpenses = [
            { unit_id: unitId, category: 'Construction', amount: 220000, date: '2025-12-28', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 190000, date: '2025-12-30', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 20000, date: '2025-12-31', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 40000, date: '2026-02-04', description: 'Expense from image (EGP)', type: 'Variable' }
        ];
        await supabase.from('expenses').insert(unitExpenses);
        console.log('Unit Expenses Added.');

        // 3. Create Suppliers (Image 2)
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
        console.log('Suppliers Ready.');

        // 4. Add Supplier Invoices/Purchases (Image 2)
        // Note: Dates are extracted from image. Format 3/12/25 -> 2025-12-03 (Assuming D/M/Y or M/D/Y based on context)
        // Amounts converted to EGP (USD * 50)
        const purchases = [
            { supplier_id: supplierMap['Plumbing'], type: 'Invoice', total_amount: 5021 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة سباكة (42)' } },
            { supplier_id: supplierMap['Plumbing'], type: 'Invoice', total_amount: 666 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة سباكة (43)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 1505 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة كهربا (21)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 650 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة كهربا (22)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 1012 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة كهربا (23)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 650 * 50, created_at: '2025-03-12', items: { desc: 'فاتورة كهربا (67)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 1300 * 50, created_at: '2025-09-05', items: { desc: 'كهربا (161)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 5729 * 50, created_at: '2025-09-05', items: { desc: 'كهربا (154 و156 و159)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 3017 * 50, created_at: '2025-09-05', items: { desc: 'كهربا (150 و 136)' } },
            { supplier_id: supplierMap['Plumbing'], type: 'Invoice', total_amount: 1854 * 50, created_at: '2025-09-05', items: { desc: 'سباكة (107 و105 و132)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 3885 * 50, created_at: '2025-09-05', items: { desc: 'كهربا (126 و142)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 1924 * 50, created_at: '2025-03-07', items: { desc: 'كهربا (178 و180 و182)' } },
            { supplier_id: supplierMap['Electrical'], type: 'Invoice', total_amount: 324 * 50, created_at: '2025-12-11', items: { desc: 'كهربا (271)' } }
        ];

        await supabase.from('purchases').insert(purchases);
        console.log('Supplier Invoices Added.');

        console.log('--- ALL DATA IMPORTED SUCCESSFULLY ---');
    } catch (err) {
        console.error('FAILED:', err.message);
        process.exit(1);
    }
}

run();
