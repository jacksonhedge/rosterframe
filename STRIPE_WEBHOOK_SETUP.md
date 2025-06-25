# Stripe Webhook Setup Guide

## Overview
Webhooks are essential for handling asynchronous events from Stripe, such as successful payments, failed charges, and refunds.

## Setting Up Webhooks

### 1. Local Development with Stripe CLI

Install the Stripe CLI:
```bash
# macOS
brew install stripe/stripe-cli/stripe

# Or download from https://stripe.com/docs/stripe-cli
```

Login to Stripe:
```bash
stripe login
```

Forward webhooks to your local server:
```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

This will display your webhook signing secret. Add it to your `.env.local`:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 2. Production Setup

1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`
   - `customer.created` (optional)

5. Copy the signing secret and add to your production environment variables:
```
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Testing Webhooks

### Local Testing
With the Stripe CLI running, create a test payment:
```bash
stripe trigger payment_intent.succeeded
```

### Production Testing
Use Stripe's webhook testing tool in the dashboard or create a real test payment.

## Webhook Handler Details

Our webhook handler (`/api/webhooks/stripe`) handles:

- **payment_intent.succeeded**: Updates order status to paid
- **payment_intent.payment_failed**: Updates order status to failed
- **checkout.session.completed**: Updates order with customer details
- **charge.refunded**: Handles full and partial refunds

## Troubleshooting

### Common Issues

1. **Webhook signature verification failed**
   - Ensure the webhook secret is correct
   - Check that the raw body is being passed (no body parsing)

2. **Order not found**
   - Verify the payment intent ID matches
   - Check database connection

3. **Webhook not received**
   - Verify endpoint URL is correct
   - Check firewall/security settings
   - Ensure webhook events are selected in Stripe

### Debugging Tips

- Check Stripe webhook logs in the dashboard
- Use `stripe listen --print-json` for detailed local logs
- Monitor your application logs for errors

## Security Best Practices

1. Always verify webhook signatures
2. Use HTTPS in production
3. Implement idempotency for critical operations
4. Set up webhook endpoint monitoring
5. Rotate webhook secrets periodically