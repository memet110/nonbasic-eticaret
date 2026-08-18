require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function test() {
  const query = 'Okyanus';
  const { data, error } = await supabase
    .from('designs')
    .select('*')
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    
  console.log("Error:", error);
  console.log("Data length:", data?.length);
  console.log("Data:", data);
}

test();
