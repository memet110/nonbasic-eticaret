import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://ohsoxkqjmevitgjuufkf.supabase.co"
const supabaseKey = "sb_publishable_QguZHFffYmh8YQBREyFOrg_TV7fikoE"
const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  const { data, error } = await supabase
    .from("orders")
    .insert({
      customer_name: "Test",
      customer_email: "test@test.com",
      customer_phone: "123",
      shipping_address: "Adres",
      city: "City",
      district: "Dist",
      total_amount: 100,
      status: "Baskı Bekleyen",
      payment_status: "Ödendi"
    })
    .select()
    .single();
    
  console.log("Order Insert Error:", JSON.stringify(error, null, 2));
  console.log("Order Insert Data:", data);

  if (data) {
    const { error: itemsError } = await supabase
      .from("order_items")
      .insert([
        {
          order_id: data.id,
          product_name: "Test Product",
          product_type: "Test Type",
          size: "L",
          quantity: 1,
          unit_price: 100,
          image_url: "http://example.com/image.jpg"
        }
      ]);
    console.log("Order Items Error:", JSON.stringify(itemsError, null, 2));
  }
}

test();
