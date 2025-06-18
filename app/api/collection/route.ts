import { NextRequest, NextResponse } from 'next/server';
import { CollectionService } from '@/app/lib/collection-service';

const collectionService = CollectionService.getInstance();

// GET /api/collection - Get target players with optional filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    const filters = {
      collection_status: searchParams.get('collection_status') || undefined,
      priority_level: searchParams.get('priority_level') ? parseInt(searchParams.get('priority_level')!) : undefined,
      position: searchParams.get('position') || undefined,
      min_roster_percentage: searchParams.get('min_roster_percentage') ? 
        parseFloat(searchParams.get('min_roster_percentage')!) : undefined,
      sort_by: searchParams.get('sort_by') || 'roster_percentage',
      sort_order: searchParams.get('sort_order') || 'desc'
    };

    const targetPlayers = await collectionService.getTargetPlayers(filters);
    const stats = await collectionService.getCollectionStats();

    return NextResponse.json({
      success: true,
      data: {
        target_players: targetPlayers,
        stats: stats,
        filters_applied: filters
      }
    });

  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch collection',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// POST /api/collection - Create a new target player
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    // Validate required fields
    const requiredFields = ['sleeper_player_id', 'name', 'position'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    // Set defaults
    const targetPlayerData = {
      sleeper_player_id: data.sleeper_player_id,
      name: data.name,
      position: data.position,
      team: data.team || 'UNKNOWN',
      collection_status: data.collection_status || 'wanted',
      priority_level: data.priority_level || 3,
      target_card_types: data.target_card_types || ['base'],
      max_budget_per_card: data.max_budget_per_card || 25,
      is_rookie: data.is_rookie || false,
      breakout_candidate: data.breakout_candidate || false,
      injury_risk: data.injury_risk || false,
      notes: data.notes || ''
    };

    const newTargetPlayer = await collectionService.createTargetPlayer(targetPlayerData);

    return NextResponse.json({
      success: true,
      data: newTargetPlayer
    });

  } catch (error) {
    console.error('Error creating target player:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to create target player',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/collection - Update a target player
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    if (!data.id) {
      return NextResponse.json(
        { error: 'Missing target player ID' },
        { status: 400 }
      );
    }

    const updatedPlayer = await collectionService.updateCollectionStatus(
      data.id,
      data.collection_status,
      data.priority_level
    );

    return NextResponse.json({
      success: true,
      data: updatedPlayer
    });

  } catch (error) {
    console.error('Error updating target player:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to update target player',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 