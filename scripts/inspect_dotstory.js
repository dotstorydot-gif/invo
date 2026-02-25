
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspect() {
    console.log("Inspecting 'dotstory' organization...");

    // 1. Get Organization
    const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .ilike('name', '%dotstory%')
        .single();

    if (orgError) {
        console.error("Org Error:", orgError);
    } else {
        console.log("Organization found:", {
            id: org.id,
            name: org.name,
            module_type: org.module_type,
            subscription_plan: org.subscription_plan
        });

        // 2. Get Customers (Clients)
        const { data: customers, error: custError } = await supabase
            .from('customers')
            .select('*')
            .eq('organization_id', org.id);

        if (custError) {
            console.error("Customers Error:", custError);
        } else {
            console.log(`Found ${customers.length} customers for this org.`);
            customers.forEach(c => {
                console.log(`- ${c.name} (ID: ${c.id}, Email: ${c.email})`);
            });
        }

        // 3. Check RLS policies for customers
        const { data: policies, error: polError } = await supabase
            .rpc('get_policies', { table_name: 'customers' }); // If it exists

        if (polError) {
            console.log("Note: Could not fetch policies via RPC (get_policies not found)");
        }
    }
}

inspect();
