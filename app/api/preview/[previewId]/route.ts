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

    // Check if preview exists
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'previews');
    const metadataPath = path.join(uploadsDir, `${previewId}.json`);

    try {
      await fs.access(metadataPath);
    } catch (error) {
      return NextResponse.json(
        { error: 'Preview not found' },
        { status: 404 }
      );
    }

    // Read and return preview metadata
    const metadataContent = await fs.readFile(metadataPath, 'utf-8');
    const previewData = JSON.parse(metadataContent);

    return NextResponse.json(previewData);

  } catch (error) {
    console.error('Error fetching preview:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 