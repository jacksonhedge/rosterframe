import { NextRequest, NextResponse } from 'next/server';
import { createCanvas, loadImage, Canvas, Image } from 'canvas';
import fs from 'fs/promises';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Types from our preview maker service
interface PlayerCardData {
  id: string;
  playerName: string;
  position: string;
  year: number;
  brand: string;
  series: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'legendary';
  price: number;
  shipping?: number;
}

interface PlaqueConfiguration {
  plaqueType: '4' | '5' | '6' | '7' | '8' | '9' | '10';
  plaqueStyle: string;
  teamName: string;
  playerCards: PlayerCardData[];
  customerEmail?: string;
  layoutAdjustments?: {
    cardSizeAdjustment?: number;
    cardSpacingAdjustment?: number;
    horizontalOffset?: number;
    verticalOffset?: number;
  };
  showCardBacks?: boolean;
}

// Card positions for all plaque types - copied from preview-maker.ts
const CARD_POSITIONS = {
  '4': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 150, y: 300, width: 220, height: 308 },
      { x: 400, y: 300, width: 220, height: 308 },
      { x: 650, y: 300, width: 220, height: 308 },
      { x: 900, y: 300, width: 220, height: 308 },
    ]
  },
  '5': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 250, y: 180, width: 200, height: 280 },
      { x: 500, y: 180, width: 200, height: 280 },
      { x: 750, y: 180, width: 200, height: 280 },
      { x: 375, y: 480, width: 200, height: 280 },
      { x: 625, y: 480, width: 200, height: 280 },
    ]
  },
  '6': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 250, y: 200, width: 180, height: 252 },
      { x: 500, y: 200, width: 180, height: 252 },
      { x: 750, y: 200, width: 180, height: 252 },
      { x: 250, y: 500, width: 180, height: 252 },
      { x: 500, y: 500, width: 180, height: 252 },
      { x: 750, y: 500, width: 180, height: 252 },
    ]
  },
  '7': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 300, y: 120, width: 160, height: 224 },
      { x: 520, y: 120, width: 160, height: 224 },
      { x: 740, y: 120, width: 160, height: 224 },
      { x: 300, y: 370, width: 160, height: 224 },
      { x: 520, y: 370, width: 160, height: 224 },
      { x: 740, y: 370, width: 160, height: 224 },
      { x: 520, y: 620, width: 160, height: 224 },
    ]
  },
  '8': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 180, y: 135, width: 240, height: 336 },
      { x: 440, y: 135, width: 240, height: 336 },
      { x: 700, y: 135, width: 240, height: 336 },
      { x: 960, y: 135, width: 240, height: 336 },
      { x: 180, y: 513, width: 240, height: 336 },
      { x: 440, y: 513, width: 240, height: 336 },
      { x: 700, y: 513, width: 240, height: 336 },
      { x: 960, y: 513, width: 240, height: 336 },
    ]
  },
  '9': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 270, y: 90, width: 150, height: 210 },
      { x: 480, y: 90, width: 150, height: 210 },
      { x: 690, y: 90, width: 150, height: 210 },
      { x: 270, y: 330, width: 150, height: 210 },
      { x: 480, y: 330, width: 150, height: 210 },
      { x: 690, y: 330, width: 150, height: 210 },
      { x: 270, y: 570, width: 150, height: 210 },
      { x: 480, y: 570, width: 150, height: 210 },
      { x: 690, y: 570, width: 150, height: 210 },
    ]
  },
  '10': {
    imageWidth: 1200,
    imageHeight: 900,
    positions: [
      { x: 120, y: 200, width: 140, height: 196 },
      { x: 300, y: 200, width: 140, height: 196 },
      { x: 480, y: 200, width: 140, height: 196 },
      { x: 660, y: 200, width: 140, height: 196 },
      { x: 840, y: 200, width: 140, height: 196 },
      { x: 120, y: 450, width: 140, height: 196 },
      { x: 300, y: 450, width: 140, height: 196 },
      { x: 480, y: 450, width: 140, height: 196 },
      { x: 660, y: 450, width: 140, height: 196 },
      { x: 840, y: 450, width: 140, height: 196 },
    ]
  }
};

