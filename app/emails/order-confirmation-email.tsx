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
  Row,
  Column,
} from '@react-email/components';

interface OrderConfirmationEmailProps {
  customerName: string;
  orderNumber: string;
  teamName: string;
  plaqueType: string;
  plaqueStyle: string;
  subtotal: number;
  discountAmount?: number;
  totalAmount: number;
  shippingAddress?: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  giftPackaging?: boolean;
  estimatedDelivery?: string;
  isPreOrder?: boolean;
  previewUrl?: string;
}

export default function OrderConfirmationEmail({
  customerName,
  orderNumber,
  teamName,
  plaqueType,
  plaqueStyle,
  subtotal,
  discountAmount = 0,
  totalAmount,
  shippingAddress,
  giftPackaging = false,
  estimatedDelivery = '7-10 business days',
  isPreOrder = false,
  previewUrl
}: OrderConfirmationEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>Order #{orderNumber} confirmed - Your {teamName} plaque is on the way!</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>🎉 Order Confirmed!</Heading>
          
          <Text style={text}>Hi {customerName},</Text>
          
          <Text style={text}>
            Thank you for your order! We're excited to create your custom {teamName} plaque. 
            Your order has been received and payment confirmed.
          </Text>

          {/* Order Number Box */}
          <Section style={orderBox}>
            <Text style={orderNumber}>
              Order Number: <strong>{orderNumber}</strong>
            </Text>
          </Section>

          {/* Preview Image if available */}
          {previewUrl && (
            <Section style={imageSection}>
              <Img
                src={previewUrl}
                width="500"
                alt={`${teamName} Plaque Preview`}
                style={image}
              />
            </Section>
          )}

          {/* Order Details */}
          <Section style={detailsSection}>
            <Heading as="h2" style={h2}>Order Details</Heading>
            
            <Row style={detailRow}>
              <Column style={detailLabel}>Team Name:</Column>
              <Column style={detailValue}>{teamName}</Column>
            </Row>
            
            <Row style={detailRow}>
              <Column style={detailLabel}>Plaque Type:</Column>
              <Column style={detailValue}>{plaqueType} cards</Column>
            </Row>
            
            <Row style={detailRow}>
              <Column style={detailLabel}>Style:</Column>
              <Column style={detailValue}>{plaqueStyle}</Column>
            </Row>

            {giftPackaging && (
              <Row style={detailRow}>
                <Column style={detailLabel}>Gift Packaging:</Column>
                <Column style={detailValue}>🎁 Included</Column>
              </Row>
            )}

            <div style={divider} />

            <Row style={detailRow}>
              <Column style={detailLabel}>Subtotal:</Column>
              <Column style={detailValue}>${subtotal.toFixed(2)}</Column>
            </Row>

            {discountAmount > 0 && (
              <Row style={detailRow}>
                <Column style={detailLabel}>Discount:</Column>
                <Column style={detailValueDiscount}>-${discountAmount.toFixed(2)}</Column>
              </Row>
            )}

            <Row style={totalRow}>
              <Column style={totalLabel}>Total Paid:</Column>
              <Column style={totalValue}>${totalAmount.toFixed(2)}</Column>
            </Row>
          </Section>

          {/* Shipping Address */}
          {shippingAddress && (
            <Section style={detailsSection}>
              <Heading as="h2" style={h2}>Shipping Address</Heading>
              <Text style={addressText}>
                {shippingAddress.line1}<br />
                {shippingAddress.line2 && <>{shippingAddress.line2}<br /></>}
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postal_code}<br />
                {shippingAddress.country}
              </Text>
            </Section>
          )}

          {/* What's Next */}
          <Section style={nextStepsSection}>
            <Heading as="h2" style={h2}>What Happens Next?</Heading>
            
            <div style={stepItem}>
              <Text style={stepTitle}>✅ Order Received</Text>
              <Text style={stepDescription}>
                Your order has been received and payment confirmed.
              </Text>
            </div>

            <div style={stepItem}>
              <Text style={stepTitle}>🎨 Design & Production</Text>
              <Text style={stepDescription}>
                Our team will create your custom plaque with your selected players.
              </Text>
            </div>

            <div style={stepItem}>
              <Text style={stepTitle}>📦 Shipping</Text>
              <Text style={stepDescription}>
                Your plaque will be carefully packaged and shipped within {estimatedDelivery}.
                {isPreOrder && (
                  <span style={preOrderNotice}>
                    <br />Pre-order: Expected delivery in March 2025
                  </span>
                )}
              </Text>
            </div>

            <div style={stepItem}>
              <Text style={stepTitle}>🚚 Delivery</Text>
              <Text style={stepDescription}>
                You'll receive tracking information once your order ships.
              </Text>
            </div>
          </Section>

          {/* CTA Button */}
          <Button style={button} href={`https://rosterframe.com/order-status/${orderNumber}`}>
            Track Your Order
          </Button>

          {/* Support */}
          <Text style={helpText}>
            Have questions about your order? Reply to this email or contact us at{' '}
            <Link href="mailto:support@rosterframe.com" style={link}>
              support@rosterframe.com
            </Link>
          </Text>
          
          <Text style={footer}>
            RosterFrame<br />
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

const orderBox = {
  backgroundColor: '#e8f5e9',
  borderRadius: '8px',
  padding: '16px',
  margin: '20px 0',
  textAlign: 'center' as const,
};

const orderNumber = {
  color: '#2e7d32',
  fontSize: '18px',
  margin: '0',
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
  padding: '24px',
  margin: '20px 0',
};

const detailRow = {
  marginBottom: '12px',
};

const detailLabel = {
  color: '#666',
  fontSize: '14px',
  width: '40%',
  paddingRight: '16px',
};

const detailValue = {
  color: '#333',
  fontSize: '14px',
  fontWeight: '600' as const,
  width: '60%',
};

const detailValueDiscount = {
  color: '#2e7d32',
  fontSize: '14px',
  fontWeight: '600' as const,
  width: '60%',
};

const divider = {
  borderTop: '1px solid #e0e0e0',
  margin: '16px 0',
};

const totalRow = {
  marginTop: '8px',
};

const totalLabel = {
  color: '#333',
  fontSize: '16px',
  fontWeight: '700' as const,
  width: '40%',
  paddingRight: '16px',
};

const totalValue = {
  color: '#ea580c',
  fontSize: '18px',
  fontWeight: '700' as const,
  width: '60%',
};

const addressText = {
  color: '#333',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const nextStepsSection = {
  margin: '30px 0',
};

const stepItem = {
  marginBottom: '20px',
};

const stepTitle = {
  color: '#1a1a1a',
  fontSize: '16px',
  fontWeight: '600' as const,
  margin: '0 0 4px',
};

const stepDescription = {
  color: '#666',
  fontSize: '14px',
  lineHeight: '22px',
  margin: '0',
};

const preOrderNotice = {
  color: '#1976d2',
  fontWeight: '600' as const,
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