import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: { previewId: string } }
) {
  try {
    const { previewId } = params;

    // Validate preview ID format (should be UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(previewId)) {
      return NextResponse.json(
        { error: 'Invalid preview ID format' },
        { status: 400 }
      );
    }

    // Check if preview files exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'previews');
    const imagePath = path.join(uploadsDir, `${previewId}.png`);
    const metadataPath = path.join(uploadsDir, `${previewId}.json`);

    try {
      await fs.access(imagePath);
      await fs.access(metadataPath);
    } catch (error) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Read metadata to get team name for filename
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const previewData = JSON.parse(metadataContent);
    const teamName = previewData.configuration.teamName || 'Team';
    
    // Create safe filename
    const safeTeamName = teamName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeTeamName}_plaque_preview.png`;

    // Read image file
    const imageBuffer = await fs.readFile(imagePath);

    // Return image with download headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': imageBuffer.length.toString(),
        'Cache-Control': 'public, max-age=31536000', // Cache for 1 year
      },
    });

  } catch (error) {
    console.error('Error downloading preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 