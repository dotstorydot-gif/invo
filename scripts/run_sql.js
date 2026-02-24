const { Client } = require('pg');
const fs = require('fs');

async function run() {
    const connectionString = 'postgresql://postgres:JeDDvucmtFSpt40WJBnTauKrvJ3XumvBH86w3AzhbnNiNuJuMcWjDFHXrxqmK0BI2e4ZiPid9aTR73kNXBxMDA==@db.wfrwimgoxutstrfsdsqb.supabase.co:5432/postgres';
    const client = new Client({ connectionString });

    try {
        await client.connect();
        const sql = fs.readFileSync('scripts/add_branches.sql', 'utf8');
        await client.query(sql);
        console.log('SQL executed successfully');
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