export async function POST(request: NextRequest) {
  try {
    const config: PlaqueConfiguration = await request.json();
    
    // Validate configuration
    if (!config.plaqueType || !config.teamName || !config.playerCards) {
      return NextResponse.json(
        { error: 'Missing required configuration fields' },
        { status: 400 }
      );
    }

    // Validate plaque type
    if (!['4', '5', '6', '7', '8', '9', '10'].includes(config.plaqueType)) {
      return NextResponse.json(
        { error: 'Invalid plaque type. Must be between 4 and 10' },
        { status: 400 }
      );
    }

    // Generate unique preview ID
    const previewId = uuidv4();
    
    // Create compiled image
    const compiledImageBuffer = await generateCompiledImage(config);
    
    // Save image to file system (in production, you'd use cloud storage)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'previews');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `${previewId}.png`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, compiledImageBuffer);
    
    // Create response with preview data
    const preview = {
      previewId,
      imageUrl: `/uploads/previews/${filename}`,
      downloadUrl: `/api/preview/${previewId}/download`,
      createdAt: new Date().toISOString(),
      configuration: config,
    };

    // Store metadata (in production, you'd save to database)
    const metadataPath = path.join(uploadsDir, `${previewId}.json`);
    await fs.writeFile(metadataPath, JSON.stringify(preview, null, 2));

    return NextResponse.json(preview);

  } catch (error) {
    console.error('Error generating preview:', error);
    return NextResponse.json(
      { error: 'Failed to generate preview image' },
      { status: 500 }
    );
  }
}

