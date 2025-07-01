import { NextRequest, NextResponse } from 'next/server';
import { stripe, stripeConfig } from '@/app/lib/stripe-enhanced';

export async function GET(request: NextRequest) {
  // Basic security - only allow in development or with proper authorization
  if (process.env.NODE_ENV === 'production') {
    const authHeader = request.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_KEY;
    
    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
  }

  const status = {
    configured: stripeConfig.isConfigured(),
    testMode: stripeConfig.isTestMode(),
    environment: process.env.NODE_ENV,
    keys: {
      publishableKey: {
        present: !!stripeConfig.publishableKey,
        prefix: stripeConfig.publishableKey?.substring(0, 7) || 'not-set',
      },
      secretKey: {
        present: !!stripeConfig.secretKey,
        prefix: stripeConfig.secretKey?.substring(0, 7) || 'not-set',
      },
      webhookSecret: {
        present: !!stripeConfig.webhookSecret,
        prefix: stripeConfig.webhookSecret?.substring(0, 7) || 'not-set',
      },
    },
    capabilities: {
      payments: false,
      webhooks: false,
      refunds: false,
      customers: false,
    },
    webhookEndpoint: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/webhooks/stripe`,
  };

  // Test Stripe connection if configured
  if (stripe && stripeConfig.isConfigured()) {
    try {
      // Test basic API access
      const account = await stripe.accounts.retrieve();
      
      status.capabilities = {
        payments: true,
        webhooks: !!stripeConfig.webhookSecret,
        refunds: true,
        customers: true,
      };

      // Add account info (safe subset)
      (status as any).account = {
        id: account.id,
        businessType: account.business_type,
        country: account.country,
        defaultCurrency: account.default_currency,
        payoutsEnabled: account.payouts_enabled,
        chargesEnabled: account.charges_enabled,
      };

      // Check webhook endpoint status
      if (stripeConfig.webhookSecret) {
        try {
          const webhookEndpoints = await stripe.webhookEndpoints.list({ limit: 10 });
          const appEndpoint = webhookEndpoints.data.find(
            endpoint => endpoint.url.includes('/api/webhooks/stripe')
          );
          
          if (appEndpoint) {
            (status as any).webhookStatus = {
              id: appEndpoint.id,
              url: appEndpoint.url,
              enabled: appEndpoint.status === 'enabled',
              enabledEvents: appEndpoint.enabled_events,
            };
          }
        } catch (webhookError) {
          console.error('Failed to check webhook status:', webhookError);
        }
      }

    } catch (error) {
      console.error('Stripe connection test failed:', error);
      status.capabilities = {
        payments: false,
        webhooks: false,
        refunds: false,
        customers: false,
      };
      (status as any).error = error instanceof Error ? error.message : 'Unknown error';
    }
  }

  // Add recommendations
  const recommendations = [];
  
  if (!stripeConfig.isConfigured()) {
    recommendations.push('Add all required Stripe environment variables');
  }
  
  if (stripeConfig.isTestMode() && process.env.NODE_ENV === 'production') {
    recommendations.push('Switch to live Stripe keys for production');
  }
  
  if (!stripeConfig.webhookSecret) {
    recommendations.push('Configure webhook endpoint secret for reliable payment processing');
  }
  
  if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_API_KEY) {
    recommendations.push('Set ADMIN_API_KEY environment variable to secure this endpoint');
  }

  return NextResponse.json({
    status,
    recommendations,
    timestamp: new Date().toISOString(),
  });
}