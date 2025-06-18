import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const submission = await request.json();
    
    // Validate required fields
    const requiredFields = ['player_name', 'set_name', 'year', 'card_number'];
    for (const field of requiredFields) {
      if (!submission[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // TODO: Store in a pending_submissions table when database is ready

    return NextResponse.json({
      message: 'Card submission received for review',
      submission_id: `temp-${Date.now()}`,
      status: 'pending_review'
    });

  } catch (error) {
    console.error('Card submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit card information' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // TODO: Get pending submissions for admin review when database is ready

    return NextResponse.json({
      submissions: [],
      total: 0
    });

  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
} 