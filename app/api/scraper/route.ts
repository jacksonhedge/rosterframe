import { NextRequest, NextResponse } from 'next/server';
import { scrapeCardListings, scrapeCardDetails, ScraperService } from '@/app/lib/scraper-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    // Rate limiting check (simple implementation)
    const clientIp = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitKey = `scraper:${clientIp}:${Date.now()}`;
    
    // TODO: Implement proper rate limiting with Redis/memory cache
    
    switch (action) {
      case 'searchCards': {
        const { query, marketplace = 'ebay' } = params;
        
        if (!query) {
          return NextResponse.json(
            { error: 'Search query is required' },
            { status: 400 }
          );
        }

        // Check robots.txt compliance
        const marketplaceUrls = {
          ebay: 'https://www.ebay.com',
          comc: 'https://www.comc.com',
          tcgplayer: 'https://www.tcgplayer.com'
        };

        const isAllowed = await ScraperService.checkRobotsTxt(marketplaceUrls[marketplace as keyof typeof marketplaceUrls]);
        
        if (!isAllowed) {
          return NextResponse.json(
            { error: 'Scraping not allowed by robots.txt' },
            { status: 403 }
          );
        }

        const listings = await scrapeCardListings(query, marketplace);
        
        return NextResponse.json({
          success: true,
          data: listings,
          count: listings.length,
          marketplace
        });
      }

      case 'getCardDetails': {
        const { url } = params;
        
        if (!url) {
          return NextResponse.json(
            { error: 'Card URL is required' },
            { status: 400 }
          );
        }

        const details = await scrapeCardDetails(url);
        
        return NextResponse.json({
          success: true,
          data: details
        });
      }

      case 'convertToMarkdown': {
        const { html } = params;
        
        if (!html) {
          return NextResponse.json(
            { error: 'HTML content is required' },
            { status: 400 }
          );
        }

        const markdown = ScraperService.htmlToMarkdown(html);
        
        return NextResponse.json({
          success: true,
          data: markdown
        });
      }

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Scraper API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process scraping request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'Scraper API is running',
    endpoints: {
      searchCards: {
        method: 'POST',
        params: {
          action: 'searchCards',
          query: 'search query',
          marketplace: 'ebay | comc | tcgplayer (optional, default: ebay)'
        }
      },
      getCardDetails: {
        method: 'POST',
        params: {
          action: 'getCardDetails',
          url: 'card listing URL'
        }
      },
      convertToMarkdown: {
        method: 'POST',
        params: {
          action: 'convertToMarkdown',
          html: 'HTML content to convert'
        }
      }
    }
  });
}