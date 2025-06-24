import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const appId = process.env.EBAY_APP_ID!;
    const certId = process.env.EBAY_CERT_ID!;
    
    // Test different credential formats
    const tests = [];
    
    // Test 1: Current format (app:cert)
    const format1 = Buffer.from(`${appId}:${certId}`).toString('base64');
    tests.push({
      format: 'appId:certId',
      encoded: format1,
      appId: appId.substring(0, 20) + '...',
      certId: certId.substring(0, 20) + '...'
    });
    
    // Test OAuth with detailed error info
    const response = await fetch('https://api.ebay.com/identity/v1/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${format1}`,
        'Accept': 'application/json'
      },
      body: 'grant_type=client_credentials',
    });
    
    const responseText = await response.text();
    let responseBody;
    try {
      responseBody = JSON.parse(responseText);
    } catch {
      responseBody = responseText;
    }
    
    return NextResponse.json({
      success: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      response: responseBody,
      tests,
      credentialLengths: {
        appId: appId.length,
        certId: certId.length,
        devId: process.env.EBAY_DEV_ID?.length || 0
      }
    });
    
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}