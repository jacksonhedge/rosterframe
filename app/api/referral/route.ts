import { Resend } from 'resend';
import ReferralEmail from '@/app/emails/referral-email';
import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { 
      recipientEmail,
      recipientName,
      senderName,
      senderEmail,
      teamName,
      message,
      referralCode,
      discountAmount,
      previewUrl
    } = await request.json();

    // Validate required fields
    if (!recipientEmail || !recipientName || !senderName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate referral code if not provided
    const finalReferralCode = referralCode || generateReferralCode(senderName);

    // Use your verified domain or fall back to development email
    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

    const { data, error } = await resend.emails.send({
      from: `RosterFrame <${fromEmail}>`,
      to: recipientEmail,
      subject: `${senderName} thinks you'd love RosterFrame! 🏆`,
      react: ReferralEmail({
        recipientName,
        senderName,
        teamName,
        message,
        referralCode: finalReferralCode,
        discountAmount: discountAmount || 10,
        previewUrl,
      }),
    });

    if (error) {
      console.error('Resend error:', error);
      return NextResponse.json({ 
        error: error.message || 'Failed to send email' 
      }, { status: 400 });
    }

    // Track referral in database
    if (supabase) {
      await supabase.from('referrals').insert({
        sender_email: senderEmail,
        sender_name: senderName,
        recipient_email: recipientEmail,
        recipient_name: recipientName,
        referral_code: finalReferralCode,
        discount_amount: discountAmount || 10,
        message: message,
        status: 'sent',
        sent_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ 
      success: true, 
      data,
      referralCode: finalReferralCode,
      message: 'Referral email sent successfully!' 
    });
  } catch (error) {
    console.error('Email sending error:', error);
    return NextResponse.json(
      { error: 'Failed to send referral email' },
      { status: 500 }
    );
  }
}

// Generate a unique referral code
function generateReferralCode(senderName: string): string {
  const namePart = senderName
    .replace(/[^a-zA-Z]/g, '')
    .toUpperCase()
    .slice(0, 4);
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${namePart}${randomPart}`;
}