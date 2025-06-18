import { NextRequest, NextResponse } from 'next/server';
import { CollectionService } from '@/app/lib/collection-service';

const collectionService = CollectionService.getInstance();

export async function POST(request: NextRequest) {
  try {
    const { min_roster_percentage = 20, create_targets = false } = await request.json();

    // Analyze rostered players
    const analyses = await collectionService.analyzeRosteredPlayers();
    
    // Filter by minimum roster percentage
    const filteredAnalyses = analyses.filter(p => p.roster_percentage >= min_roster_percentage);

    // If requested, create target players from the analysis
    let targetPlayers = [];
    if (create_targets) {
      targetPlayers = await collectionService.createTargetPlayersFromRoster(min_roster_percentage);
    }

    return NextResponse.json({
      success: true,
      data: {
        total_players_analyzed: analyses.length,
        players_meeting_criteria: filteredAnalyses.length,
        roster_analysis: filteredAnalyses,
        target_players_created: targetPlayers.length,
        target_players: create_targets ? targetPlayers : null
      }
    });

  } catch (error) {
    console.error('Error analyzing roster:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to analyze roster',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Just return the analysis without creating targets
    const analyses = await collectionService.analyzeRosteredPlayers();
    
    return NextResponse.json({
      success: true,
      data: {
        total_players: analyses.length,
        roster_analysis: analyses
      }
    });

  } catch (error) {
    console.error('Error getting roster analysis:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get roster analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 