import { NextResponse } from "next/server";
import Iyzipay from "iyzipay";
import { createClient } from "@supabase/supabase-js";

// Use service role to bypass RLS for creating orders securely on backend
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY || "sandbox-dummy",
  secretKey: process.env.IYZICO_SECRET_KEY || "sandbox-dummy",
  uri: process.env.IYZICO_BASE_URL || "https://sandbox-api.iyzipay.com"
});

export async function POST(req: Request) {
  try {
    // Iyzico sends token via POST body as form-data
    const formData = await req.formData();
    const token = formData.get("token") as string;

    if (!token) {
      return NextResponse.redirect(new URL('/checkout?error=no_token', req.url));
    }

    // Retrieve payment result using the token
    const result: any = await new Promise((resolve) => {
      iyzipay.checkoutForm.retrieve({
        locale: Iyzipay.LOCALE.TR,
        conversationId: Date.now().toString(),
        token: token
      }, function (err: any, res: any) {
        resolve(res || err);
      });
    });

    if (result.status === "success" && result.paymentStatus === "SUCCESS") {
      // Payment successful!
      const orderId = result.conversationId;
      
      if (orderId) {
        // Update order status in database to 'Ödendi'
        const { data: orderData, error: updateError } = await supabase
          .from('orders')
          .update({ payment_status: 'Ödendi' })
          .eq('id', orderId)
          .select('applied_coupon')
          .single();
          
        if (updateError) {
          console.error("Order status update failed:", updateError);
        } else if (orderData?.applied_coupon) {
          // Increment the coupon usage using RPC or simple logic
          // Since we are using Supabase JS with Service Role, we can fetch and update
          const { data: couponData } = await supabase
            .from('coupons')
            .select('current_usage')
            .eq('code', orderData.applied_coupon)
            .single();
            
          if (couponData) {
            await supabase
              .from('coupons')
              .update({ current_usage: (couponData.current_usage || 0) + 1 })
              .eq('code', orderData.applied_coupon);
          }
        }
        // Fetch order items to decrement stock
        const { data: orderItems } = await supabase
          .from('order_items')
          .select('product_slug, size, quantity')
          .eq('order_id', orderId);

        if (orderItems && orderItems.length > 0) {
          for (const item of orderItems) {
            if (!item.product_slug) continue;
            
            // Get current stock
            const { data: design } = await supabase
              .from('designs')
              .select('stock_inventory')
              .eq('slug', item.product_slug)
              .single();
              
            if (design && design.stock_inventory) {
              const currentStock = design.stock_inventory[item.size] || 0;
              const newStock = Math.max(0, currentStock - item.quantity); // Prevent negative stock
              
              const newInventory = {
                ...design.stock_inventory,
                [item.size]: newStock
              };
              
              await supabase
                .from('designs')
                .update({ stock_inventory: newInventory })
                .eq('slug', item.product_slug);
            }
          }
        }
      }
      
      return NextResponse.redirect(new URL('/siparis-basarili', req.url));
    } else {
      // Payment failed
      console.error("Payment failed:", result.errorMessage);
      return NextResponse.redirect(new URL(`/checkout?error=${encodeURIComponent(result.errorMessage || 'Odeme basarisiz')}`, req.url));
    }

  } catch (error: any) {
    console.error("Iyzico Callback Error:", error);
    return NextResponse.redirect(new URL('/checkout?error=server_error', req.url));
  }
}
