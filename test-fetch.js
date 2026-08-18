require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testFetch() {
  const { data, error } = await supabase.from('orders').select('*');
  console.log("Error:", error);
  console.log("Orders:", data);
}

testFetch();
