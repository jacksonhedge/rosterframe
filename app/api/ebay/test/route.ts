import { NextRequest, NextResponse } from 'next/server';
import { ebayAPI } from '../../../lib/ebay-api';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || 'Tom Brady';

    console.log('🔍 Testing eBay API with query:', query);

    // 1. Test connection first
    const connectionTest = await ebayAPI.testConnection();
    console.log('📡 eBay Connection Test:', connectionTest);

    if (!connectionTest.success) {
      return NextResponse.json({
        error: 'eBay API connection failed',
        details: connectionTest.message,
      }, { status: 500 });
    }

    // 2. Try to search for cards
    console.log('🔍 Searching eBay for:', query);
    const ebayResults = await ebayAPI.searchCards({
      keywords: query,
      limit: 10,
    });

    console.log('📊 eBay Results:', {
      totalItems: ebayResults.totalItems,
      itemsReturned: ebayResults.items.length,
      firstFewTitles: ebayResults.items.slice(0, 3).map(item => item.title),
    });

    // 3. Test quality filters
    const qualityFilteredItems = ebayResults.items.filter(card => {
      const hasImages = card.imageUrls && card.imageUrls.length > 0;
      const priceOk = card.currentPrice >= 5 && card.currentPrice <= 500;
      const feedbackOk = card.seller.feedbackPercentage >= 95;
      const feedbackScoreOk = card.seller.feedbackScore >= 100;
      
      const badConditions = ['poor', 'damaged', 'heavily played'];
      const conditionOk = !badConditions.some(condition => 
        card.condition?.toLowerCase().includes(condition)
      );

      return hasImages && priceOk && feedbackOk && feedbackScoreOk && conditionOk;
    });

    console.log('🏆 Quality Filtered Results:', qualityFilteredItems.length);

    return NextResponse.json({
      success: true,
      connectionTest,
      rawResults: {
        totalItems: ebayResults.totalItems,
        itemsFound: ebayResults.items.length,
        items: ebayResults.items.map(item => ({
          title: item.title,
          price: item.currentPrice,
          condition: item.condition,
          seller: {
            username: item.seller.username,
            feedbackScore: item.seller.feedbackScore,
            feedbackPercentage: item.seller.feedbackPercentage,
          },
          hasImages: item.imageUrls && item.imageUrls.length > 0,
          qualityCheck: {
            hasImages: item.imageUrls && item.imageUrls.length > 0,
            priceOk: item.currentPrice >= 5 && item.currentPrice <= 500,
            feedbackOk: item.seller.feedbackPercentage >= 95,
            feedbackScoreOk: item.seller.feedbackScore >= 100,
          }
        })),
      },
      qualityFiltered: {
        count: qualityFilteredItems.length,
        items: qualityFilteredItems.slice(0, 3).map(item => ({
          title: item.title,
          price: item.currentPrice,
          ourPrice: ebayAPI.calculateOurPrice(item.currentPrice),
        })),
      },
    });

  } catch (error) {
    console.error('❌ eBay Test Error:', error);
    return NextResponse.json({
      error: 'eBay test failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 });
  }
} 