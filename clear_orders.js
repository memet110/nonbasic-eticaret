const { createClient } = require('@supabase/supabase-js');

const supabase = createClient('https://ohsoxkqjmevitgjuufkf.supabase.co', 'sb_publishable_QguZHFffYmh8YQBREyFOrg_TV7fikoE');

async function clearOrders() {
  console.log('Fetching orders...');
  const { data: orders, error: fetchError } = await supabase.from('orders').select('id');
  if (fetchError) {
    console.error('Fetch error:', fetchError);
    return;
  }
  console.log('Found', orders.length, 'orders');

  for (const order of orders) {
    const { error: deleteError } = await supabase.from('orders').delete().eq('id', order.id);
    if (deleteError) {
      console.error('Failed to delete order', order.id, deleteError);
    } else {
      console.log('Deleted order', order.id);
    }
  }

  const { data: items } = await supabase.from('order_items').select('id');
  for (const item of items || []) {
    await supabase.from('order_items').delete().eq('id', item.id);
  }
  console.log('Done!');
}

clearOrders();
