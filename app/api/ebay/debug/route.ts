import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment variables
  const config = {
    appId: process.env.EBAY_APP_ID,
    devId: process.env.EBAY_DEV_ID,
    certId: process.env.EBAY_CERT_ID,
    environment: process.env.EBAY_ENVIRONMENT,
  };

  // Mask sensitive data for security
  const maskedConfig = {
    appId: config.appId ? `${config.appId.substring(0, 8)}...` : 'NOT SET',
    devId: config.devId ? `${config.devId.substring(0, 8)}...` : 'NOT SET',
    certId: config.certId ? `${config.certId.substring(0, 8)}...` : 'NOT SET',
    environment: config.environment || 'NOT SET',
  };

  // Test OAuth endpoint
  let oauthTest = { success: false, message: '', endpoint: '' };
  
  try {
    const baseUrl = config.environment === 'sandbox' 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
    
    const credentials = Buffer.from(`${config.appId}:${config.certId}`).toString('base64');
    
    oauthTest.endpoint = `${baseUrl}/identity/v1/oauth2/token`;
    
    const response = await fetch(oauthTest.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
    });

    if (response.ok) {
      const data = await response.json();
      oauthTest.success = true;
      oauthTest.message = 'Successfully obtained access token';
    } else {
      const errorText = await response.text();
      oauthTest.message = `OAuth failed: ${response.status} ${response.statusText} - ${errorText}`;
    }
  } catch (error) {
    oauthTest.message = `OAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }

  return NextResponse.json({
    config: maskedConfig,
    oauthTest,
    recommendations: [
      'Ensure all eBay credentials are correctly set in .env.local',
      'For production, use production credentials (PRD-xxx)',
      'For sandbox, use sandbox credentials (SBX-xxx)',
      'Check that cert ID is complete and matches your app ID environment',
    ]
  });
}