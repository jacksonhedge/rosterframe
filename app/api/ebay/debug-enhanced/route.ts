import { NextResponse } from 'next/server';

export async function GET() {
  // Check environment variables
  const config = {
    appId: process.env.EBAY_APP_ID,
    devId: process.env.EBAY_DEV_ID,
    certId: process.env.EBAY_CERT_ID,
    environment: process.env.EBAY_ENVIRONMENT,
  };

  // Validate credentials format
  const validation = {
    appId: {
      exists: !!config.appId,
      format: config.appId ? /^[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Z]{3}-[A-Za-z0-9]+-[A-Za-z0-9]+$/.test(config.appId) : false,
      prefix: config.appId?.split('-')[2] || 'N/A',
      length: config.appId?.length || 0,
    },
    certId: {
      exists: !!config.certId,
      format: config.certId ? /^[A-Z]{3}-[A-Za-z0-9]+-[A-Za-z0-9]+-[A-Za-z0-9]+$/.test(config.certId) : false,
      prefix: config.certId?.split('-')[0] || 'N/A',
      length: config.certId?.length || 0,
    },
    devId: {
      exists: !!config.devId,
      format: config.devId ? /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(config.devId) : false,
      length: config.devId?.length || 0,
    },
    environment: {
      exists: !!config.environment,
      valid: ['sandbox', 'production'].includes(config.environment || ''),
      value: config.environment || 'NOT SET',
    }
  };

  // Mask sensitive data for security
  const maskedConfig = {
    appId: config.appId ? `${config.appId.substring(0, 8)}...${config.appId.substring(config.appId.length - 4)}` : 'NOT SET',
    devId: config.devId ? `${config.devId.substring(0, 8)}...${config.devId.substring(config.devId.length - 4)}` : 'NOT SET',
    certId: config.certId ? `${config.certId.substring(0, 8)}...${config.certId.substring(config.certId.length - 4)}` : 'NOT SET',
    environment: config.environment || 'NOT SET',
  };

  // Test OAuth endpoint with detailed error capture
  let oauthTest = { 
    success: false, 
    message: '', 
    endpoint: '',
    requestDetails: {},
    responseDetails: {},
    credentials: '',
  };
  
  try {
    // Validate we have all required credentials
    if (!config.appId || !config.certId) {
      throw new Error('Missing required credentials: appId or certId');
    }

    const baseUrl = config.environment === 'sandbox' 
      ? 'https://api.sandbox.ebay.com'
      : 'https://api.ebay.com';
    
    const credentials = Buffer.from(`${config.appId}:${config.certId}`).toString('base64');
    
    oauthTest.endpoint = `${baseUrl}/identity/v1/oauth2/token`;
    oauthTest.credentials = `Basic ${credentials.substring(0, 20)}...`;
    
    // Build the request
    const requestBody = 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope';
    
    oauthTest.requestDetails = {
      method: 'POST',
      endpoint: oauthTest.endpoint,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials.substring(0, 20)}...`,
      },
      body: requestBody,
      bodyLength: requestBody.length,
    };

    console.log('🔐 Making OAuth request to:', oauthTest.endpoint);
    console.log('📋 Request body:', requestBody);
    
    const response = await fetch(oauthTest.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${credentials}`,
      },
      body: requestBody,
    });

    oauthTest.responseDetails = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };

    console.log('📡 OAuth response status:', response.status, response.statusText);

    if (response.ok) {
      const data = await response.json();
      oauthTest.success = true;
      oauthTest.message = 'Successfully obtained access token';
      oauthTest.responseDetails.tokenInfo = {
        hasToken: !!data.access_token,
        tokenLength: data.access_token?.length || 0,
        expiresIn: data.expires_in,
        tokenType: data.token_type,
        scopes: data.scope,
      };
    } else {
      const errorText = await response.text();
      console.error('❌ OAuth error response:', errorText);
      
      // Try to parse as JSON if possible
      let errorDetails = errorText;
      try {
        errorDetails = JSON.parse(errorText);
      } catch (e) {
        // Keep as text if not JSON
      }
      
      oauthTest.message = `OAuth failed: ${response.status} ${response.statusText}`;
      oauthTest.responseDetails.error = errorDetails;
    }
  } catch (error) {
    console.error('🔥 OAuth exception:', error);
    oauthTest.message = `OAuth error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    oauthTest.responseDetails.exception = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    };
  }

  // Test direct API call if OAuth succeeds
  let apiTest = { success: false, message: '', endpoint: '' };
  
  if (oauthTest.success && oauthTest.responseDetails.tokenInfo?.hasToken) {
    try {
      // Extract token from OAuth response
      const tokenResponse = await fetch(oauthTest.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${config.appId}:${config.certId}`).toString('base64')}`,
        },
        body: 'grant_type=client_credentials&scope=https://api.ebay.com/oauth/api_scope',
      });
      
      const tokenData = await tokenResponse.json();
      const accessToken = tokenData.access_token;
      
      // Test Browse API
      const baseUrl = config.environment === 'sandbox' 
        ? 'https://api.sandbox.ebay.com'
        : 'https://api.ebay.com';
      
      apiTest.endpoint = `${baseUrl}/buy/browse/v1/item_summary/search?q=test&limit=1`;
      
      const browseResponse = await fetch(apiTest.endpoint, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
        },
      });
      
      if (browseResponse.ok) {
        apiTest.success = true;
        apiTest.message = 'Browse API working correctly';
      } else {
        const errorText = await browseResponse.text();
        apiTest.message = `Browse API failed: ${browseResponse.status} - ${errorText}`;
      }
    } catch (error) {
      apiTest.message = `API test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  }

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    config: maskedConfig,
    validation,
    oauthTest,
    apiTest,
    diagnostics: {
      credentialPrefixMatch: validation.appId.prefix === validation.certId.prefix,
      environmentMatch: validation.appId.prefix === 'PRD' ? config.environment === 'production' : config.environment === 'sandbox',
      allCredentialsPresent: validation.appId.exists && validation.certId.exists && validation.devId.exists,
      formatValidation: validation.appId.format && validation.certId.format && validation.devId.format,
    },
    recommendations: [
      'Ensure APP_ID and CERT_ID are from the same environment (both PRD or both SBX)',
      'For production, use credentials starting with PRD-',
      'For sandbox, use credentials starting with SBX-',
      'Verify credentials are copied completely without extra spaces',
      'Check eBay developer account for any API access restrictions',
      'Ensure your app has the required scopes enabled in eBay developer dashboard',
    ]
  });
}