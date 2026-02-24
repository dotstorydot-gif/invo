import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addUnit() {
    const { data: projects } = await supabase.from('projects').select('id, name').limit(1);
    const projectId = projects && projects.length > 0 ? projects[0].id : null;

    const { data, error } = await supabase
        .from('units')
        .insert([
            {
                name: 'برج 122 المباحث',
                type: 'Residential',
                price: 0,
                status: 'Available',
                project_id: projectId
            }
        ])
        .select();

    if (error) {
        console.error('Error adding unit:', error);
    } else {
        console.log('Unit added successfully:', data);
    }
}

addUnit();
