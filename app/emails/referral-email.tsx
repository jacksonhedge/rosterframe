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

interface ReferralEmailProps {
  recipientName: string;
  senderName: string;
  teamName?: string;
  message?: string;
  referralCode?: string;
  discountAmount?: number;
  previewUrl?: string;
}

export default function ReferralEmail({
  recipientName,
  senderName,
  teamName,
  message,
  referralCode,
  discountAmount = 10,
  previewUrl
}: ReferralEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>{senderName} thinks you'd love a custom sports plaque from RosterFrame!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🏆 You've Been Invited!</Heading>
          
          <Text style={text}>Hi {recipientName},</Text>
          
          <Text style={text}>
            {senderName} thinks you'd love RosterFrame - the ultimate way to celebrate your fantasy sports victories 
            with a custom plaque featuring your winning roster!
          </Text>

          {message && (
            <Section style={messageBox}>
              <Text style={messageText}>
                <strong>Message from {senderName}:</strong><br />
                "{message}"
              </Text>
            </Section>
          )}

          {/* Preview Image if available */}
          {previewUrl && teamName && (
            <>
              <Text style={sectionTitle}>
                Check out {senderName}'s {teamName} plaque:
              </Text>
              <Section style={imageSection}>
                <Img
                  src={previewUrl}
                  width="500"
                  alt={`${teamName} Plaque Example`}
                  style={image}
                />
              </Section>
            </>
          )}

          {/* What is RosterFrame */}
          <Section style={infoSection}>
            <Heading as="h2" style={h2}>What is RosterFrame?</Heading>
            
            <div style={featureItem}>
              <Text style={featureTitle}>🎨 Custom Design</Text>
              <Text style={featureDescription}>
                Turn your fantasy sports roster into a professional plaque with real player cards
              </Text>
            </div>

            <div style={featureItem}>
              <Text style={featureTitle}>⚡ Easy to Create</Text>
              <Text style={featureDescription}>
                Just enter your league details and we'll do the rest - preview in seconds!
              </Text>
            </div>

            <div style={featureItem}>
              <Text style={featureTitle}>🏅 Premium Quality</Text>
              <Text style={featureDescription}>
                Museum-quality frames with authentic trading cards of your championship team
              </Text>
            </div>

            <div style={featureItem}>
              <Text style={featureTitle}>🎁 Perfect Gift</Text>
              <Text style={featureDescription}>
                Ideal for league champions, fantasy sports enthusiasts, or as a trophy alternative
              </Text>
            </div>
          </Section>

          {/* Special Offer */}
          {referralCode && (
            <Section style={offerSection}>
              <Text style={offerTitle}>🎉 Special Friend Offer!</Text>
              <Text style={offerText}>
                As a friend of {senderName}, you get ${discountAmount} off your first plaque!
              </Text>
              <div style={codeBox}>
                <Text style={codeText}>
                  Use code: <strong>{referralCode}</strong>
                </Text>
              </div>
            </Section>
          )}

          {/* CTA Buttons */}
          <Button style={button} href="https://rosterframe.com/build-and-buy">
            Create Your Plaque
          </Button>

          <Button style={secondaryButton} href="https://rosterframe.com">
            Learn More
          </Button>

          {/* How it Works */}
          <Section style={howItWorksSection}>
            <Heading as="h2" style={h2}>How It Works</Heading>
            
            <div style={stepContainer}>
              <div style={step}>
                <div style={stepNumber}>1</div>
                <Text style={stepText}>Enter your league details</Text>
              </div>
              
              <div style={step}>
                <div style={stepNumber}>2</div>
                <Text style={stepText}>Select your players</Text>
              </div>
              
              <div style={step}>
                <div style={stepNumber}>3</div>
                <Text style={stepText}>Preview & customize</Text>
              </div>
              
              <div style={step}>
                <div style={stepNumber}>4</div>
                <Text style={stepText}>Order & receive your plaque!</Text>
              </div>
            </div>
          </Section>

          <Text style={helpText}>
            Questions? Reply to this email or contact us at{' '}
            <Link href="mailto:support@rosterframe.com" style={link}>
              support@rosterframe.com
            </Link>
          </Text>
          
          <Text style={footer}>
            RosterFrame<br />
            The ultimate way to display your fantasy sports victory<br />
            <Link href="https://rosterframe.com/unsubscribe" style={unsubscribeLink}>
              Unsubscribe
            </Link>
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
  fontSize: '32px',
  fontWeight: '700',
  lineHeight: '40px',
  margin: '0 0 20px',
  textAlign: 'center' as const,
};

const h2 = {
  color: '#1a1a1a',
  fontSize: '20px',
  fontWeight: '600',
  lineHeight: '28px',
  margin: '0 0 16px',
};

const text = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '0 0 16px',
};

const sectionTitle = {
  color: '#333',
  fontSize: '16px',
  lineHeight: '26px',
  margin: '20px 0 10px',
  textAlign: 'center' as const,
};

const messageBox = {
  backgroundColor: '#fff3e0',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  borderLeft: '4px solid #ff9800',
};

const messageText = {
  color: '#333',
  fontSize: '15px',
  lineHeight: '24px',
  margin: '0',
  fontStyle: 'italic' as const,
};

const imageSection = {
  margin: '20px 0 30px',
  textAlign: 'center' as const,
};

const image = {
  border: '2px solid #e6e6e6',
  borderRadius: '12px',
  maxWidth: '100%',
  height: 'auto',
};

const infoSection = {
  margin: '30px 0',
};

const featureItem = {
  marginBottom: '20px',
};

const featureTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
};

const featureDescription = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const offerSection = {
  backgroundColor: '#e8f5e9',
  borderRadius: '12px',
  padding: '24px',
  margin: '30px 0',
  textAlign: 'center' as const,
};

const offerTitle = {
  color: '#2e7d32',
  fontSize: '20px',
  fontWeight: '700' as const,
  margin: '0 0 8px',
};

const offerText = {
  color: '#333',
  fontSize: '16px',
  margin: '0 0 16px',
};

const codeBox = {
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  padding: '12px',
  margin: '0 auto',
  display: 'inline-block',
};

const codeText = {
  color: '#2e7d32',
  fontSize: '18px',
  margin: '0',
  letterSpacing: '2px',
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
  marginBottom: '12px',
};

const secondaryButton = {
  backgroundColor: '#ffffff',
  border: '2px solid #ea580c',
  borderRadius: '6px',
  color: '#ea580c',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'block',
  width: '100%',
  padding: '12px',
  marginBottom: '24px',
};

const howItWorksSection = {
  margin: '40px 0',
};

const stepContainer = {
  display: 'flex',
  justifyContent: 'space-between',
  flexWrap: 'wrap' as const,
  margin: '20px 0',
};

const step = {
  flex: '1',
  minWidth: '120px',
  textAlign: 'center' as const,
  marginBottom: '20px',
};

const stepNumber = {
  backgroundColor: '#ea580c',
  color: '#ffffff',
  width: '36px',
  height: '36px',
  borderRadius: '50%',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '18px',
  fontWeight: '700' as const,
  marginBottom: '8px',
};

const stepText = {
  color: '#666',
  fontSize: '14px',
  margin: '0',
};

const helpText = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '24px 0',
  textAlign: 'center' as const,
};

const link = {
  color: '#ea580c',
  textDecoration: 'underline',
};

const footer = {
  color: '#8898aa',
  fontSize: '13px',
  lineHeight: '20px',
  marginTop: '32px',
  textAlign: 'center' as const,
};

const unsubscribeLink = {
  color: '#8898aa',
  textDecoration: 'underline',
  fontSize: '12px',
};