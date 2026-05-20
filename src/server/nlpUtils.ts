import nlp from 'compromise';

// Basic list of stop words to filter out grammatical glue
export const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'in', 'and', 'a', 'an', 'to', 'for', 'of', 'with', 'by', 'as', 'it', 'that', 'this', 'from', 'but', 'not', 'or', 'are', 'be', 'has', 'have', 'was', 'were', 'will', 'would', 'can', 'could', 'should', 'their', 'they', 'we', 'our', 'what', 'who', 'when', 'where', 'how', 'why', 'its', 'about', 'more', 'new', 'after', 'also', 'over', 'into', 'out', 'up', 'down', 'been', 'some', 'says', 'said', 'all', 'there', 'one', 'two', 'than', 'while'
]);

export function tokenize(text: string): string[] {
  // Lowercase, remove punctuation, split by space
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  return words.filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

export function capitalize(str: string) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

// Cache for extractEntities results
const entityCache = new Map<string, string[]>();

export function extractEntities(text: string): string[] {
  if (entityCache.has(text)) {
    return entityCache.get(text)!;
  }

  const doc = nlp(text);
  // Extract proper nouns, people, places, organizations
  // Note: compromise topics() usually aggregates orgs, people, and places
  const topics = doc.topics().out('array');
  const orgs = doc.organizations().out('array');
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const nouns = doc.match('#Noun').out('array').filter((n: string) => n.length > 5);

  // Combine all entities, normalize to lowercase to improve matching initially, but keep casing for display
  const allEntities = [...topics, ...orgs, ...people, ...places, ...nouns].map((e: string) => e.replace(/[^\w\s-]/g, '').trim());
  const result = Array.from(new Set(allEntities)).filter(e => e.length > 3);

  // Simple cache management - clear if it gets too large
  if (entityCache.size > 1000) {
    entityCache.clear();
  }
  entityCache.set(text, result);

  return result;
}
