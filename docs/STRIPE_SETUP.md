# Stripe Setup Guide for RosterFrame

This guide will help you set up Stripe for production use with RosterFrame.

## Prerequisites

- A Stripe account (create one at https://stripe.com)
- Access to your hosting environment variables
- Basic understanding of webhooks

## Environment Variables

Add these to your `.env.local` file (or production environment):

```bash
# Required Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_... for testing
STRIPE_SECRET_KEY=sk_live_...                  # or sk_test_... for testing
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional but recommended
ADMIN_API_KEY=your-secure-admin-key           # For accessing /api/stripe-status
```

## Step 1: Get Your API Keys

1. Log in to your [Stripe Dashboard](https://dashboard.stripe.com)
2. Navigate to **Developers → API keys**
3. Copy your keys:
   - **Publishable key**: Starts with `pk_test_` or `pk_live_`
   - **Secret key**: Starts with `sk_test_` or `sk_live_`

⚠️ **Important**: Never commit your secret key to version control!

## Step 2: Set Up Webhooks

Webhooks are crucial for handling payment confirmations, refunds, and failed payments.

### For Production:

1. Go to **Developers → Webhooks** in Stripe Dashboard
2. Click **"Add endpoint"**
3. Enter your endpoint URL: `https://yourdomain.com/api/webhooks/stripe`
4. Select events to listen for:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `checkout.session.completed`
   - `charge.refunded`
   - `customer.created` (optional)
5. Copy the **Signing secret** (starts with `whsec_`)

### For Local Development:

1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
2. Run webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
3. Copy the webhook signing secret displayed

## Step 3: Test Your Configuration

1. Check your configuration status:
   ```bash
   curl http://localhost:3000/api/stripe-status
   ```

2. Run a test payment:
   - Use test card: `4242 4242 4242 4242`
   - Any future expiry date
   - Any 3-digit CVC

## Step 4: Production Checklist

Before going live:

- [ ] Switch from test keys to live keys
- [ ] Update webhook endpoint URL to production domain
- [ ] Verify webhook signing secret is set
- [ ] Test the full payment flow
- [ ] Enable all necessary payment methods in Stripe Dashboard
- [ ] Configure fraud prevention rules
- [ ] Set up email receipts in Stripe Dashboard
- [ ] Configure tax settings if applicable

## Payment Flow Overview

1. **Customer selects products** → Creates order in database
2. **Payment intent created** → Via `/api/create-payment-intent`
3. **Customer enters payment** → Using Stripe Elements
4. **Payment processed** → Stripe handles the transaction
5. **Webhook received** → `/api/webhooks/stripe` updates order status
6. **Confirmation sent** → Email sent to customer

## Troubleshooting

### Common Issues:

1. **"Stripe is not configured" error**
   - Ensure all environment variables are set
   - Restart your development server

2. **Webhook signature verification failed**
   - Verify `STRIPE_WEBHOOK_SECRET` matches your endpoint
   - Ensure you're using the raw request body

3. **Payment intents not completing**
   - Check Stripe Dashboard logs
   - Verify your domain is allowed in Stripe settings

### Debug Mode

Enable detailed logging by setting:
```bash
STRIPE_LOG_LEVEL=debug
```

## Security Best Practices

1. **Never expose your secret key** - It should only be used server-side
2. **Validate webhook signatures** - Already implemented in the code
3. **Use HTTPS in production** - Required by Stripe
4. **Implement rate limiting** - Prevent abuse of payment endpoints
5. **Monitor for suspicious activity** - Use Stripe Radar

## Additional Features

### Enable Apple Pay & Google Pay

In your Stripe Dashboard:
1. Go to **Settings → Payment methods**
2. Enable **Apple Pay** and **Google Pay**
3. Verify your domain

### Set Up Subscription Payments

If you plan to offer subscriptions:
1. Create products in Stripe Dashboard
2. Set up recurring prices
3. Update the code to use `mode: 'subscription'` in checkout sessions

## Support

- Stripe Documentation: https://stripe.com/docs
- Stripe Support: https://support.stripe.com
- Test cards: https://stripe.com/docs/testing

## Monitoring

After deployment, monitor your integration:
- Check Stripe Dashboard for successful payments
- Monitor webhook delivery success rate
- Set up alerts for failed payments
- Review Stripe Radar for fraud prevention

Remember to test thoroughly before processing real payments!