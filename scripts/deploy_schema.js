const { Client } = require('pg');
const fs = require('fs');

async function deploySchema() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const databaseUrl = lines.find(l => l.startsWith('DATABASE_URL='))?.replace('DATABASE_URL=', '')?.trim();

        if (!databaseUrl) {
            console.error('Missing DATABASE_URL in .env.local');
            process.exit(1);
        }

        console.log('Connecting to database...');
        const client = new Client({
            connectionString: databaseUrl,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();
        console.log('Connected successfully. Executing schema.sql...');

        const schemaSql = fs.readFileSync('/Users/sameh/.gemini/antigravity/brain/8b3cd83e-5f2c-4d12-9a15-bfcb950b5ee6/schema.sql', 'utf8');

        // Let's add IF NOT EXISTS to all CREATE TABLE statements to avoid errors if some already exist
        let safeSql = schemaSql.replace(/CREATE TABLE /g, 'CREATE TABLE IF NOT EXISTS ');

        // Fix syntax error from original schema file (line 124 has a stray ');')
        safeSql = safeSql.replace(/\);\n\);\n-- 6\./g, ');\n-- 6.');

        // Add policies to allow anonymous/public access, since the app relies on it
        const tables = [
            'projects', 'units', 'suppliers', 'purchases', 'staff',
            'payroll_contracts', 'salary_registers', 'customers',
            'sales_invoices', 'cheques', 'payment_plans', 'installments',
            'stash_transactions', 'expenses', 'inventory'
        ];

        let policiesSql = '';
        for (const table of tables) {
            policiesSql += `
DO $$
BEGIN
    -- Enable RLS
    ALTER TABLE IF EXISTS public.${table} ENABLE ROW LEVEL SECURITY;
    
    -- Try creating policies, ignoring errors if they exist
    BEGIN
        CREATE POLICY "Allow public read" ON public.${table} FOR SELECT USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        CREATE POLICY "Allow public insert" ON public.${table} FOR INSERT WITH CHECK (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        CREATE POLICY "Allow public update" ON public.${table} FOR UPDATE USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
    
    BEGIN
        CREATE POLICY "Allow public delete" ON public.${table} FOR DELETE USING (true);
    EXCEPTION WHEN duplicate_object THEN null; END;
END $$;
`;
        }

        const finalSql = safeSql + '\n\n' + policiesSql;

        await client.query(finalSql);
        console.log('Schema executed successfully.');

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('Failed to deploy schema:', err);
        process.exit(1);
    }
}

deploySchema();
