import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(request: NextRequest) {
  try {
    const { cardIds, status } = await request.json();
    
    if (!cardIds || !Array.isArray(cardIds) || cardIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No cards provided' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update multiple cards at once
    const { data, error } = await supabase
      .from('ebay_listings')
      .update({
        approval_status: status,
        approved_at: new Date().toISOString(),
        approved_by: 'admin', // In a real app, get this from session
        is_active: status === 'approved'
      })
      .in('id', cardIds);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      message: `Successfully updated ${cardIds.length} cards`
    });
  } catch (error) {
    console.error('Error updating card statuses:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update statuses' },
      { status: 500 }
    );
  }
}