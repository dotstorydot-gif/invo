const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        if (!supabaseUrl || !supabaseKey) {
            console.error('Missing URL or Key');
            process.exit(1);
        }

        const supabase = createClient(supabaseUrl, supabaseKey);
        const RATE = 50;

        console.log('--- STARTING CONSOLIDATED IMPORT ---');

        // 1. Add Unit
        const { data: unitData, error: unitError } = await supabase
            .from('units')
            .upsert({ name: 'برج 122 المباحث', type: 'Residential', status: 'Available' }, { onConflict: 'name' })
            .select().single();
        if (unitError) throw unitError;
        const unitId = unitData.id;

        // 2. Add Unit Expenses
        const unitExpenses = [
            { unit_id: unitId, category: 'Construction', amount: 220000 * RATE, date: '2025-12-28', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 190000 * RATE, date: '2025-12-30', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 20000 * RATE, date: '2025-12-31', description: 'Expense from image (EGP)', type: 'Variable' },
            { unit_id: unitId, category: 'Construction', amount: 40000 * RATE, date: '2026-02-04', description: 'Expense from image (EGP)', type: 'Variable' }
        ];
        await supabase.from('expenses').insert(unitExpenses);

        // 3. Create Suppliers
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

        // 4. Add Invoices
        const purchases = [
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 5021 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة سباكة (42)' }] },
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 666 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة سباكة (43)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1505 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة كهربا (21)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 650 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة كهربا (22)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1012 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة كهربا (23)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 650 * RATE, created_at: '2025-12-03', items: [{ desc: 'فاتورة كهربا (67)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1300 * RATE, created_at: '2025-05-09', items: [{ desc: 'كهربا (161)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 5729 * RATE, created_at: '2025-05-09', items: [{ desc: 'كهربا (154 و156 و159)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 3017 * RATE, created_at: '2025-05-09', items: [{ desc: 'كهربا (150 و 136)' }] },
            { supplier_id: supplierMap['Plumbing'], unit_id: unitId, type: 'Invoice', total_amount: 1854 * RATE, created_at: '2025-05-09', items: [{ desc: 'سباكة (107 و105 و132)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 3885 * RATE, created_at: '2025-05-09', items: [{ desc: 'كهربا (126 و142)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 1924 * RATE, created_at: '2025-03-07', items: [{ desc: 'كهربا (178 و180 و182)' }] },
            { supplier_id: supplierMap['Electrical'], unit_id: unitId, type: 'Invoice', total_amount: 324 * RATE, created_at: '2025-11-12', items: [{ desc: 'كهربا (271)' }] }
        ];

        await supabase.from('purchases').insert(purchases);

        console.log('Import successful');
        process.exit(0);
    } catch (err) {
        console.error('Import failed:', err.message);
        process.exit(1);
    }
}

run();
