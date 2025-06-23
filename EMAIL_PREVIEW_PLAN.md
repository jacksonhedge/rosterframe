# Email Preview Feature Plan

## Overview
Add functionality to email plaque previews to customers or team members.

## Recommended Approach: Resend

### Why Resend?
1. Built specifically for modern web apps
2. React Email templates for beautiful emails
3. Easy Next.js integration
4. Good free tier (100 emails/day)
5. Great developer experience

## Implementation Steps

### 1. Install Dependencies
```bash
npm install resend @react-email/components
```

### 2. Create Email Template
```tsx
// app/emails/preview-email.tsx
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface PreviewEmailProps {
  recipientName: string;
  teamName: string;
  previewUrl: string;
  plaqueType: string;
  plaqueStyle: string;
  senderName?: string;
  message?: string;
}

export default function PreviewEmail({
  recipientName,
  teamName,
  previewUrl,
  plaqueType,
  plaqueStyle,
  senderName = 'RosterFrame Team',
  message
}: PreviewEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Your {teamName} plaque preview is ready!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>Your Plaque Preview</Heading>
          
          <Text style={text}>Hi {recipientName},</Text>
          
          {message && (
            <Text style={text}>{message}</Text>
          )}
          
          <Section style={imageSection}>
            <Img
              src={previewUrl}
              width="600"
              alt={`${teamName} Plaque Preview`}
              style={image}
            />
          </Section>
          
          <Text style={text}>
            <strong>Team:</strong> {teamName}<br />
            <strong>Configuration:</strong> {plaqueType} cards - {plaqueStyle}
          </Text>
          
          <Button style={button} href={previewUrl}>
            View Full Size Preview
          </Button>
          
          <Text style={footer}>
            Sent by {senderName} via RosterFrame
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 10px',
};

const imageSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const image = {
  border: '1px solid #e6e6e6',
  borderRadius: '8px',
  maxWidth: '100%',
};

const button = {
  backgroundColor: '#5469d4',
  borderRadius: '4px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  marginTop: '20px',
};

const footer = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '24px',
  marginTop: '40px',
  textAlign: 'center' as const,
};
```

### 3. Create API Route
```tsx
// app/api/email-preview/route.ts
import { Resend } from 'resend';
import PreviewEmail from '@/app/emails/preview-email';

const resend = new Resend(process.env.RESEND_API_KEY);

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

    const { data, error } = await resend.emails.send({
      from: 'RosterFrame <noreply@rosterframe.com>',
      to: recipientEmail,
      subject: `Your ${teamName} Plaque Preview`,
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
      return Response.json({ error }, { status: 400 });
    }

    return Response.json({ data });
  } catch (error) {
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
}
```

### 4. Add Email Modal Component
```tsx
// app/components/EmailPreviewModal.tsx
'use client';

import { useState } from 'react';

interface EmailPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  previewData: {
    imageUrl: string;
    teamName: string;
    plaqueType: string;
    plaqueStyle: string;
  };
}

export default function EmailPreviewModal({ 
  isOpen, 
  onClose, 
  previewData 
}: EmailPreviewModalProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSend = async () => {
    setSending(true);
    setStatus('idle');

    try {
      const response = await fetch('/api/email-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recipientEmail: email,
          recipientName: name,
          teamName: previewData.teamName,
          previewUrl: window.location.origin + previewData.imageUrl,
          plaqueType: previewData.plaqueType,
          plaqueStyle: previewData.plaqueStyle,
          message
        }),
      });

      if (response.ok) {
        setStatus('success');
        setTimeout(() => {
          onClose();
          setEmail('');
          setName('');
          setMessage('');
          setStatus('idle');
        }, 2000);
      } else {
        setStatus('error');
      }
    } catch (error) {
      setStatus('error');
    } finally {
      setSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-bold mb-4">Email Preview</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="customer@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Recipient Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded px-3 py-2"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Message (optional)
            </label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
              placeholder="Here's the preview we discussed..."
            />
          </div>
          
          {status === 'success' && (
            <div className="bg-green-100 text-green-700 p-3 rounded">
              ✅ Email sent successfully!
            </div>
          )}
          
          {status === 'error' && (
            <div className="bg-red-100 text-red-700 p-3 rounded">
              ❌ Failed to send email. Please try again.
            </div>
          )}
          
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
              disabled={sending}
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={!email || !name || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {sending ? 'Sending...' : 'Send Email'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 5. Environment Variables
Add to `.env.local`:
```
RESEND_API_KEY=re_xxxxxxxxxxxxx
```

### 6. Add Email Button to Preview
In the preview display, add an email button:
```tsx
<button
  onClick={() => setShowEmailModal(true)}
  className="bg-green-600 text-white py-2 px-3 rounded text-sm font-medium hover:bg-green-700"
>
  📧 Email Preview
</button>
```

## Alternative: Simple mailto Link
For a quick solution without backend:
```tsx
const mailtoLink = `mailto:?subject=${encodeURIComponent(`${teamName} Plaque Preview`)}&body=${encodeURIComponent(`Check out this plaque preview: ${window.location.origin}${previewUrl}`)}`;
```

## Next Steps
1. Sign up for Resend account
2. Install dependencies
3. Create email template
4. Add API route
5. Add email modal to preview sections
6. Test with real email addresses