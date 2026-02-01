import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse src/config.ts manually
const configTsPath = path.resolve('..', 'src', 'config.ts');
let supabaseUrl = 'https://gmswwklptwtxceomjrbm.supabase.co';
let supabaseKey = '';

try {
    const content = fs.readFileSync(configTsPath, 'utf-8');
    const urlMatch = content.match(/SUPABASE_URL\s*=\s*(['"`])(.*?)\1/);
    if (urlMatch) supabaseUrl = urlMatch[2];
    const keyMatch = content.match(/SUPABASE_SERVICE_ROLE_KEY\s*=\s*(['"`])(.*?)\1/);
    if (keyMatch) supabaseKey = keyMatch[2];
} catch (err) {
    console.error('Failed to read config.ts');
}

if (!supabaseKey) {
    console.error('No service role key found in config.ts');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLibraryQuery() {
    console.log('--- Testing Library Query ---');
    // Using a sample userId if available, or just testing the structure
    const { data, error } = await supabase
        .from('purchases')
        .select(`
            id,
            created_at,
            digital_products!product_id (*)
        `)
        .limit(1);

    if (error) {
        console.error('Query Error:', error.message);
        console.error('Hint:', error.hint);
        console.error('Details:', error.details);
    } else {
        console.log('Query Success!');
        console.log('Result (first item):', JSON.stringify(data?.[0], null, 2));
    }
}

testLibraryQuery();
