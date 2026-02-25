const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Basic .env.local parser
function loadEnv() {
    const envPath = path.join(process.cwd(), '.env.local');
    if (!fs.existsSync(envPath)) return;
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
}

loadEnv();

async function run() {
    const sqlFile = process.argv[2];
    if (!sqlFile) {
        console.error('Please provide a SQL file path: node scripts/run_sql.js scripts/your_file.sql');
        process.exit(1);
    }

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        console.error('DATABASE_URL not found in .env.local');
        process.exit(1);
    }

    const client = new Client({ connectionString });

    try {
        await client.connect();
        const sql = fs.readFileSync(sqlFile, 'utf8');
        await client.query(sql);
        console.log(`SQL from ${sqlFile} executed successfully`);
    } catch (err) {
        console.error('Error executing SQL:', err);
    } finally {
        await client.end();
    }
}

run();
