# Email Preview Feature Setup Guide

## Overview
The email preview feature allows you to send plaque previews directly to customers via email. It uses Resend for reliable email delivery.

## Setup Steps

### 1. Sign up for Resend
1. Go to https://resend.com
2. Create a free account (100 emails/day free)
3. Get your API key from the dashboard

### 2. Add API Key to Environment
Add your Resend API key to `.env.local`:
```
RESEND_API_KEY=re_YOUR_API_KEY_HERE
```

### 3. Test the Feature
1. Go to the admin preview maker
2. Generate a preview
3. Click the "📧 Email" button
4. Fill in recipient details
5. Send test email

## How It Works

### Email Flow
1. User clicks "Email" button on a generated preview
2. Modal opens to collect recipient info
3. API route sends email via Resend
4. Beautiful HTML email delivered to recipient

### Email Template Features
- Responsive design
- Preview image embedded
- Team and plaque details
- Direct link to full-size preview
- Custom message support

## Testing Without API Key

For testing without a Resend account, you can:
1. Comment out the actual send in `/app/api/email-preview/route.ts`
2. Return a mock success response
3. Check console logs for email data

## Production Setup

### Domain Verification (for custom from address)
1. Add your domain to Resend
2. Verify DNS records
3. Update `RESEND_FROM_EMAIL` in `.env.local`

### Email Best Practices
- Always test with real email addresses
- Check spam folders during testing
- Monitor Resend dashboard for delivery stats
- Keep email content relevant and concise

## Customization

### Modify Email Template
Edit `/app/emails/preview-email.tsx` to customize:
- Colors and styling
- Content structure
- Logo/branding
- Footer information

### Add to Other Pages
To add email functionality elsewhere:
```tsx
import EmailPreviewModal from '@/app/components/EmailPreviewModal';

// Add state
const [showEmailModal, setShowEmailModal] = useState(false);

// Add button
<button onClick={() => setShowEmailModal(true)}>
  📧 Email Preview
</button>

// Add modal
<EmailPreviewModal
  isOpen={showEmailModal}
  onClose={() => setShowEmailModal(false)}
  previewData={{
    imageUrl: previewUrl,
    teamName: teamName,
    plaqueType: plaqueType,
    plaqueStyle: plaqueStyle,
  }}
/>
```

## Troubleshooting

### Email Not Sending
1. Check API key is correct
2. Verify recipient email is valid
3. Check browser console for errors
4. Check Resend dashboard for logs

### Image Not Showing in Email
1. Ensure preview URL is absolute (includes domain)
2. Check image is publicly accessible
3. Test with different email clients

### Rate Limits
- Free tier: 100 emails/day
- Paid plans available for higher volume
- Monitor usage in Resend dashboard