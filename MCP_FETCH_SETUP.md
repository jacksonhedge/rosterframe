# MCP Fetch Server Integration Guide

## Overview
The MCP (Model Context Protocol) Fetch Server enables web scraping capabilities for your roster-frame project, allowing you to fetch sports card data, prices, and other web content.

## Installation

### Option 1: Using UV (Recommended)
```bash
# Install uv if you haven't already
curl -LsSf https://astral.sh/uv/install.sh | sh

# Install the MCP fetch server
uvx mcp-server-fetch
```

### Option 2: Using pip
```bash
pip install mcp-server-fetch
python -m mcp_server_fetch
```

### Option 3: Using Docker
```bash
docker run -it --rm mcp/fetch-server
```

## Configuration

### For Claude Desktop App
Add to your Claude configuration file (`~/Library/Application Support/Claude/claude_desktop_config.json` on Mac):

```json
{
  "mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

### For VS Code with Continue Extension
Add to your VS Code settings:

```json
{
  "continue.mcpServers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"]
    }
  }
}
```

## Integration with Roster Frame

### 1. Create MCP Configuration File
Create `mcp-config.json` in your project root:

```json
{
  "servers": {
    "fetch": {
      "command": "uvx",
      "args": ["mcp-server-fetch"],
      "env": {
        "USER_AGENT": "RosterFrame/1.0 (Fantasy Sports Card Scraper)",
        "RESPECT_ROBOTS_TXT": "true"
      }
    }
  }
}
```

### 2. Create Web Scraping Service
Create `/app/lib/web-scraper.ts`:

```typescript
import { execSync } from 'child_process';

interface FetchOptions {
  url: string;
  maxLength?: number;
  startIndex?: number;
  raw?: boolean;
}

export class WebScraper {
  private static async fetchWithMCP(options: FetchOptions): Promise<string> {
    const command = `uvx mcp-server-fetch fetch --url "${options.url}"`;
    
    try {
      const result = execSync(command, { 
        encoding: 'utf8',
        maxBuffer: 1024 * 1024 * 10 // 10MB buffer
      });
      return result;
    } catch (error) {
      console.error('MCP Fetch error:', error);
      throw error;
    }
  }

  // Scrape sports card data from various sources
  static async scrapeCardData(playerName: string, cardYear: string) {
    const sources = [
      {
        name: 'eBay',
        url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(playerName)}+${cardYear}+card`,
        parser: this.parseEbayResults
      },
      {
        name: 'COMC',
        url: `https://www.comc.com/Cards/Baseball,sn,${encodeURIComponent(playerName)}`,
        parser: this.parseCOMCResults
      }
    ];

    const results = await Promise.all(
      sources.map(async (source) => {
        try {
          const content = await this.fetchWithMCP({ url: source.url });
          return source.parser(content);
        } catch (error) {
          console.error(`Failed to scrape ${source.name}:`, error);
          return null;
        }
      })
    );

    return results.filter(Boolean);
  }

  // Parse eBay results from markdown
  private static parseEbayResults(markdown: string) {
    // Extract card listings from markdown
    const listings = [];
    const regex = /\[([^\]]+)\]\(([^)]+)\).*?\$([0-9.]+)/g;
    let match;

    while ((match = regex.exec(markdown)) !== null) {
      listings.push({
        title: match[1],
        url: match[2],
        price: parseFloat(match[3])
      });
    }

    return { source: 'eBay', listings };
  }

  // Parse COMC results
  private static parseCOMCResults(markdown: string) {
    // Similar parsing logic for COMC
    return { source: 'COMC', listings: [] };
  }

  // Scrape card images
  static async scrapeCardImage(cardUrl: string): Promise<string | null> {
    try {
      const content = await this.fetchWithMCP({ url: cardUrl, raw: true });
      // Extract image URL from the content
      const imageMatch = content.match(/https?:\/\/[^"'\s]+\.(jpg|jpeg|png|webp)/i);
      return imageMatch ? imageMatch[0] : null;
    } catch (error) {
      console.error('Failed to scrape card image:', error);
      return null;
    }
  }
}
```

### 3. Create API Endpoint for Web Scraping
Create `/app/api/scrape/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { WebScraper } from '@/app/lib/web-scraper';

export async function POST(request: NextRequest) {
  try {
    const { playerName, cardYear, action } = await request.json();

    if (!playerName || !action) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    let result;

    switch (action) {
      case 'scrapeCards':
        result = await WebScraper.scrapeCardData(playerName, cardYear);
        break;
      
      case 'scrapeImage':
        const { cardUrl } = await request.json();
        result = await WebScraper.scrapeCardImage(cardUrl);
        break;
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Scraping error:', error);
    return NextResponse.json(
      { error: 'Failed to scrape data' },
      { status: 500 }
    );
  }
}
```

### 4. Create React Hook for Web Scraping
Create `/app/hooks/useWebScraper.ts`:

```typescript
import { useState } from 'react';

interface ScrapedCard {
  title: string;
  url: string;
  price: number;
  image?: string;
}

export function useWebScraper() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scrapeCards = async (playerName: string, cardYear?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrapeCards',
          playerName,
          cardYear
        })
      });

      if (!response.ok) throw new Error('Scraping failed');
      
      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const scrapeCardImage = async (cardUrl: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'scrapeImage',
          cardUrl
        })
      });

      if (!response.ok) throw new Error('Image scraping failed');
      
      const { data } = await response.json();
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    scrapeCards,
    scrapeCardImage,
    loading,
    error
  };
}
```

### 5. Example Usage in Component
Update your `PlayerSearch.tsx` to include web scraping:

```typescript
import { useWebScraper } from '@/app/hooks/useWebScraper';

export function PlayerSearch() {
  const { scrapeCards, loading, error } = useWebScraper();

  const handleSearch = async (playerName: string) => {
    // First search your database
    const dbResults = await searchDatabase(playerName);

    // Then scrape web for additional results
    const webResults = await scrapeCards(playerName, '2023');

    // Combine and display results
    setResults([...dbResults, ...webResults]);
  };

  // ... rest of component
}
```

## Security Considerations

1. **Rate Limiting**: Implement rate limiting to avoid overwhelming target sites
2. **Robots.txt**: Always respect robots.txt files
3. **User Agent**: Use a descriptive user agent
4. **Caching**: Cache scraped data to reduce requests
5. **Error Handling**: Gracefully handle scraping failures

## Environment Variables
Add to your `.env.local`:

```env
# MCP Configuration
MCP_USER_AGENT="RosterFrame/1.0 (Fantasy Sports Card Scraper)"
MCP_RESPECT_ROBOTS=true
MCP_PROXY_URL= # Optional proxy URL
```

## Testing the Integration

1. Start the MCP server:
```bash
uvx mcp-server-fetch
```

2. Test scraping in your app:
```typescript
// In a test file or component
const results = await scrapeCards('Mike Trout', '2023');
console.log('Scraped cards:', results);
```

## Troubleshooting

### Common Issues:
1. **MCP server not found**: Ensure uv/pip installation completed
2. **Permission denied**: Check file permissions for MCP executable
3. **Timeout errors**: Increase buffer size or implement pagination
4. **Empty results**: Check if site structure changed or is blocking requests

### Debug Mode:
```bash
# Run MCP server in debug mode
MCP_DEBUG=true uvx mcp-server-fetch
```

## Next Steps

1. Implement caching layer for scraped data
2. Add more card marketplace sources
3. Create scheduled scraping jobs
4. Build price tracking features
5. Add image optimization for scraped card images

---

This integration allows your roster-frame project to dynamically fetch card data and prices from various sources, enhancing your marketplace and card collection features.