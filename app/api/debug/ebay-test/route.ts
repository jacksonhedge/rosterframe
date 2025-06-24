import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '@/app/lib/ebay-api';

export async function GET(request: NextRequest) {
  try {
    console.log('Starting eBay API test...');
    
    // First test: Check credentials
    const credentials = {
      appId: process.env.EBAY_APP_ID ? 'Set' : 'Missing',
      devId: process.env.EBAY_DEV_ID ? 'Set' : 'Missing',
      certId: process.env.EBAY_CERT_ID ? 'Set' : 'Missing',
      environment: process.env.EBAY_ENVIRONMENT || 'Not set'
    };
    
    console.log('Credentials check:', credentials);
    
    // Try both sandbox and production endpoints with different scopes
    const appId = process.env.EBAY_APP_ID!;
    const certId = process.env.EBAY_CERT_ID!;
    
    const tests = [
      {
        name: 'Production with general scope',
        baseUrl: 'https://api.ebay.com',
        scope: 'https://api.ebay.com/oauth/api_scope'
      },
      {
        name: 'Production with buy scope',
        baseUrl: 'https://api.ebay.com',
        scope: 'https://api.ebay.com/oauth/api_scope/buy.marketing'
      },
      {
        name: 'Sandbox with general scope',
        baseUrl: 'https://api.sandbox.ebay.com',
        scope: 'https://api.ebay.com/oauth/api_scope'
      }
    ];
    
    const results = [];
    
    for (const test of tests) {
      const oauthCredentials = Buffer.from(`${appId}:${certId}`).toString('base64');
      
      try {
        const oauthResponse = await fetch(`${test.baseUrl}/identity/v1/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${oauthCredentials}`,
          },
          body: `grant_type=client_credentials&scope=${test.scope}`,
        });
        
        const oauthText = await oauthResponse.text();
        
        results.push({
          test: test.name,
          status: oauthResponse.status,
          success: oauthResponse.ok,
          response: oauthText.substring(0, 200)
        });
        
        if (oauthResponse.ok) {
          // If this test worked, try a search
          const oauthData = JSON.parse(oauthText);
          
          const searchParams = new URLSearchParams({
            q: 'Patrick Mahomes football card',
            category_ids: '212',
            limit: '3',
          });
          
          const searchResponse = await fetch(
            `${test.baseUrl}/buy/browse/v1/item_summary/search?${searchParams}`,
            {
              headers: {
                'Authorization': `Bearer ${oauthData.access_token}`,
                'Content-Type': 'application/json',
                'X-EBAY-C-MARKETPLACE-ID': 'EBAY_US',
              },
            }
          );
          
          const searchText = await searchResponse.text();
          
          results[results.length - 1].searchTest = {
            status: searchResponse.status,
            hasResults: searchText.includes('itemSummaries'),
            itemCount: (searchText.match(/itemId/g) || []).length
          };
          
          break; // Found working config
        }
      } catch (error) {
        results.push({
          test: test.name,
          status: 'error',
          success: false,
          response: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
    
    return NextResponse.json({
      success: results.some(r => r.success),
      credentials,
      tests: results
    });
    
  } catch (error) {
    console.error('eBay test error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      credentials: {
        appId: process.env.EBAY_APP_ID ? 'Set' : 'Missing',
        devId: process.env.EBAY_DEV_ID ? 'Set' : 'Missing',
        certId: process.env.EBAY_CERT_ID ? 'Set' : 'Missing',
        environment: process.env.EBAY_ENVIRONMENT || 'Not set'
      }
    }, { status: 500 });
  }
}