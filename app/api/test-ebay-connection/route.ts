import { NextResponse } from 'next/server';
import { ebayAPI } from '@/app/lib/ebay-api';

export async function GET() {
  try {
    const result = await ebayAPI.testConnection();
    
    return NextResponse.json({
      success: result.success,
      message: result.message,
      environment: process.env.EBAY_ENVIRONMENT || 'unknown',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('eBay connection test error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Connection test failed',
        environment: process.env.EBAY_ENVIRONMENT || 'unknown'
      },
      { status: 500 }
    );
  }
}