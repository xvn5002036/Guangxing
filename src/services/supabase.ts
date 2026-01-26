import { createClient } from '@supabase/supabase-js';

// FORCE HARDCODED INLINE - DEBUGGING
console.log('Supabase file initializing...');

try {
    // Direct inline strings to guarantee no variable hoisting issues
    var client = createClient(
        'https://gmswwklptwtxceomjrbm.supabase.co',
        'sb_publishable_SbF7J4kDf6jA1-yOzrtX2w_C0WBVg1C'
    );
    console.log('Supabase client created successfully');
} catch (e) {
    console.error('CRITICAL ERROR creating Supabase client:', e);
    alert('Supabase Init Failed: ' + e);
}

export const supabase = client;

export const isSupabaseConfigured = () => true;
