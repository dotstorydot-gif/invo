const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function run() {
    try {
        const envFile = fs.readFileSync('.env.local', 'utf8');
        const lines = envFile.split('\n');
        const supabaseUrl = lines.find(l => l.startsWith('NEXT_PUBLIC_SUPABASE_URL='))?.split('=')[1]?.trim();
        const supabaseKey = lines.find(l => l.startsWith('SUPABASE_SERVICE_ROLE_KEY='))?.split('=')[1]?.trim();

        const supabase = createClient(supabaseUrl, supabaseKey);

        const orgId = 'edf906f8-2792-4da1-9765-b625264b1de8'; // DotStory

        console.log('--- TESTING PROJECT UPSERT ---');
        const { data, error } = await supabase
            .from('projects')
            .upsert({
                name: 'Diagnostic Project',
                location: 'Diagnostic Lab',
                description: 'Testing persistence',
                organization_id: orgId
            })
            .select();

        if (error) {
            console.error('Upsert Error:', error);
        } else {
            console.log('Upsert Success:', data);
        }

        console.log('\n--- VERIFYING FETCH ---');
        const { data: fetchResult, error: fetchError } = await supabase
            .from('projects')
            .select('*')
            .eq('organization_id', orgId);

        if (fetchError) {
            console.error('Fetch Error:', fetchError);
        } else {
            console.log('Fetch Success, count:', fetchResult.length);
            console.table(fetchResult);
        }

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}
run();
