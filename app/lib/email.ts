import { Resend } from 'resend';
import { supabase } from '@/app/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendOrderConfirmationEmail(orderId: string) {
  try {
    if (!supabase) {
      throw new Error('Database not configured');
    }
    
    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !order) {
      throw new Error('Order not found');
    }

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-radius: 0 0 10px 10px; }
            .order-box { background-color: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #e5e7eb; }
            .order-details { margin: 15px 0; }
            .order-details p { margin: 8px 0; }
            .button { background-color: #f59e0b; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; display: inline-block; margin: 20px 0; font-weight: bold; }
            .timeline { margin: 20px 0; }
            .timeline-item { display: flex; align-items: start; margin: 15px 0; }
            .timeline-icon { background-color: #f59e0b; color: white; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px; flex-shrink: 0; }
            .timeline-content h4 { margin: 0 0 5px 0; }
            .timeline-content p { margin: 0; color: #6b7280; font-size: 14px; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
            .preorder-notice { background-color: #eff6ff; border: 1px solid #3b82f6; padding: 15px; border-radius: 6px; margin: 20px 0; }
            .preorder-notice p { margin: 0; color: #1e40af; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Thank you for your purchase</p>
            </div>
            <div class="content">
              <h2 style="color: #111827;">Hi ${order.customer_name},</h2>
              <p>We're thrilled to confirm that we've received your order for a custom roster frame! Our team is excited to create something special for you.</p>
              
              <div class="order-box">
                <h3 style="margin-top: 0; color: #111827;">Order Summary</h3>
                <div class="order-details">
                  <p><strong>Order Number:</strong> ${order.order_number}</p>
                  <p><strong>Order Date:</strong> ${new Date(order.created_at).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><strong>Plaque Type:</strong> ${order.plaque_type.charAt(0).toUpperCase() + order.plaque_type.slice(1)} Frame</p>
                  ${order.gift_packaging ? '<p><strong>Special Options:</strong> 🎁 Gift Packaging Included</p>' : ''}
                  <hr style="margin: 15px 0; border: none; border-top: 1px solid #e5e7eb;">
                  <p style="font-size: 18px;"><strong>Total Paid:</strong> $${order.total_amount.toFixed(2)}</p>
                </div>
              </div>

              ${order.metadata?.is_pre_order === 'true' ? `
                <div class="preorder-notice">
                  <p><strong>🚀 Pre-Order Special:</strong> You've secured our launch price with 15% savings! Your custom plaque will be crafted and delivered in March 2025.</p>
                </div>
              ` : ''}

              <h3 style="color: #111827; margin-top: 30px;">What Happens Next?</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-icon">✓</div>
                  <div class="timeline-content">
                    <h4>Order Received</h4>
                    <p>Your order has been confirmed and payment processed successfully.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">2</div>
                  <div class="timeline-content">
                    <h4>Design & Production</h4>
                    <p>Our craftsmen will create your custom plaque with attention to every detail.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">3</div>
                  <div class="timeline-content">
                    <h4>Quality Assurance</h4>
                    <p>We'll inspect your plaque to ensure it meets our high standards.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">4</div>
                  <div class="timeline-content">
                    <h4>Shipping & Delivery</h4>
                    <p>Your plaque will be carefully packaged and shipped. ${order.metadata?.is_pre_order === 'true' ? 'Expected delivery: March 2025' : 'Expected delivery: 7-10 business days'}</p>
                  </div>
                </div>
              </div>

              <center style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?payment_intent=${order.stripe_payment_intent_id}" class="button">View Order Details</a>
              </center>

              <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-top: 30px;">
                <h4 style="margin-top: 0; color: #111827;">Need Help?</h4>
                <p style="margin-bottom: 0;">If you have any questions about your order, please don't hesitate to reach out:</p>
                <ul style="margin: 10px 0;">
                  <li>Reply to this email</li>
                  <li>Email us at <a href="mailto:support@rosterframe.com" style="color: #f59e0b;">support@rosterframe.com</a></li>
                </ul>
              </div>

              <div class="footer">
                <p>Thank you for choosing RosterFrame!</p>
                <p>© ${new Date().getFullYear()} RosterFrame. All rights reserved.</p>
                <p style="font-size: 12px; color: #9ca3af;">
                  RosterFrame | Custom Sports Memorabilia<br>
                  This email was sent to ${order.customer_email} regarding order ${order.order_number}
                </p>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email using Resend
    const { data: emailData, error: emailError } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || 'RosterFrame <onboarding@resend.dev>',
      to: order.customer_email,
      subject: `Order Confirmed! - ${order.order_number} 🎉`,
      html: emailHtml,
      text: `Order Confirmed!\n\nHi ${order.customer_name},\n\nThank you for your order! We've received your payment and will begin crafting your custom roster frame.\n\nOrder Number: ${order.order_number}\nTotal: $${order.total_amount.toFixed(2)}\n\nYou can view your order details at: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?payment_intent=${order.stripe_payment_intent_id}\n\nThank you for choosing RosterFrame!\n\nQuestions? Reply to this email or contact support@rosterframe.com`
    });

    if (emailError) {
      throw emailError;
    }

    // Record email sent in database
    await supabase
      .from('order_communications')
      .insert({
        order_id: orderId,
        communication_type: 'order_confirmation',
        subject: `Order Confirmed! - ${order.order_number} 🎉`,
        body: emailHtml,
        sent_at: new Date().toISOString(),
        email_provider_id: emailData?.id,
        status: 'sent'
      });

    return { success: true, emailId: emailData?.id };
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
    
    // Record failed attempt
    if (supabase) {
      await supabase
        .from('order_communications')
        .insert({
          order_id: orderId,
          communication_type: 'order_confirmation',
          subject: 'Order Confirmation - Failed to Send',
          body: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          sent_at: new Date().toISOString(),
          status: 'failed'
        });
    }
    
    throw error;
  }
}

// Export for use in webhook
export { sendOrderConfirmationEmail as sendOrderConfirmation };