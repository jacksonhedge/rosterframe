# 🔥 Stripe Payment Integration Setup

Your Roster Frame application now supports credit and debit card payments through Stripe! Follow these steps to complete the setup.

## 📋 Prerequisites

1. **Stripe Account**: Sign up at [https://stripe.com](https://stripe.com)
2. **Get your API Keys**: Visit [https://dashboard.stripe.com/apikeys](https://dashboard.stripe.com/apikeys)

## 🔑 Environment Variables Setup

Create a `.env.local` file in your project root and add these variables:

```env
# Stripe Configuration
# Get these from your Stripe Dashboard: https://dashboard.stripe.com/apikeys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here

# Webhook endpoint secret (for production)
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 🧪 Test Keys vs Live Keys

- **Test Keys** (start with `pk_test_` and `sk_test_`): Use these for development and testing
- **Live Keys** (start with `pk_live_` and `sk_live_`): Use these for production only

## 💳 Testing Your Payment Integration

### Test Card Numbers

Use these test card numbers in your application:

| Card Type | Number | CVC | Date |
|-----------|--------|-----|------|
| Visa | `4242424242424242` | Any 3 digits | Any future date |
| Visa (debit) | `4000056655665556` | Any 3 digits | Any future date |
| Mastercard | `5555555555554444` | Any 3 digits | Any future date |
| American Express | `378282246310005` | Any 4 digits | Any future date |
| Declined Card | `4000000000000002` | Any 3 digits | Any future date |

### Testing Scenarios

1. **Successful Payment**: Use `4242424242424242`
2. **Declined Payment**: Use `4000000000000002`
3. **Insufficient Funds**: Use `4000000000009995`
4. **Card Expired**: Use `4000000000000069`

## 🚀 Deployment Checklist

### Before Going Live:

1. **Switch to Live Keys**: Replace test keys with live keys in production environment
2. **Enable Webhooks**: Set up webhook endpoints for payment confirmations
3. **Security**: Ensure `.env.local` is in your `.gitignore` file
4. **SSL Certificate**: Ensure your production site uses HTTPS
5. **PCI Compliance**: Review Stripe's PCI compliance requirements

## 🔧 Features Included

- ✅ **Secure Card Processing**: PCI-compliant payment forms
- ✅ **Real-time Validation**: Instant card validation
- ✅ **Multiple Payment Methods**: Visa, Mastercard, American Express, etc.
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **Loading States**: Visual feedback during payment processing
- ✅ **Order Integration**: Payment tied to your plaque orders
- ✅ **Receipt Generation**: Payment confirmation with transaction ID

## 📊 Stripe Dashboard

Monitor your payments at: [https://dashboard.stripe.com](https://dashboard.stripe.com)

- View transactions
- Track revenue
- Manage refunds
- Download reports
- Set up webhooks

## 🛠️ Advanced Configuration

### Webhook Setup (Optional)

For production, set up webhooks to handle payment events:

1. Go to [Stripe Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://yourdomain.com/api/webhooks/stripe`
3. Select events: `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook secret to your environment variables

### Custom Styling

The payment form uses your existing brown/gold theme. Customize further in:
- `app/components/StripePaymentForm.tsx`

## 📞 Support

- **Stripe Documentation**: [https://stripe.com/docs](https://stripe.com/docs)
- **Stripe Support**: [https://support.stripe.com](https://support.stripe.com)
- **Test Cards**: [https://stripe.com/docs/testing](https://stripe.com/docs/testing)

---

🎉 **You're all set!** Your customers can now securely purchase their custom Roster Frame plaques with any major credit or debit card. 