async function generateCompiledImage(config: PlaqueConfiguration): Promise<Buffer> {
  // Get positions for the selected plaque type
  const positions = CARD_POSITIONS[config.plaqueType];
  const canvas = createCanvas(positions.imageWidth, positions.imageHeight);
  const ctx = canvas.getContext('2d');

  try {
    // Handle blank plaque (no background)
    if (config.plaqueStyle === 'blank') {
      // Fill with transparent background
      ctx.clearRect(0, 0, positions.imageWidth, positions.imageHeight);
    } else {
      // Load and draw plaque background
      let plaqueFileName = 'DarkMapleWood1.png';
      if (config.plaqueStyle === 'clear-plaque') {
        plaqueFileName = 'ClearPlaque8.png';
      } else if (config.plaqueStyle === 'black-marble') {
        plaqueFileName = 'BlackMarble8.png';
      }
      
      const plaqueImagePath = path.join(
        process.cwd(), 
        'public', 
        'images', 
        plaqueFileName
      );
      
      const plaqueImage = await loadImage(plaqueImagePath);
      ctx.drawImage(plaqueImage, 0, 0, positions.imageWidth, positions.imageHeight);
    }

    // Get layout adjustments
    const adjustments = config.layoutAdjustments || {};
    const cardSizeAdjustment = adjustments.cardSizeAdjustment || 100;
    const cardSpacingAdjustment = adjustments.cardSpacingAdjustment || 100;
    const horizontalOffset = adjustments.horizontalOffset || 0;
    const verticalOffset = adjustments.verticalOffset || 0;

    // Draw each player card
    for (let i = 0; i < config.playerCards.length && i < positions.positions.length; i++) {
      const card = config.playerCards[i];
      const position = positions.positions[i];
      
      // Calculate spacing adjustments based on position
      let spacingX = 0;
      let spacingY = 0;
      
      // Calculate spacing based on plaque type
      if (config.plaqueType === '4') {
        // Single row
        spacingX = i * (cardSpacingAdjustment - 100) * 2.5;
      } else if (config.plaqueType === '5') {
        // 3-2 layout
        if (i < 3) {
          spacingX = i * (cardSpacingAdjustment - 100) * 2.5;
        } else {
          spacingX = (i - 3) * (cardSpacingAdjustment - 100) * 2.5 + (cardSpacingAdjustment - 100) * 1.25;
          spacingY = (cardSpacingAdjustment - 100) * 3;
        }
      } else if (config.plaqueType === '6') {
        // 3x2 grid
        const row = Math.floor(i / 3);
        const col = i % 3;
        spacingX = col * (cardSpacingAdjustment - 100) * 2.5;
        spacingY = row * (cardSpacingAdjustment - 100) * 3;
      } else if (config.plaqueType === '7') {
        // Pyramid: 3-3-1
        if (i < 3) {
          spacingX = i * (cardSpacingAdjustment - 100) * 2.2;
        } else if (i < 6) {
          spacingX = (i - 3) * (cardSpacingAdjustment - 100) * 2.2;
          spacingY = (cardSpacingAdjustment - 100) * 2.5;
        } else {
          spacingX = (cardSpacingAdjustment - 100) * 2.2;
          spacingY = (cardSpacingAdjustment - 100) * 5;
        }
      } else if (config.plaqueType === '8') {
        // 4x2 grid
        const row = Math.floor(i / 4);
        const col = i % 4;
        spacingX = col * (cardSpacingAdjustment - 100) * 2.3;
        spacingY = row * (cardSpacingAdjustment - 100) * 3.8;
      } else if (config.plaqueType === '9') {
        // 3x3 grid
        const row = Math.floor(i / 3);
        const col = i % 3;
        spacingX = col * (cardSpacingAdjustment - 100) * 2.1;
        spacingY = row * (cardSpacingAdjustment - 100) * 2.4;
      } else if (config.plaqueType === '10') {
        // 5x2 grid
        const row = Math.floor(i / 5);
        const col = i % 5;
        spacingX = col * (cardSpacingAdjustment - 100) * 1.8;
        spacingY = row * (cardSpacingAdjustment - 100) * 2.5;
      }
      
      // Apply all adjustments
      const adjustedX = position.x + spacingX + horizontalOffset;
      const adjustedY = position.y + spacingY + verticalOffset;
      const adjustedWidth = position.width * (cardSizeAdjustment / 100);
      const adjustedHeight = position.height * (cardSizeAdjustment / 100);
      
      try {
        let cardImage: Image;
        
        // Check if we should show card backs
        if (config.showCardBacks) {
          // Generate card back design
          const cardBackCanvas = await generateCardBack(card, adjustedWidth, adjustedHeight);
          cardImage = await loadImage(cardBackCanvas.toDataURL());
        } else if (card.imageUrl && card.imageUrl.trim() && 
            (card.imageUrl.startsWith('http') || 
             card.imageUrl.startsWith('data:image/') || 
             card.imageUrl.startsWith('/uploads/') ||
             card.imageUrl.startsWith('./uploads/'))) {
          // Load external image, data URL (uploaded image), or local upload
          try {
            cardImage = await loadImage(card.imageUrl);
          } catch (loadError) {
            console.warn(`Failed to load image ${card.imageUrl}, using placeholder:`, loadError);
            const placeholderCanvas = await generatePlaceholderCard(card, adjustedWidth, adjustedHeight);
            cardImage = await loadImage(placeholderCanvas.toDataURL());
          }
        } else {
          // Use placeholder or generate card image
          const placeholderCanvas = await generatePlaceholderCard(card, adjustedWidth, adjustedHeight);
          cardImage = await loadImage(placeholderCanvas.toDataURL());
        }
        
        // Draw card with proper scaling and positioning
        ctx.save();
        
        // Add subtle shadow behind the card
        ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
        ctx.shadowBlur = 8;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw card with minimal padding to fit snugly within plaque slot
        const cardPadding = 4;
        ctx.drawImage(
          cardImage,
          adjustedX + cardPadding,
          adjustedY + cardPadding,
          adjustedWidth - (cardPadding * 2),
          adjustedHeight - (cardPadding * 2)
        );
        
        ctx.restore();
        
        // Add subtle card border (using adjusted positions)
        ctx.strokeStyle = '#cccccc';
        ctx.lineWidth = 1;
        ctx.strokeRect(
          adjustedX + cardPadding,
          adjustedY + cardPadding,
          adjustedWidth - (cardPadding * 2),
          adjustedHeight - (cardPadding * 2)
        );
        
        // Add rarity indicator (adjusted for padding)
        const adjustedPosition = {
          x: adjustedX + cardPadding,
          y: adjustedY + cardPadding,
          width: adjustedWidth - (cardPadding * 2),
          height: adjustedHeight - (cardPadding * 2)
        };
        addRarityIndicator(ctx, card.rarity, adjustedPosition);
        
      } catch (cardError) {
        console.warn(`Failed to load card image for ${card.playerName}:`, cardError);
        // Draw placeholder card
        drawPlaceholderCard(ctx, card, position);
      }
    }

    // Add team name overlay (skip for blank plaque)
    if (config.plaqueStyle !== 'blank') {
      addTeamNameOverlay(ctx, config.teamName, positions);
    }

    return canvas.toBuffer('image/png');

  } catch (error) {
    console.error('Error in image generation:', error);
    throw error;
  }
}

async function generatePlaceholderCard(card: PlayerCardData, width: number, height: number): Promise<Canvas> {
  const cardCanvas = createCanvas(width, height);
  const ctx = cardCanvas.getContext('2d');
  
  // Create gradient background
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#f3f4f6');
  gradient.addColorStop(1, '#e5e7eb');
  
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Add border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 3;
  ctx.strokeRect(0, 0, width, height);
  
  // Add text
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  
  // Player name
  ctx.font = 'bold 24px Arial';
  ctx.fillText(card.playerName, width / 2, height / 2 - 40);
  
  // Year and brand
  ctx.font = '18px Arial';
  ctx.fillText(`${card.year} ${card.brand}`, width / 2, height / 2);
  
  // Series
  ctx.font = '14px Arial';
  ctx.fillStyle = '#6b7280';
  ctx.fillText(card.series, width / 2, height / 2 + 30);
  
  // Price
  ctx.font = 'bold 20px Arial';
  ctx.fillStyle = '#059669';
  ctx.fillText(`$${card.price.toFixed(2)}`, width / 2, height / 2 + 60);
  
  return cardCanvas;
}

