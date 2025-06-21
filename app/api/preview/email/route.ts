import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises';
import path from 'path';

interface EmailPreviewRequest {
  previewId: string;
  customerEmail: string;
  teamName: string;
  customerName?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { previewId, customerEmail, teamName, customerName }: EmailPreviewRequest = await request.json();

    // Validate input
    if (!previewId || !customerEmail || !teamName) {
      return NextResponse.json(
        { error: 'Missing required fields: previewId, customerEmail, teamName' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerEmail)) {
      return NextResponse.json(
        { error: 'Invalid email address format' },
        { status: 400 }
      );
    }

    // Check if preview exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'previews');
    const metadataPath = path.join(uploadsDir, `${previewId}.json`);
    const imagePath = path.join(uploadsDir, `${previewId}.png`);

    try {
      await fs.access(metadataPath);
      await fs.access(imagePath);
    } catch (error) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Read preview metadata
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const previewData = JSON.parse(metadataContent);

    // Send email
    const emailSent = await sendPreviewEmail(
      customerEmail,
      teamName,
      customerName || 'Customer',
      previewData,
      imagePath
    );

    if (!emailSent) {
      return NextResponse.json(
        { error: 'Failed to send email' },
        { status: 500 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Preview sent successfully',
      sentTo: customerEmail
    });

  } catch (error) {
    console.error('Error sending preview email:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function sendPreviewEmail(
  customerEmail: string,
  teamName: string,
  customerName: string,
  previewData: any,
  imagePath: string
): Promise<boolean> {
  try {
    // Create nodemailer transporter
    // In production, use your actual email service credentials
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    // Read the image file
    const imageBuffer = await fs.readFile(imagePath);

    // Calculate total cost
    const totalCardCost = previewData.configuration.playerCards.reduce(
      (sum: number, card: any) => sum + card.price + (card.shipping || 0),
      0
    );

    // HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Your Custom Plaque Preview</title>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .preview-image { width: 100%; max-width: 500px; height: auto; border: 3px solid #e5e7eb; border-radius: 10px; margin: 20px 0; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #fbbf24; }
            .player-list { list-style: none; padding: 0; }
            .player-item { background: white; margin: 10px 0; padding: 15px; border-radius: 6px; border: 1px solid #e5e7eb; }
            .cta-button { display: inline-block; background: linear-gradient(135deg, #fbbf24, #f59e0b); color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🏆 Your Custom Plaque Preview</h1>
            <h2>${teamName}</h2>
            <p>Here's how your personalized plaque will look!</p>
          </div>
          
          <div class="content">
            <p>Hi ${customerName},</p>
            
            <p>Thank you for designing your custom plaque with Roster Frame! We're excited to show you exactly how your <strong>${teamName}</strong> plaque will look when completed.</p>
            
            <div style="text-align: center;">
              <img src="cid:preview" alt="Your Custom Plaque Preview" class="preview-image" />
            </div>
            
            <div class="details">
              <h3>📋 Plaque Details</h3>
              <ul>
                <li><strong>Team Name:</strong> ${teamName}</li>
                <li><strong>Plaque Type:</strong> ${previewData.configuration.plaqueType}-spot plaque</li>
                <li><strong>Style:</strong> ${previewData.configuration.plaqueStyle}</li>
                <li><strong>Players:</strong> ${previewData.configuration.playerCards.length} selected</li>
                <li><strong>Total Card Value:</strong> $${totalCardCost.toFixed(2)}</li>
              </ul>
            </div>
            
            <div class="details">
              <h3>⭐ Your Selected Players</h3>
              <ul class="player-list">
                ${previewData.configuration.playerCards.map((card: any) => `
                  <li class="player-item">
                    <strong>${card.playerName}</strong> (${card.position})<br>
                    ${card.year} ${card.brand} ${card.series} - $${(card.price + (card.shipping || 0)).toFixed(2)}
                  </li>
                `).join('')}
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://rosterframe.com'}/build-and-buy" class="cta-button">
                Complete Your Order
              </a>
            </div>
            
            <p>Your plaque will be professionally crafted and each card will be securely mounted. This preview shows the exact layout and positioning of your cards.</p>
            
            <p><strong>Questions?</strong> Reply to this email or contact our support team. We're here to help make your plaque perfect!</p>
            
            <p>Best regards,<br>The Roster Frame Team</p>
          </div>
          
          <div class="footer">
            <p>Roster Frame - Turn Your Fantasy Team Into Reality</p>
            <p>© ${new Date().getFullYear()} Roster Frame. All rights reserved.</p>
          </div>
        </body>
      </html>
    `;

    // Send email
    const mailOptions = {
      from: `"Roster Frame" <${process.env.SMTP_FROM || process.env.SMTP_USER}>`,
      to: customerEmail,
      subject: `🏆 Your ${teamName} Plaque Preview is Ready!`,
      html: htmlContent,
      attachments: [
        {
          filename: `${teamName.replace(/[^a-zA-Z0-9]/g, '_')}_plaque_preview.png`,
          content: imageBuffer,
          cid: 'preview'
        }
      ]
    };

    await transporter.sendMail(mailOptions);
    return true;

  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
} 