"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(orderId: string, status: string, trackingNumber?: string) {
  const supabase = await createClient();

  const updateData: any = { status };
  
  if (trackingNumber !== undefined) {
    // We haven't added tracking_number to the DB schema explicitly, but let's assume we can or just use status.
    // Let's add it dynamically if the column exists, or we just rely on status for now.
    // Update: we didn't create tracking_number in the Faz 3 schema! 
    // We'll just update the status for now to avoid breaking the DB without a migration.
  }

  const { error, data: orderData } = await supabase
    .from("orders")
    .update(updateData)
    .eq("id", orderId)
    .select('customer_name, customer_email, id')
    .single();

  if (error) {
    throw new Error(error.message);
  }

  // --- EMAIL NOTIFICATION LOGIC ---
  if (status === "Kargolandı" || status === "Teslim Edildi") {
    try {
      const { Resend } = await import('resend');
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const subject = status === "Kargolandı" 
        ? "Siparişiniz Kargoya Verildi! 🚚" 
        : "Siparişiniz Teslim Edildi! 🎉";
        
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Merhaba ${orderData?.customer_name},</h2>
          <p><strong>#${orderData?.id?.split('-')[0]}</strong> numaralı siparişinizin durumu güncellendi.</p>
          <p style="font-size: 18px; color: ${status === 'Kargolandı' ? '#3B82F6' : '#10B981'}; font-weight: bold;">
            Yeni Durum: ${status}
          </p>
          <p>Sipariş detaylarınızı web sitemizdeki "Hesabım" bölümünden takip edebilirsiniz.</p>
          <br/>
          <p>Bizi tercih ettiğiniz için teşekkür ederiz!</p>
          <p><strong>Gravity E-Ticaret</strong></p>
        </div>
      `;

      // Resend test ortamında sadece 'onboarding@resend.dev' adresinden gönderime izin verir.
      // Canlıya alırken kendi domaininizi eklemelisiniz.
      await resend.emails.send({
        from: 'onboarding@resend.dev',
        to: orderData?.customer_email,
        subject: subject,
        html: htmlContent
      });
      console.log(`Email sent to ${orderData?.customer_email} for status ${status}`);
    } catch (emailError) {
      console.error("Email sending failed:", emailError);
      // We don't throw error here to not break the status update
    }
  }

  revalidatePath("/admin");
  revalidatePath("/hesabim");
}
