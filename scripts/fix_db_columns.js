const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');

        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        console.log('--- STARTING DB SCHEMA FIXES ---');
        console.log('Sending queries via Supabase postgres DDL RPC...');

        // This relies on the fact that if they use Supabase, we might not have direct DDL RPC unless we make one.
        // But since we have the service role key, we can create an RPC to execute raw SQL, or we can use the pg module and clean the URL perfectly.

        let dbUrl;
        const dbUrlLine = lines.find(l => l.startsWith('DATABASE_URL='));
        if (dbUrlLine) {
            dbUrl = dbUrlLine.substring('DATABASE_URL='.length).trim();
        }

        if (dbUrl && dbUrl.startsWith('"') && dbUrl.endsWith('"')) {
            dbUrl = dbUrl.substring(1, dbUrl.length - 1);
        }

        const match = dbUrl.match(/postgre(?:s|sql):\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/);
        if (!match) {
            console.error('Could not cleanly parse DATABASE_URL');
            process.exit(1);
        }

        const user = match[1];
        let password = match[2];
        try { password = decodeURIComponent(password); } catch (e) { }
        const host = match[3];
        const port = match[4];
        const database = match[5];

        console.log('Connecting to postgres directly with split config...');
        const { Client } = require('pg');
        const client = new Client({
            host,
            port,
            database,
            user,
            password,
            ssl: { rejectUnauthorized: false }
        });

        await client.connect();

        // 1. expenses table missing columns
        console.log('Checking & updating expenses table...');
        await client.query(`
            ALTER TABLE public.expenses 
            ADD COLUMN IF NOT EXISTS type text DEFAULT 'General',
            ADD COLUMN IF NOT EXISTS branch_id uuid,
            ADD COLUMN IF NOT EXISTS provider text;
        `);
        console.log('[expenses] OK');

        // 2. purchase_requests 
        console.log('Checking & updating purchase_requests table...');
        await client.query(`ALTER TABLE public.purchase_requests ADD COLUMN IF NOT EXISTS branch_id uuid;`);

        // 3. rfqs
        console.log('Checking & updating rfqs table...');
        await client.query(`ALTER TABLE public.rfqs ADD COLUMN IF NOT EXISTS branch_id uuid;`);

        // 4. sales_invoices
        console.log('Checking & updating sales_invoices table...');
        await client.query(`ALTER TABLE public.sales_invoices ADD COLUMN IF NOT EXISTS branch_id uuid;`);

        // 5. debit_notes
        console.log('Checking & updating debit_notes table...');
        await client.query(`ALTER TABLE public.debit_notes ADD COLUMN IF NOT EXISTS branch_id uuid;`);

        // 6. cheques
        console.log('Checking & updating cheques table...');
        await client.query(`ALTER TABLE public.cheques ADD COLUMN IF NOT EXISTS branch_id uuid;`);

        await client.end();

        // Refresh Supabase schema cache using the REST API
        console.log('Refreshing Supabase schema cache...');

        // wait for PostgREST
        await new Promise(r => setTimeout(r, 2000));
        await supabase.from('expenses').select('type').limit(1);

        console.log('--- ALL DONE ---');
        process.exit(0);

    } catch (err) {
        console.error('Migration failed:', err.message);
        process.exit(1);
    }
}
run();
