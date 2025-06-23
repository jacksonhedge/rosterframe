import { NextRequest, NextResponse } from 'next/server';
import { getPreview } from '../../generate/route';

export async function GET(
  request: NextRequest,
  { params }: { params: { previewId: string } }
) {
  try {
    const preview = getPreview(params.previewId);
    
    if (!preview) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Return HTML content
    return new NextResponse(preview.htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error fetching preview:', error);
    return NextResponse.json(
      { error: 'Failed to fetch preview' },
      { status: 500 }
    );
  }
}