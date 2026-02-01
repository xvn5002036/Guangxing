import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config({ path: '../.env' }); // Adjust path if needed

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
    console.log('--- Testing Supabase Connection ---');
    console.log('URL:', supabaseUrl);

    // Test digital_products
    console.log('\n1. Checking digital_products table...');
    const { data: prods, error: prodErr } = await supabase.from('digital_products').select('count', { count: 'exact', head: true });
    if (prodErr) console.error('Error:', prodErr.message);
    else console.log('Count:', prods);

    // Test purchases
    console.log('\n2. Checking purchases table...');
    const { data: purch, error: purchErr } = await supabase.from('purchases').select('count', { count: 'exact', head: true });
    if (purchErr) console.error('Error:', purchErr.message);
    else console.log('Count:', purch);

    // Test orders
    console.log('\n3. Checking orders table...');
    const { data: orders, error: orderErr } = await supabase.from('orders').select('count', { count: 'exact', head: true });
    if (orderErr) console.error('Error:', orderErr.message);
    else console.log('Count:', orders);

    // Test join query for my-library
    console.log('\n4. Testing Join Query (my-library)...');
    const { data: join, error: joinErr } = await supabase
        .from('purchases')
        .select('id, created_at, digital_products (*)')
        .limit(1);
    
    if (joinErr) console.error('Join Error:', joinErr.message);
    else console.log('Join Success:', JSON.stringify(join, null, 2));
}

test();
