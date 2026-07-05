import Parser from 'rss-parser';

const parser = new Parser();

export const CATEGORY_FEEDS: Record<string, string[]> = {
  Geopolitics: [
    'http://feeds.bbci.co.uk/news/world/rss.xml',
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/World.xml',
    'http://rss.cnn.com/rss/edition_world.rss',
    'https://www.theguardian.com/world/rss'
  ],
  'Job & Industry': [
    'http://feeds.bbci.co.uk/news/business/rss.xml',
    'https://techcrunch.com/category/startups/feed/',
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://www.cnbc.com/id/10001147/device/rss/rss.html',
    'https://www.theguardian.com/business/rss'
  ],
  Society: [
    'http://feeds.bbci.co.uk/news/health/rss.xml',
    'http://feeds.bbci.co.uk/news/education/rss.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Science.xml',
    'https://www.theguardian.com/society/rss',
    'http://rss.cnn.com/rss/cnn_health.rss'
  ],
  Entertainment: [
    'http://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
    'https://variety.com/feed/',
    'https://rss.nytimes.com/services/xml/rss/nyt/Arts.xml',
    'http://rss.cnn.com/rss/edition_entertainment.rss',
    'https://www.hollywoodreporter.com/feed/'
  ],
  Sports: [
    'http://feeds.bbci.co.uk/sport/rss.xml',
    'https://sports.yahoo.com/rss/',
    'https://rss.nytimes.com/services/xml/rss/nyt/Sports.xml',
    'https://www.theguardian.com/sport/rss',
    'https://www.skysports.com/rss/12040'
  ]
};

export interface RawArticle {
  title: string;
  summary: string;
  link: string;
  pubDate: string;
  pubDateParsed: number; // ⚡ Bolt: Pre-calculate numeric timestamp for faster sorting
  category: string;
  id: string;
}

// In-memory cache to hold our corpus fetched at 3 AM
export const globalCorpus: Record<string, RawArticle[]> = {
  Geopolitics: [],
  'Job & Industry': [],
  Society: [],
  Entertainment: [],
  Sports: []
};

// Strips basic HTML tags from descriptions
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

let isFetching = false;

export async function fetchAllFeeds() {
  if (isFetching) {
    console.log('[Nexus Fetcher] Fetch already in progress, skipping...');
    return;
  }
  isFetching = true;
  try {
    console.log('[Nexus Fetcher] Starting daily RSS corpus fetch...');

    const fetchPromises = Object.entries(CATEGORY_FEEDS).map(async ([category, urls]) => {
    const feedPromises = urls.map(async url => {
      try {
        console.log(`[Nexus Fetcher] Fetching ${url} for ${category}...`);
        const feed = await parser.parseURL(url);
        const fetchedItems: RawArticle[] = [];
        
        feed.items.forEach(item => {
          if (item.title && (item.contentSnippet || item.content)) {
            const pubDateStr = item.pubDate || new Date().toISOString();
            fetchedItems.push({
              id: item.guid || item.link || Math.random().toString(36),
              category,
              title: item.title,
              summary: stripHtml(item.contentSnippet || item.content || ''),
              link: item.link || '',
              pubDate: pubDateStr,
              pubDateParsed: new Date(pubDateStr).getTime() // ⚡ Bolt: Parse once during creation
            });
          }
        });
        return fetchedItems;
      } catch (error) {
        console.error(`[Nexus Fetcher] Failed to fetch feed ${url}:`, error);
        return [];
      }
    });

    const results = await Promise.all(feedPromises);
    const articles = results.flat();
    
    // Sort by publication date, newest first, and keep top 100 for better algorithms
    // ⚡ Bolt: Use pre-calculated timestamp to avoid O(N log N) Date parsing
    articles.sort((a, b) => b.pubDateParsed - a.pubDateParsed);
      globalCorpus[category] = articles.slice(0, 100);
      console.log(`[Nexus Fetcher] Loaded ${globalCorpus[category].length} articles for ${category}`);
    });

    await Promise.all(fetchPromises);
    console.log('[Nexus Fetcher] Corpus updated successfully.');
  } finally {
    isFetching = false;
  }
}
