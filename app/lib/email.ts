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

    // Determine plaque image based on type - using placeholder images for now
    const plaqueImages = {
      wood: 'https://images.unsplash.com/photo-1555982105-d25af4182e4e?w=400&h=400&fit=crop',
      glass: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=400&h=400&fit=crop', 
      acrylic: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=400&fit=crop'
    };
    
    const plaqueImageUrl = plaqueImages[order.plaque_type] || 'https://images.unsplash.com/photo-1552581234-26160f608093?w=400&h=400&fit=crop';
    
    // Extract team name from metadata or league data
    const teamName = order.metadata?.team_name || order.league_data?.teamName || 'Your Team';
    const goldPosition = order.metadata?.gold_position || 'bottom';

    // Create email HTML
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; color: #1f2937; line-height: 1.6; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; }
            .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; }
            .header h1 { margin: 0; font-size: 32px; font-weight: 700; text-shadow: 0 2px 4px rgba(0,0,0,0.1); }
            .header p { margin: 10px 0 0 0; font-size: 18px; opacity: 0.95; }
            .content { padding: 40px 30px; }
            .product-showcase { background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 30px; border-radius: 12px; margin: 20px 0; text-align: center; }
            .product-image { max-width: 300px; height: auto; border-radius: 8px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); margin-bottom: 20px; }
            .order-box { background-color: #f9fafb; padding: 25px; border-radius: 10px; margin: 25px 0; border: 1px solid #e5e7eb; }
            .order-details { margin: 15px 0; }
            .order-detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e5e7eb; }
            .order-detail-row:last-child { border-bottom: none; }
            .order-detail-label { color: #6b7280; }
            .order-detail-value { font-weight: 600; color: #1f2937; }
            .button { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; display: inline-block; margin: 20px 0; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
            .timeline { margin: 30px 0; }
            .timeline-item { display: flex; align-items: start; margin: 20px 0; }
            .timeline-icon { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; width: 40px; height: 40px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 20px; flex-shrink: 0; font-weight: 600; box-shadow: 0 2px 8px rgba(245, 158, 11, 0.3); }
            .timeline-content h4 { margin: 0 0 8px 0; color: #1f2937; font-size: 18px; }
            .timeline-content p { margin: 0; color: #6b7280; font-size: 15px; }
            .help-box { background-color: #fef3c7; padding: 25px; border-radius: 10px; margin-top: 30px; border: 1px solid #fde68a; }
            .footer { text-align: center; color: #6b7280; font-size: 13px; margin-top: 40px; padding: 30px; background-color: #f9fafb; border-top: 1px solid #e5e7eb; }
            .preorder-notice { background-color: #dbeafe; border: 2px solid #60a5fa; padding: 20px; border-radius: 10px; margin: 25px 0; }
            .preorder-notice p { margin: 0; color: #1e40af; font-size: 16px; }
            .badge { display: inline-block; padding: 4px 12px; background-color: #fef3c7; color: #92400e; border-radius: 20px; font-size: 12px; font-weight: 600; margin-left: 10px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏆 Order Confirmed!</h1>
              <p style="margin: 10px 0 0 0; font-size: 18px;">Your championship plaque is on its way!</p>
            </div>
            <div class="content">
              <h2 style="color: #1f2937; font-size: 24px; margin-bottom: 20px;">Hi ${order.customer_name},</h2>
              <p style="font-size: 16px; color: #4b5563;">Thank you for choosing RosterFrame to celebrate your fantasy sports victory! We're honored to create a lasting tribute to your championship season.</p>
              
              <!-- Product Showcase -->
              <div class="product-showcase">
                <h3 style="margin-top: 0; color: #92400e; font-size: 22px;">Your Custom Championship Plaque</h3>
                <img src="${plaqueImageUrl}" alt="${order.plaque_type} plaque" class="product-image" style="max-width: 300px; height: auto; border-radius: 8px; margin: 20px auto; display: block;" />
                <p style="font-size: 18px; color: #92400e; margin: 10px 0;">
                  <strong>"${teamName}"</strong>
                </p>
                <p style="font-size: 14px; color: #b45309; margin: 5px 0;">
                  Gold plaque position: ${goldPosition.charAt(0).toUpperCase() + goldPosition.slice(1)}
                </p>
              </div>

              <div class="order-box">
                <h3 style="margin-top: 0; color: #1f2937; font-size: 20px;">Order Details</h3>
                <div class="order-details">
                  <div class="order-detail-row">
                    <span class="order-detail-label">Order Number</span>
                    <span class="order-detail-value">${order.order_number}</span>
                  </div>
                  <div class="order-detail-row">
                    <span class="order-detail-label">Order Date</span>
                    <span class="order-detail-value">${new Date(order.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <div class="order-detail-row">
                    <span class="order-detail-label">Plaque Type</span>
                    <span class="order-detail-value">${order.plaque_type.charAt(0).toUpperCase() + order.plaque_type.slice(1)} Frame <span class="badge">Premium</span></span>
                  </div>
                  <div class="order-detail-row">
                    <span class="order-detail-label">Team Name</span>
                    <span class="order-detail-value">${teamName}</span>
                  </div>
                  ${order.gift_packaging ? `
                  <div class="order-detail-row">
                    <span class="order-detail-label">Special Options</span>
                    <span class="order-detail-value">🎁 Gift Packaging</span>
                  </div>
                  ` : ''}
                  ${order.discount_amount > 0 ? `
                  <div class="order-detail-row">
                    <span class="order-detail-label">Subtotal</span>
                    <span class="order-detail-value">$${order.subtotal.toFixed(2)}</span>
                  </div>
                  <div class="order-detail-row">
                    <span class="order-detail-label">Discount</span>
                    <span class="order-detail-value" style="color: #059669;">-$${order.discount_amount.toFixed(2)}</span>
                  </div>
                  ` : ''}
                  <div class="order-detail-row" style="border-top: 2px solid #e5e7eb; margin-top: 10px; padding-top: 15px;">
                    <span class="order-detail-label" style="font-size: 18px; font-weight: 600; color: #1f2937;">Total Paid</span>
                    <span class="order-detail-value" style="font-size: 20px; color: #f59e0b;">$${order.total_amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              ${order.metadata?.is_pre_order === 'true' ? `
                <div class="preorder-notice">
                  <p><strong>🚀 Pre-Order Special:</strong> You've secured our launch price with 15% savings! Your custom plaque will be crafted and delivered in March 2025.</p>
                </div>
              ` : ''}

              <h3 style="color: #1f2937; margin-top: 35px; font-size: 22px;">What Happens Next?</h3>
              <div class="timeline">
                <div class="timeline-item">
                  <div class="timeline-icon">✓</div>
                  <div class="timeline-content">
                    <h4>Order Confirmed</h4>
                    <p>Your payment has been processed and your order is in our system.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">🎨</div>
                  <div class="timeline-content">
                    <h4>Design & Production</h4>
                    <p>Our team will carefully craft your plaque with your championship roster.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">✨</div>
                  <div class="timeline-content">
                    <h4>Quality Check</h4>
                    <p>Every plaque is inspected to ensure perfect alignment and finish.</p>
                  </div>
                </div>
                <div class="timeline-item">
                  <div class="timeline-icon">📦</div>
                  <div class="timeline-content">
                    <h4>Shipping & Delivery</h4>
                    <p>Securely packaged and shipped with tracking. ${order.metadata?.is_pre_order === 'true' ? '<strong>Pre-order delivery: March 2025</strong>' : '<strong>Standard delivery: 7-10 business days</strong>'}</p>
                  </div>
                </div>
              </div>

              <center style="margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?payment_intent=${order.stripe_payment_intent_id}" class="button">View Order Details</a>
              </center>

              <div class="help-box">
                <h4 style="margin-top: 0; color: #92400e; font-size: 18px;">Questions About Your Order?</h4>
                <p style="margin-bottom: 15px; color: #78350f;">Our support team is here to help! We typically respond within 24 hours.</p>
                <div style="margin: 10px 0;">
                  <p style="margin: 5px 0;">📧 Reply to this email</p>
                  <p style="margin: 5px 0;">✉️ Email: <a href="mailto:support@rosterframe.com" style="color: #d97706; text-decoration: none; font-weight: 600;">support@rosterframe.com</a></p>
                  <p style="margin: 5px 0;">🌐 Order tracking: <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/track-order" style="color: #d97706; text-decoration: none; font-weight: 600;">Track Your Order</a></p>
                </div>
              </div>
            </div>
            
            <div class="footer">
              <div style="margin-bottom: 20px;">
                <p style="font-size: 16px; color: #374151; margin: 5px 0;">Thank you for trusting RosterFrame with your championship memories!</p>
                <p style="font-size: 14px; color: #6b7280; margin: 5px 0;">Follow us for updates and featured plaques</p>
                <div style="margin: 15px 0;">
                  <a href="https://instagram.com/rosterframe" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Instagram</a>
                  <a href="https://twitter.com/rosterframe" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Twitter</a>
                  <a href="https://facebook.com/rosterframe" style="color: #6b7280; text-decoration: none; margin: 0 10px;">Facebook</a>
                </div>
              </div>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;">
              <p style="font-size: 12px; color: #9ca3af; margin: 5px 0;">© ${new Date().getFullYear()} RosterFrame - Premium Fantasy Sports Memorabilia</p>
              <p style="font-size: 11px; color: #9ca3af; margin: 5px 0;">
                This order confirmation was sent to ${order.customer_email}<br>
                Order #${order.order_number} | <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe" style="color: #9ca3af;">Unsubscribe</a>
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
      subject: `🏆 Your Championship Plaque is Confirmed! - Order ${order.order_number}`,
      html: emailHtml,
      text: `Your Championship Plaque is Confirmed!\n\nHi ${order.customer_name},\n\nThank you for choosing RosterFrame! We've received your order for a custom ${order.plaque_type} championship plaque.\n\nOrder Details:\n- Order Number: ${order.order_number}\n- Team Name: ${teamName}\n- Plaque Type: ${order.plaque_type.charAt(0).toUpperCase() + order.plaque_type.slice(1)} Frame\n- Total: $${order.total_amount.toFixed(2)}\n\nWhat happens next:\n1. Order Confirmed ✓\n2. Design & Production (1-2 days)\n3. Quality Check\n4. Shipping & Delivery (${order.metadata?.is_pre_order === 'true' ? 'March 2025' : '7-10 business days'})\n\nView your order: ${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/order-success?payment_intent=${order.stripe_payment_intent_id}\n\nQuestions? Reply to this email or contact support@rosterframe.com\n\nThank you for trusting us with your championship memories!\n\nThe RosterFrame Team`
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