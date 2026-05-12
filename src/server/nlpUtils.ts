import nlp from 'compromise';

// Basic list of stop words to filter out grammatical glue
export const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'in', 'and', 'a', 'an', 'to', 'for', 'of', 'with', 'by', 'as', 'it', 'that', 'this', 'from', 'but', 'not', 'or', 'are', 'be', 'has', 'have', 'was', 'were', 'will', 'would', 'can', 'could', 'should', 'their', 'they', 'we', 'our', 'what', 'who', 'when', 'where', 'how', 'why', 'its', 'about', 'more', 'new', 'after', 'also', 'over', 'into', 'out', 'up', 'down', 'been', 'some', 'says', 'said', 'all', 'there', 'one', 'two', 'than', 'while'
]);

export function tokenize(text: string): string[] {
  // Lowercase, replace punctuation with spaces to avoid smashing words, split by space
  const words = text.toLowerCase().replace(/[^\w\s]/g, ' ').split(/\s+/);
  return words.filter(w => w.length > 3 && !STOP_WORDS.has(w));
}

export function extractEntities(text: string): string[] {
  const doc = nlp(text);
  // Extract proper nouns, people, places, organizations
  const topics = doc.topics().out('array');
  const orgs = doc.organizations().out('array');
  const people = doc.people().out('array');
  const places = doc.places().out('array');

  // Combine all entities, normalize to lowercase to improve matching
  const allEntities = [...topics, ...orgs, ...people, ...places].map(e => e.toLowerCase().trim());
  return Array.from(new Set(allEntities)).filter(e => e.length > 2);
}
