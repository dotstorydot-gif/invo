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
        console.log('--- IMPORTING REAL SYSTEM DATA (PROJECT: برج 122 المباحث) ---');

        // 1. Project Setup (Check then insert)
        console.log('Setting up project...');
        let projectId;
        const { data: existingProj } = await supabase.from('projects').select('id').eq('name', 'برج 122 المباحث').limit(1).single();
        if (existingProj) {
            projectId = existingProj.id;
            console.log(`Project exists: ${projectId}`);
        } else {
            const { data: newProj, error: projError } = await supabase
                .from('projects')
                .insert({ name: 'برج 122 المباحث' })
                .select().single();
            if (projError) throw projError;
            projectId = newProj.id;
            console.log(`Created project: ${projectId}`);
        }

        // 2. Unit Setup (Check then insert)
        console.log('Setting up unit...');
        let unitId;
        const { data: existingUnit } = await supabase.from('units').select('id').eq('name', 'برج 122 المباحث').limit(1).single();
        if (existingUnit) {
            unitId = existingUnit.id;
            console.log(`Unit exists: ${unitId}`);
        } else {
            const { data: newUnit, error: unitError } = await supabase
                .from('units')
                .insert({
                    name: 'برج 122 المباحث',
                    project_id: projectId,
                    type: 'Residential',
                    status: 'Available',
                    price: 5000000
                })
                .select().single();
            if (unitError) throw unitError;
            unitId = newUnit.id;
            console.log(`Created unit: ${unitId}`);
        }

        // 3. Staff / People
        const people = [
            { full_name: 'شعبان محارة', role: 'Plasterer', base_salary: 8000 },
            { full_name: 'محمد حداد الواجهة', role: 'Facade Blacksmith', base_salary: 9500 },
            { full_name: 'محمد السباك', role: 'Plumber', base_salary: 8500 },
            { full_name: 'طارق الكهربائي / طارق عمران', role: 'Electrician', base_salary: 8500 },
            { full_name: 'أبو إسلام', role: 'General Supervisor', base_salary: 12000 },
            { full_name: 'رمضان الحداد', role: 'Blacksmith', base_salary: 9000 },
            { full_name: 'وليد', role: 'Laborer', base_salary: 6000 },
            { full_name: 'علاء', role: 'Laborer', base_salary: 6000 },
            { full_name: 'حسام رخام', role: 'Marble Technician', base_salary: 10000 },
            { full_name: 'محمد عبدالعال', role: 'Foreman', base_salary: 9000 },
            { full_name: 'عم ناصر', role: 'General Support', base_salary: 7000 },
            { full_name: 'أحمد البناء', role: 'Builder', base_salary: 8500 },
            { full_name: 'ناصر النجار', role: 'Carpenter', base_salary: 8500 }
        ];

        const { data: currentStaff } = await supabase.from('staff').select('full_name');
        const currentStaffNames = new Set(currentStaff?.map(s => s.full_name) || []);

        for (const p of people) {
            if (currentStaffNames.has(p.full_name)) continue;
            await supabase.from('staff').insert(p);
            console.log(`[STAFF] Added: ${p.full_name}`);
        }

        // 4. Inventory / Materials
        const materials = [
            { name: 'حديد (بكل الأوزان)', code: 'MAT-STEEL', cost_price: 45000, quantity: 10 },
            { name: 'طوب أحمر', code: 'MAT-BRICK', cost_price: 1500, quantity: 5000 },
            { name: 'بضاعة سباكة', code: 'MAT-PLUMB', cost_price: 25000, quantity: 1 },
            { name: 'بضاعة كهرباء', code: 'MAT-ELEC', cost_price: 35000, quantity: 1 },
            { name: 'جرافيت أكريليك', code: 'MAT-GRAF', cost_price: 800, quantity: 20 },
            { name: 'مادة أكريليك / جوتن', code: 'MAT-JOTUN', cost_price: 1200, quantity: 15 },
            { name: 'رمل / تشوين رمل', code: 'MAT-SAND', cost_price: 350, quantity: 50 },
            { name: 'سلك (رباط – سبك – لفف)', code: 'MAT-WIRE', cost_price: 150, quantity: 100 },
            { name: 'خيش', code: 'MAT-HESS', cost_price: 80, quantity: 200 },
            { name: 'لفة فيبر', code: 'MAT-FIBR', cost_price: 450, quantity: 30 }
        ];

        const { data: currentInv } = await supabase.from('inventory').select('name');
        const currentInvNames = new Set(currentInv?.map(i => i.name) || []);

        for (const m of materials) {
            if (currentInvNames.has(m.name)) continue;
            await supabase.from('inventory').insert(m);
            console.log(`[INVENTORY] Added: ${m.name}`);
        }

        // 5. Expenses
        const expenseEntries = [
            { category: 'Utilities', description: 'فاتورة مياه', amount: 450, type: 'Fixed' },
            { category: 'Utilities', description: 'فاتورة كهرباء', amount: 850, type: 'Fixed' },
            { category: 'Utilities', description: 'إنارة', amount: 200, type: 'Fixed' },
            { category: 'Utilities', description: 'كهرباء تشغيل', amount: 3000, type: 'Variable' },
            { category: 'Utilities', description: 'فاتورة قنواتي', amount: 300, type: 'Fixed' },
            { category: 'Utilities', description: 'فاتورة سباكة', amount: 1200, type: 'Variable' },
            { category: 'Utilities', description: 'فواتير بيت الخامة', amount: 5000, type: 'Variable' },
            { category: 'Transport', description: 'ونش (يوميات / ساعات)', amount: 1500, type: 'Variable' },
            { category: 'Transport', description: 'لودر (ساعة / ساعات)', amount: 2500, type: 'Variable' },
            { category: 'Transport', description: 'نقلات ركش', amount: 1200, type: 'Variable' },
            { category: 'Transport', description: 'نقل تروسيكل', amount: 300, type: 'Variable' },
            { category: 'Transport', description: 'تنزيل طوب', amount: 800, type: 'Variable' },
            { category: 'Transport', description: 'تطليع مادة', amount: 600, type: 'Variable' },
            { category: 'Transport', description: 'عرباوي', amount: 400, type: 'Variable' },
            { category: 'Labor', description: 'يومية بنا', amount: 450, type: 'Variable' },
            { category: 'Labor', description: 'يوميات محارة', amount: 400, type: 'Variable' },
            { category: 'Labor', description: 'يوميات ونش', amount: 350, type: 'Variable' },
            { category: 'Labor', description: 'يوميات نظافة', amount: 250, type: 'Variable' },
            { category: 'Labor', description: 'يوميات تحميل', amount: 300, type: 'Variable' },
            { category: 'Labor', description: 'يوميات تشوين', amount: 300, type: 'Variable' },
            { category: 'Contracting', description: 'تقفيل محارة', amount: 8000, type: 'Variable' },
            { category: 'Contracting', description: 'تقفيل حدادة', amount: 9000, type: 'Variable' },
            { category: 'Contracting', description: 'تقفيل كهرباء', amount: 7500, type: 'Variable' },
            { category: 'Contracting', description: 'تجهيز غرفة الكهرباء', amount: 12000, type: 'Asset' },
            { category: 'Contracting', description: 'صواعد المخالف', amount: 1500, type: 'Asset' },
            { category: 'Contracting', description: 'أبواب الواجهة / أبواب العمارة', amount: 25000, type: 'Asset' },
            { category: 'Contracting', description: 'سيراميك الشقق', amount: 45000, type: 'Asset' },
            { category: 'Maintenance', description: 'تصليح ماطور', amount: 1500, type: 'Variable' },
            { category: 'Maintenance', description: 'مرمت غرفة كهرباء', amount: 3000, type: 'Variable' },
            { category: 'Maintenance', description: 'تكسير غرفة كهرباء', amount: 2000, type: 'Variable' },
            { category: 'Security', description: 'شهرية غفير', amount: 3500, type: 'Fixed' },
            { category: 'Security', description: 'إكراميات', amount: 500, type: 'Variable' },
            { category: 'Security', description: 'إشرف', amount: 5000, type: 'Fixed' },
            { category: 'Misc', description: 'نثريات', amount: 200, type: 'Variable' },
            { category: 'Misc', description: 'بسكوت', amount: 150, type: 'Variable' },
            { category: 'Misc', description: 'أدوات صغيرة', amount: 800, type: 'Asset' }
        ];

        for (const e of expenseEntries) {
            const entry = { ...e, date: new Date().toISOString(), unit_id: unitId };
            await supabase.from('expenses').insert(entry);
            console.log(`[EXPENSE] Added: ${e.description}`);
        }

        console.log('--- IMPORT COMPLETED ---');
        process.exit(0);
    } catch (err) {
        console.error('Import failed:', err.message);
        process.exit(1);
    }
}

run();
