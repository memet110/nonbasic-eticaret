require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function testInsert() {
  const { data, error } = await supabase.from('orders').insert({
    customer_name: "Test User",
    customer_email: "test@example.com",
    shipping_address: "Test address",
    city: "Test",
    district: "Test",
    total_amount: 100,
    status: "Test",
    payment_status: "Test"
  }).select();

  console.log("Error:", error);
  console.log("Data:", data);
}

testInsert();
