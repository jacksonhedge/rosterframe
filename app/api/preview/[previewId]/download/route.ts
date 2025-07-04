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
    
    const teamName = preview.configuration.teamName.toLowerCase().replace(/\s+/g, '-');
    const fileName = `roster-frame-${teamName}.html`;
    
    // Return HTML file with download headers
    return new NextResponse(preview.htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Cache-Control': 'no-cache',
      },
    });
    
  } catch (error) {
    console.error('Error downloading preview:', error);
    return NextResponse.json(
      { error: 'Failed to download preview' },
      { status: 500 }
    );
  }
}