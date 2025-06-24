import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

// Store affiliate config in a settings table
export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'ebay_affiliate_config')
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      throw error;
    }

    const config = data?.value || {
      campaignId: process.env.EBAY_CAMPAIGN_ID || '',
      customId: '',
      networkId: '9',
      enabled: false
    };

    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error('Error fetching affiliate config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch config' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = await request.json();
    
    // Validate config
    if (!config.campaignId && config.enabled) {
      return NextResponse.json(
        { success: false, error: 'Campaign ID is required when enabling affiliate links' },
        { status: 400 }
      );
    }

    // Upsert the configuration
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'ebay_affiliate_config',
        value: config,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'key'
      });

    if (error) {
      throw error;
    }

    // If enabled, update all approved cards with affiliate URLs
    if (config.enabled) {
      // This would be done in a background job in production
      // For now, we'll just mark that they need regeneration
      await supabase
        .from('ebay_listings')
        .update({ affiliate_url: null })
        .eq('approval_status', 'approved');
    }

    return NextResponse.json({
      success: true,
      message: 'Affiliate configuration saved'
    });
  } catch (error) {
    console.error('Error saving affiliate config:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save config' },
      { status: 500 }
    );
  }
}