async function generateCardBack(card: PlayerCardData, width: number, height: number): Promise<Canvas> {
  const cardCanvas = createCanvas(width, height);
  const ctx = cardCanvas.getContext('2d');
  
  // Background gradient
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  gradient.addColorStop(0, '#1a1a2e');
  gradient.addColorStop(1, '#16213e');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
  
  // Border
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = Math.max(3, width * 0.02);
  ctx.strokeRect(
    ctx.lineWidth / 2, 
    ctx.lineWidth / 2, 
    width - ctx.lineWidth, 
    height - ctx.lineWidth
  );
  
  // Center logo/text
  ctx.fillStyle = '#eab308';
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.max(16, width * 0.08)}px Arial`;
  ctx.fillText('ROSTER', width / 2, height / 2 - height * 0.05);
  ctx.fillText('FRAME', width / 2, height / 2 + height * 0.05);
  
  // Stats area
  const statsHeight = height * 0.35;
  const statsY = height - statsHeight - height * 0.05;
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
  ctx.fillRect(width * 0.1, statsY, width * 0.8, statsHeight);
  
  // Player name
  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${Math.max(12, width * 0.05)}px Arial`;
  ctx.fillText(card.playerName.toUpperCase(), width / 2, statsY + statsHeight * 0.15);
  
  // Stats
  ctx.textAlign = 'left';
  ctx.font = `${Math.max(10, width * 0.04)}px Arial`;
  const statsX = width * 0.15;
  const lineHeight = statsHeight * 0.18;
  
  ctx.fillText(`${card.year} ${card.brand}`, statsX, statsY + statsHeight * 0.35);
  ctx.fillText(card.series, statsX, statsY + statsHeight * 0.35 + lineHeight);
  ctx.fillText(`Position: ${card.position}`, statsX, statsY + statsHeight * 0.35 + lineHeight * 2);
  
  // Rarity badge
  const rarityColors = {
    legendary: '#fbbf24',
    rare: '#a855f7',
    common: '#6b7280'
  };
  
  ctx.fillStyle = rarityColors[card.rarity as keyof typeof rarityColors] || rarityColors.common;
  ctx.textAlign = 'center';
  ctx.font = `bold ${Math.max(10, width * 0.04)}px Arial`;
  ctx.fillText(card.rarity.toUpperCase(), width / 2, height - height * 0.03);
  
  return cardCanvas;
}

function drawPlaceholderCard(ctx: any, card: PlayerCardData, position: any) {
  // Draw placeholder rectangle
  ctx.fillStyle = '#f3f4f6';
  ctx.fillRect(position.x, position.y, position.width, position.height);
  
  // Add border
  ctx.strokeStyle = '#d1d5db';
  ctx.lineWidth = 2;
  ctx.strokeRect(position.x, position.y, position.width, position.height);
  
  // Add text
  ctx.fillStyle = '#374151';
  ctx.textAlign = 'center';
  ctx.font = 'bold 16px Arial';
  ctx.fillText(
    card.playerName,
    position.x + position.width / 2,
    position.y + position.height / 2
  );
}

function addRarityIndicator(ctx: any, rarity: string, position: any) {
  const colors = {
    legendary: '#fbbf24', // gold
    rare: '#a855f7',      // purple
    common: '#6b7280'     // gray
  };
  
  const color = colors[rarity as keyof typeof colors] || colors.common;
  
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(position.x + position.width - 15, position.y + 15, 8, 0, Math.PI * 2);
  ctx.fill();
  
  // Add white border
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function addTeamNameOverlay(ctx: any, teamName: string, positions: any) {
  // Position text in the center of the gold nameplate area
  const nameplateY = positions.imageHeight - 90; // Center of gold nameplate
  
  // Add black team name text for gold nameplate background
  ctx.fillStyle = '#000000';  // Black text for gold background
  ctx.textAlign = 'center';
  ctx.font = 'bold 30px Arial';
  
  // Draw clean black text on gold nameplate
  ctx.fillText(
    teamName,
    positions.imageWidth / 2,
    nameplateY
  );
} 