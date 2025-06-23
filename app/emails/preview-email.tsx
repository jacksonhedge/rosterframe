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
          <Heading style={h1}>🏆 Your Plaque Preview</Heading>
          
          <Text style={text}>Hi {recipientName},</Text>
          
          {message && (
            <Text style={text}>{message}</Text>
          )}

          <Text style={text}>
            Your custom sports plaque preview is ready! Check out how your {teamName} roster looks:
          </Text>
          
          <Section style={imageSection}>
            <Img
              src={previewUrl}
              width="600"
              alt={`${teamName} Plaque Preview`}
              style={image}
            />
          </Section>
          
          <Section style={detailsSection}>
            <Text style={detailsText}>
              <strong>Team Name:</strong> {teamName}
            </Text>
            <Text style={detailsText}>
              <strong>Configuration:</strong> {plaqueType} cards
            </Text>
            <Text style={detailsText}>
              <strong>Style:</strong> {plaqueStyle}
            </Text>
          </Section>
          
          <Button style={button} href={previewUrl}>
            View Full Size Preview
          </Button>

          <Text style={helpText}>
            Have questions or ready to order? Just reply to this email and we'll help you out!
          </Text>
          
          <Text style={footer}>
            Sent by {senderName} via RosterFrame<br />
            The ultimate way to display your fantasy sports victory
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 20px 48px',
  marginBottom: '64px',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '28px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const imageSection = {
  margin: '30px 0',
  textAlign: 'center' as const,
};

const image = {
  border: '2px solid #e6e6e6',
  borderRadius: '12px',
  maxWidth: '100%',
  height: 'auto',
};

const detailsSection = {
  backgroundColor: '#f8f9fa',
  borderRadius: '8px',
  padding: '20px',
  margin: '20px 0',
};

const detailsText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0 0 8px',
};

const button = {
  backgroundColor: '#ea580c',
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '14px',
  marginTop: '24px',
  marginBottom: '24px',
};

const helpText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const footer = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
};