// Direct web scraping service for roster-frame
// This provides similar functionality to MCP fetch server but integrated directly

interface ScraperOptions {
  maxLength?: number;
  timeout?: number;
  headers?: Record<string, string>;
}

export class ScraperService {
  private static defaultHeaders = {
    'User-Agent': 'RosterFrame/1.0 (Fantasy Sports Card Collector)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    'Accept-Language': 'en-US,en;q=0.5',
    'Accept-Encoding': 'gzip, deflate',
    'Connection': 'keep-alive',
  };

  /**
   * Fetch and convert web content to structured data
   */
  static async fetchWebContent(url: string, options: ScraperOptions = {}) {
    const { maxLength = 50000, timeout = 10000, headers = {} } = options;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        headers: { ...this.defaultHeaders, ...headers },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      let html = await response.text();
      
      // Truncate if needed
      if (html.length > maxLength) {
        html = html.substring(0, maxLength);
      }

      return {
        url,
        html,
        status: response.status,
        contentType: response.headers.get('content-type'),
      };
    } catch (error) {
      console.error('Scraping error:', error);
      throw error;
    }
  }

  /**
   * Convert HTML to markdown-like format (simplified)
   */
  static htmlToMarkdown(html: string): string {
    // Remove script and style elements
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    html = html.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');
    
    // Convert common elements
    html = html.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    html = html.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    html = html.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    html = html.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    html = html.replace(/<a[^>]+href="([^"]+)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');
    html = html.replace(/<img[^>]+src="([^"]+)"[^>]*>/gi, '![Image]($1)');
    html = html.replace(/<br[^>]*>/gi, '\n');
    
    // Remove remaining HTML tags
    html = html.replace(/<[^>]+>/g, '');
    
    // Clean up whitespace
    html = html.replace(/\n\s*\n\s*\n/g, '\n\n');
    html = html.trim();
    
    return html;
  }

  /**
   * Extract structured data from HTML
   */
  static extractData(html: string, selectors: Record<string, string>): Record<string, string[]> {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const results: Record<string, string[]> = {};

    for (const [key, selector] of Object.entries(selectors)) {
      const elements = doc.querySelectorAll(selector);
      results[key] = Array.from(elements).map(el => el.textContent?.trim() || '');
    }

    return results;
  }

  /**
   * Scrape card marketplace data
   */
  static async scrapeCardListings(searchQuery: string, marketplace: 'ebay' | 'comc' | 'tcgplayer') {
    const marketplaceConfigs = {
      ebay: {
        searchUrl: (query: string) => `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}&_sacat=0`,
        selectors: {
          titles: 'h3.s-item__title',
          prices: 'span.s-item__price',
          links: 'a.s-item__link',
          images: 'img.s-item__image-img'
        }
      },
      comc: {
        searchUrl: (query: string) => `https://www.comc.com/Cards/Baseball,sn,${encodeURIComponent(query)}`,
        selectors: {
          titles: '.product-title',
          prices: '.price',
          links: 'a.product-link',
          images: 'img.product-image'
        }
      },
      tcgplayer: {
        searchUrl: (query: string) => `https://www.tcgplayer.com/search/all/product?q=${encodeURIComponent(query)}`,
        selectors: {
          titles: '.search-result__title',
          prices: '.search-result__price',
          links: 'a.search-result__link',
          images: 'img.search-result__image'
        }
      }
    };

    const config = marketplaceConfigs[marketplace];
    if (!config) throw new Error(`Unknown marketplace: ${marketplace}`);

    try {
      const { html } = await this.fetchWebContent(config.searchUrl(searchQuery));
      const data = this.extractData(html, config.selectors);
      
      // Combine extracted data into structured listings
      const listings = [];
      const maxItems = Math.min(
        data.titles?.length || 0,
        data.prices?.length || 0,
        data.links?.length || 0
      );

      for (let i = 0; i < maxItems; i++) {
        listings.push({
          title: data.titles?.[i] || '',
          price: data.prices?.[i] || '',
          link: data.links?.[i] || '',
          image: data.images?.[i] || '',
          marketplace
        });
      }

      return listings;
    } catch (error) {
      console.error(`Failed to scrape ${marketplace}:`, error);
      return [];
    }
  }

  /**
   * Scrape single card details
   */
  static async scrapeCardDetails(url: string) {
    try {
      const { html } = await this.fetchWebContent(url);
      
      // Extract common card details
      const selectors = {
        title: 'h1, .item-title, .product-title',
        price: '.price, .item-price, span[itemprop="price"]',
        description: '.item-description, .product-description, div[itemprop="description"]',
        images: 'img.main-image, img[itemprop="image"], .gallery-image img',
        condition: '.item-condition, .condition-label',
        seller: '.seller-name, .seller-info'
      };

      const data = this.extractData(html, selectors);
      
      return {
        title: data.title?.[0] || '',
        price: data.price?.[0] || '',
        description: data.description?.[0] || '',
        images: data.images || [],
        condition: data.condition?.[0] || '',
        seller: data.seller?.[0] || '',
        url
      };
    } catch (error) {
      console.error('Failed to scrape card details:', error);
      return null;
    }
  }

  /**
   * Check if URL is allowed by robots.txt
   */
  static async checkRobotsTxt(url: string): Promise<boolean> {
    try {
      const urlObj = new URL(url);
      const robotsUrl = `${urlObj.protocol}//${urlObj.host}/robots.txt`;
      
      const { html: robotsTxt } = await this.fetchWebContent(robotsUrl);
      
      // Simple robots.txt parser (basic implementation)
      const lines = robotsTxt.split('\n');
      let userAgentMatch = false;
      let disallowed = false;

      for (const line of lines) {
        const trimmed = line.trim().toLowerCase();
        
        if (trimmed.startsWith('user-agent:')) {
          userAgentMatch = trimmed.includes('*') || trimmed.includes('rosterframe');
        }
        
        if (userAgentMatch && trimmed.startsWith('disallow:')) {
          const path = trimmed.replace('disallow:', '').trim();
          if (path === '/' || urlObj.pathname.startsWith(path)) {
            disallowed = true;
            break;
          }
        }
      }

      return !disallowed;
    } catch (error) {
      // If robots.txt doesn't exist or can't be fetched, assume allowed
      return true;
    }
  }
}

// Export convenience functions
export async function scrapeCardListings(query: string, marketplace: 'ebay' | 'comc' | 'tcgplayer' = 'ebay') {
  return ScraperService.scrapeCardListings(query, marketplace);
}

export async function scrapeCardDetails(url: string) {
  return ScraperService.scrapeCardDetails(url);
}