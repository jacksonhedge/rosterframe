import { Resend } from 'resend';
import PreviewEmail from '@/app/emails/preview-email';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

// Debug logging
console.log('Resend API Key exists:', !!process.env.RESEND_API_KEY);
console.log('From email:', process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev');
console.log('API Key prefix:', process.env.RESEND_API_KEY?.substring(0, 10));

export async function POST(request: Request) {
  try {
    const { 
      recipientEmail,
      recipientName,
      teamName,
      previewUrl,
      plaqueType,
      plaqueStyle,
      senderName,
      message
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !teamName || !previewUrl) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use your verified domain or fall back to development email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `RosterFrame <${fromEmail}>`,
      to: recipientEmail,
      subject: `Your ${teamName} Plaque Preview is Ready! 🏆`,
      react: PreviewEmail({
        recipientName,
        teamName,
        previewUrl,
        plaqueType,
        plaqueStyle,
        senderName,
        message
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ 
        error: typeof error === 'object' && error !== null ? 
          (error.message || JSON.stringify(error)) : 
          'Failed to send email' 
      }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      message: 'Email sent successfully!' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}