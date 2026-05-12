import Parser from 'rss-parser';
import { tokenize, extractEntities } from './nlpUtils.js';

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
  category: string;
  id: string;
  tokens?: Set<string>;
  entities?: Set<string>;
}

// In-memory cache to hold our corpus fetched at 3 AM
export const globalCorpus: Record<string, RawArticle[]> = {
  Geopolitics: [],
  'Job & Industry': [],
  Society: [],
  Entertainment: [],
  Sports: []
};

let isFetching = false;

// Strips basic HTML tags from descriptions
function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, '').trim();
}

export async function fetchAllFeeds() {
  if (isFetching) {
    console.log('[Nexus Fetcher] Fetch already in progress, skipping...');
    return;
  }
  isFetching = true;
  console.log('[Nexus Fetcher] Starting daily RSS corpus fetch...');
  try {
    for (const [category, urls] of Object.entries(CATEGORY_FEEDS)) {
    const articles: RawArticle[] = [];
    
    for (const url of urls) {
      try {
        console.log(`[Nexus Fetcher] Fetching ${url} for ${category}...`);
        const feed = await parser.parseURL(url);
        
        feed.items.forEach(item => {
          const rawContent = item.contentSnippet || item.content || '';
          if (item.title && rawContent) {
            const title = item.title;
            const summary = stripHtml(rawContent);
            const text = title + ' ' + summary;

            articles.push({
              id: item.guid || item.link || Math.random().toString(36),
              category,
              title,
              summary,
              link: item.link || '',
              pubDate: item.pubDate || new Date().toISOString(),
              tokens: new Set(tokenize(text)),
              entities: new Set(extractEntities(text))
            });
          }
        });
      } catch (error) {
        console.error(`[Nexus Fetcher] Failed to fetch feed ${url}:`, error);
      }
    }
    
    // Sort by publication date, newest first, and keep top 50
    articles.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());
    globalCorpus[category] = articles.slice(0, 50);
    console.log(`[Nexus Fetcher] Loaded ${globalCorpus[category].length} articles for ${category}`);
  }
  
  console.log('[Nexus Fetcher] Corpus updated successfully.');
  } finally {
    isFetching = false;
  }
}
