import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { email, teamName, message } = await request.json();

    if (!email || !teamName) {
      return NextResponse.json(
        { error: 'Email and team name are required' },
        { status: 400 }
      );
    }

    // Simple HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f4f4f4; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .footer { background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Roster Frame Preview</h1>
            </div>
            <div class="content">
              <h2>Your ${teamName} Plaque Preview</h2>
              <p>${message || 'Check out this awesome plaque design!'}</p>
              <p>Visit our website to complete your order and bring your fantasy team to life!</p>
              <p><a href="https://rosterframe.com/build-and-buy" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Continue Building</a></p>
            </div>
            <div class="footer">
              <p>&copy; 2025 Roster Frame. All rights reserved.</p>
              <p>Questions? Contact us at jackson@hedgepayments.com</p>
            </div>
          </div>
        </body>
      </html>
    `;

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `Roster Frame <${fromEmail}>`,
      to: email,
      subject: `${teamName} - Roster Frame Preview 🏆`,
      html: htmlContent,
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Email sent successfully!',
      data 
    });

  } catch (error) {
    console.error('Email error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}