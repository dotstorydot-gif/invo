
const { Client } = require('pg');

const client = new Client({
    connectionString: process.env.DATABASE_URL,
});

async function checkPolicies() {
    await client.connect();
    const res = await client.query("SELECT * FROM pg_policies WHERE tablename = 'customers';");
    console.log("Policies for 'customers':", res.rows);

    const resTable = await client.query("SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'customers';");
    console.log("Table info:", resTable.rows);

    await client.end();
}

checkPolicies().catch(err => console.error(err));
