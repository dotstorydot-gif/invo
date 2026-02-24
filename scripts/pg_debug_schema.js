const { Client } = require('pg');

async function run() {
    const client = new Client({
        connectionString: "postgresql://postgres:JeDDvucmtFSpt40WJBnTauKrvJ3XumvBH86w3AzhbnNiNuJuMcWjDFHXrxqmK0BI2e4ZiPid9aTR73kNXBxMDA==@db.wfrwimgoxutstrfsdsqb.supabase.co:5432/postgres"
    });

    try {
        await client.connect();

        console.log('--- TABLES ---');
        const resTables = await client.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
        console.log(resTables.rows.map(r => r.table_name).join(', '));

        console.log('\n--- COLUMNS ---');
        for (const table of resTables.rows.map(r => r.table_name)) {
            const resCols = await client.query(`SELECT column_name FROM information_schema.columns WHERE table_name = '${table}' AND table_schema = 'public'`);
            console.log(`[${table}]: ${resCols.rows.map(r => r.column_name).join(', ')}`);
        }

        await client.end();
    } catch (err) {
        console.error('PG Query failed:', err.message);
        process.exit(1);
    }
}

run();
