import { NextRequest, NextResponse } from 'next/server';
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
    
    // Generate HTML preview instead of canvas image
    const htmlContent = await generateHTMLPreview(config);
    
    // Save preview data to file system (in production, you'd use cloud storage)
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'previews');
    await fs.mkdir(uploadsDir, { recursive: true });
    
    const filename = `${previewId}.html`;
    const filepath = path.join(uploadsDir, filename);
    await fs.writeFile(filepath, htmlContent);
    
    // Create response with preview data
    const preview = {
      previewId,
      htmlUrl: `/uploads/previews/${filename}`,
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
      { error: 'Failed to generate preview' },
      { status: 500 }
    );
  }
}

async function generateHTMLPreview(config: PlaqueConfiguration): Promise<string> {
  // Get positions for the selected plaque type
  const positions = CARD_POSITIONS[config.plaqueType];
  
  // Get layout adjustments
  const adjustments = config.layoutAdjustments || {};
  const cardSizeAdjustment = adjustments.cardSizeAdjustment || 100;
  const cardSpacingAdjustment = adjustments.cardSpacingAdjustment || 100;
  const horizontalOffset = adjustments.horizontalOffset || 0;
  const verticalOffset = adjustments.verticalOffset || 0;

  // Determine background style
  let backgroundStyle = '';
  if (config.plaqueStyle === 'blank') {
    backgroundStyle = 'background-color: #f5f5f5;';
  } else {
    let plaqueFileName = 'DarkMapleWood1.png';
    if (config.plaqueStyle === 'clear-plaque') {
      plaqueFileName = 'ClearPlaque8.png';
    } else if (config.plaqueStyle === 'black-marble') {
      plaqueFileName = 'BlackMarble8.png';
    }
    backgroundStyle = `background-image: url('/images/${plaqueFileName}'); background-size: cover; background-position: center;`;
  }

  // Generate card HTML
  let cardsHTML = '';
  for (let i = 0; i < config.playerCards.length && i < positions.positions.length; i++) {
    const card = config.playerCards[i];
    const position = positions.positions[i];
    
    // Calculate spacing adjustments based on position
    let spacingX = 0;
    let spacingY = 0;
    
    // Calculate spacing based on plaque type (same logic as before)
    if (config.plaqueType === '4') {
      spacingX = i * (cardSpacingAdjustment - 100) * 2.5;
    } else if (config.plaqueType === '5') {
      if (i < 3) {
        spacingX = i * (cardSpacingAdjustment - 100) * 2.5;
      } else {
        spacingX = (i - 3) * (cardSpacingAdjustment - 100) * 2.5 + (cardSpacingAdjustment - 100) * 1.25;
        spacingY = (cardSpacingAdjustment - 100) * 3;
      }
    } else if (config.plaqueType === '6') {
      const row = Math.floor(i / 3);
      const col = i % 3;
      spacingX = col * (cardSpacingAdjustment - 100) * 2.5;
      spacingY = row * (cardSpacingAdjustment - 100) * 3;
    } else if (config.plaqueType === '7') {
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
      const row = Math.floor(i / 4);
      const col = i % 4;
      spacingX = col * (cardSpacingAdjustment - 100) * 2.3;
      spacingY = row * (cardSpacingAdjustment - 100) * 3.8;
    } else if (config.plaqueType === '9') {
      const row = Math.floor(i / 3);
      const col = i % 3;
      spacingX = col * (cardSpacingAdjustment - 100) * 2.1;
      spacingY = row * (cardSpacingAdjustment - 100) * 2.4;
    } else if (config.plaqueType === '10') {
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
    
    const cardPadding = 4;
    
    // Generate card content
    let cardContent = '';
    if (config.showCardBacks) {
      // Card back design
      cardContent = `
        <div class="card-back">
          <div class="card-back-border"></div>
          <div class="card-back-logo">
            <div>ROSTER</div>
            <div>FRAME</div>
          </div>
          <div class="card-back-stats">
            <div class="player-name">${card.playerName.toUpperCase()}</div>
            <div class="stats-details">
              <div>${card.year} ${card.brand}</div>
              <div>${card.series}</div>
              <div>Position: ${card.position}</div>
            </div>
            <div class="rarity-badge">${card.rarity.toUpperCase()}</div>
          </div>
        </div>
      `;
    } else if (card.imageUrl && card.imageUrl.trim()) {
      // Card with image
      cardContent = `
        <img src="${card.imageUrl}" alt="${card.playerName}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="rarity-indicator rarity-${card.rarity}"></div>
      `;
    } else {
      // Placeholder card
      cardContent = `
        <div class="placeholder-card">
          <div class="player-name">${card.playerName}</div>
          <div class="card-info">${card.year} ${card.brand}</div>
          <div class="card-series">${card.series}</div>
          <div class="card-price">$${card.price.toFixed(2)}</div>
        </div>
        <div class="rarity-indicator rarity-${card.rarity}"></div>
      `;
    }
    
    cardsHTML += `
      <div class="card" style="
        position: absolute;
        left: ${adjustedX + cardPadding}px;
        top: ${adjustedY + cardPadding}px;
        width: ${adjustedWidth - (cardPadding * 2)}px;
        height: ${adjustedHeight - (cardPadding * 2)}px;
        border: 1px solid #cccccc;
        box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.4);
        overflow: hidden;
        background: white;
      ">
        ${cardContent}
      </div>
    `;
  }

  // Add team name overlay
  let teamNameHTML = '';
  if (config.plaqueStyle !== 'blank') {
    const nameplateY = positions.imageHeight - 90;
    teamNameHTML = `
      <div style="
        position: absolute;
        left: 0;
        top: ${nameplateY}px;
        width: 100%;
        text-align: center;
        font-family: Arial, sans-serif;
        font-size: 30px;
        font-weight: bold;
        color: #000000;
        text-transform: uppercase;
      ">
        ${config.teamName}
      </div>
    `;
  }

  // Generate complete HTML
  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Roster Frame Preview - ${config.teamName}</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background-color: #f0f0f0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
    }
    
    .preview-container {
      position: relative;
      width: ${positions.imageWidth}px;
      height: ${positions.imageHeight}px;
      ${backgroundStyle}
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .card {
      position: relative;
    }
    
    .placeholder-card {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      background: linear-gradient(to bottom, #f3f4f6, #e5e7eb);
      padding: 20px;
      box-sizing: border-box;
    }
    
    .placeholder-card .player-name {
      font-size: 24px;
      font-weight: bold;
      color: #374151;
      margin-bottom: 10px;
    }
    
    .placeholder-card .card-info {
      font-size: 18px;
      color: #374151;
      margin-bottom: 10px;
    }
    
    .placeholder-card .card-series {
      font-size: 14px;
      color: #6b7280;
      margin-bottom: 10px;
    }
    
    .placeholder-card .card-price {
      font-size: 20px;
      font-weight: bold;
      color: #059669;
    }
    
    .card-back {
      width: 100%;
      height: 100%;
      background: linear-gradient(to bottom, #1a1a2e, #16213e);
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      align-items: center;
      padding: 20px;
      box-sizing: border-box;
    }
    
    .card-back-border {
      position: absolute;
      top: 5px;
      left: 5px;
      right: 5px;
      bottom: 5px;
      border: 3px solid #eab308;
      pointer-events: none;
    }
    
    .card-back-logo {
      margin-top: 30%;
      color: #eab308;
      font-weight: bold;
      font-size: 24px;
      text-align: center;
      line-height: 1.2;
    }
    
    .card-back-stats {
      background: rgba(255, 255, 255, 0.1);
      padding: 15px;
      width: 80%;
      text-align: center;
      color: white;
    }
    
    .card-back-stats .player-name {
      font-weight: bold;
      font-size: 16px;
      margin-bottom: 10px;
    }
    
    .card-back-stats .stats-details {
      font-size: 12px;
      line-height: 1.6;
    }
    
    .card-back-stats .rarity-badge {
      margin-top: 10px;
      font-weight: bold;
      font-size: 12px;
    }
    
    .rarity-indicator {
      position: absolute;
      top: 15px;
      right: 15px;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      border: 2px solid white;
    }
    
    .rarity-common {
      background-color: #6b7280;
    }
    
    .rarity-rare {
      background-color: #a855f7;
    }
    
    .rarity-legendary {
      background-color: #fbbf24;
    }
    
    .rarity-badge {
      color: #fbbf24;
    }
    
    .card-back-stats .rarity-badge {
      color: ${config.playerCards[0]?.rarity === 'legendary' ? '#fbbf24' : 
              config.playerCards[0]?.rarity === 'rare' ? '#a855f7' : '#6b7280'};
    }
  </style>
</head>
<body>
  <div class="preview-container">
    ${cardsHTML}
    ${teamNameHTML}
  </div>
</body>
</html>
  `;

  return html;
} 