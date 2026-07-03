import { globalCorpus, RawArticle, fetchAllFeeds } from './fetcher.js';
import nlp from 'compromise';

// Basic list of stop words to filter out grammatical glue
const STOP_WORDS = new Set([
  'the', 'is', 'at', 'which', 'on', 'in', 'and', 'a', 'an', 'to', 'for', 'of', 'with', 'by', 'as', 'it', 'that', 'this', 'from', 'but', 'not', 'or', 'are', 'be', 'has', 'have', 'was', 'were', 'will', 'would', 'can', 'could', 'should', 'their', 'they', 'we', 'our', 'what', 'who', 'when', 'where', 'how', 'why', 'its', 'about', 'more', 'new', 'after', 'also', 'over', 'into', 'out', 'up', 'down', 'been', 'some', 'says', 'said', 'all', 'there', 'one', 'two', 'than', 'while'
]);


// Bounded Cache to prevent memory leaks during long-running Node.js processes.
class BoundedCache<K, V> extends Map<K, V> {
  maxSize: number;
  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }
  set(key: K, value: V) {
    if (this.size >= this.maxSize) {
      // Very simple LRU-ish eviction: remove the first item (oldest inserted)
      const firstKey = this.keys().next().value;
      this.delete(firstKey);
    }
    return super.set(key, value);
  }
}

// Memoization caches to prevent redundant expensive NLP and string operations.
// Expected Impact: Reduces algorithmic processing time significantly (e.g. from ~3.4s to ~0.5s for 250 articles)
// by avoiding duplicate work when processing the same text titles and summaries during cross-affinity calculations.
const tokenCache = new BoundedCache<string, string[]>(1000);

function tokenize(text: string): string[] {
  if (tokenCache.has(text)) return tokenCache.get(text)!;
  // Lowercase, remove punctuation, split by space
  const words = text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/);
  const result = words.filter(w => w.length > 3 && !STOP_WORDS.has(w));
  tokenCache.set(text, result);
  return result;
}

function capitalize(str: string) {
  return str.replace(/\b\w/g, l => l.toUpperCase());
}

const entityCache = new BoundedCache<string, string[]>(1000);

function extractEntities(text: string): string[] {
  if (entityCache.has(text)) return entityCache.get(text)!;
  const doc = nlp(text);
  // Extract proper nouns, people, places, organizations
  const topics = doc.topics().out('array');
  const orgs = doc.organizations().out('array');
  const people = doc.people().out('array');
  const places = doc.places().out('array');
  const nouns = doc.match('#Noun').out('array').filter((n: string) => n.length > 5);
  
  // Combine all entities, normalize to lowercase to improve matching initially, but keep casing for display
  const allEntities = [...topics, ...orgs, ...people, ...places, ...nouns].map((e: string) => e.replace(/[^\w\s-]/g, '').trim());
  const result = Array.from(new Set(allEntities)).filter(e => e.length > 3);
  entityCache.set(text, result);
  return result;
}

function calculateAffinity(a: RawArticle, b: RawArticle): { score: number, commonKeys: string[] } {
  // Base token affinity
  const tokensA = new Set(tokenize(a.title + ' ' + a.summary));
  const tokensB = new Set(tokenize(b.title + ' ' + b.summary));
  
  // Entity affinity (higher weight)
  const entitiesA = new Set(extractEntities(a.title + ' ' + a.summary));
  const entitiesB = new Set(extractEntities(b.title + ' ' + b.summary));

  const commonKeys: string[] = [];
  let score = 0;
  
  // Higher weight for shared entities (People, places, orgs)
  entitiesA.forEach(t => {
    if (entitiesB.has(t)) {
      commonKeys.push(t);
      score += 3; // NLP Entity Match is stronger
    }
  });

  // Fallback to basic token matching
  tokensA.forEach(t => {
    if (tokensB.has(t)) {
      if (!commonKeys.includes(t)) {
        commonKeys.push(t);
      }
      score += 1;
    }
  });

  return { score, commonKeys };
}

// Emulate TF-IDF / Persona weighting
function scoreAgainstPersona(article: RawArticle, prefTokens: Set<string>): number {
  const tokens = tokenize(article.title + ' ' + article.summary);
  const entities = extractEntities(article.title + ' ' + article.summary);
  let score = 0;
  
  tokens.forEach(t => {
    if (prefTokens.has(t)) score += 2; // Preferences have higher weight
  });
  
  entities.forEach(e => {
    if (prefTokens.has(e)) score += 4; // Entity match with persona is very strong
  });
  
  return score;
}

export async function generateNexusBriefing(userPrefs: any) {
  // If corpus is empty, fetch it right away (e.g., app just started)
  if (globalCorpus['Geopolitics'].length === 0) {
    await fetchAllFeeds();
  }

  // Tokenize user preferences
  const personaString = `${userPrefs.jobIndustry} ${userPrefs.societyFocus} ${userPrefs.entertainmentVibe} ${userPrefs.region} ${userPrefs.tone}`;
  const prefTokens = new Set([...tokenize(personaString), ...extractEntities(personaString)]);

  const chainOrder = ['Geopolitics', 'Job & Industry', 'Society', 'Entertainment', 'Sports'];
  const selectedChain: any[] = [];
  
  let previousCategoryTopics: string[] = [];
  
  for (let i = 0; i < chainOrder.length; i++) {
    const category = chainOrder[i];
    const rawPool = globalCorpus[category];
    
    // Failsafe if a category didn't fetch
    if (!rawPool || rawPool.length === 0) {
      selectedChain.push({
         id: `fallback-${category}`,
         category: category,
         headline: `Latest updates in ${category}`,
         summary: `Data for ${category} is currently unavailable. The background syncer will update this soon.`,
         bullets: ['System offline', 'Awaiting next cron sync at 3 AM'],
         dataPoints: [],
         causalLinkToNext: null,
         style: userPrefs.tone
      });
      continue;
    }

    // Limit to top 50 for performance and relevancy mapping
    const pool = rawPool.slice(0, 50);

    // 1. Frequency Analysis: Gather entities from all 50 articles
    const entityFrequency: Record<string, number> = {};
    const articleEntities: { article: RawArticle; entities: string[]; score: number }[] = [];

    pool.forEach(article => {
      const text = article.title + ' ' + article.summary;
      const entities = extractEntities(text);
      const personaScore = scoreAgainstPersona(article, prefTokens);

      // Strict alignment with user preferences
      if (personaScore > 0) {
        articleEntities.push({ article, entities, score: personaScore });

        entities.forEach(ent => {
          // Boost frequency if it matches user persona directly
          const weight = prefTokens.has(ent) ? 3 : 1;
          entityFrequency[ent] = (entityFrequency[ent] || 0) + weight;
        });
      }
    });

    // Fallback if no matching articles perfectly aligned
    if (articleEntities.length === 0) {
       pool.forEach(article => {
         const text = article.title + ' ' + article.summary;
         const entities = extractEntities(text);
         const personaScore = scoreAgainstPersona(article, prefTokens);
         articleEntities.push({ article, entities, score: personaScore });
         entities.forEach(ent => {
           const weight = prefTokens.has(ent) ? 3 : 1;
           entityFrequency[ent] = (entityFrequency[ent] || 0) + weight;
         });
       });
    }

    // 2. Identify Top 3 Frequent Subjects
    const sortedEntities = Object.entries(entityFrequency)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0]);
    
    const topSubjects = sortedEntities.slice(0, 3);
    const categoryTopTopics = sortedEntities.slice(0, 10); // Broader context for connections

    // 3. Find Best Article for each Top Subject
    const topMatches: { article: RawArticle; subject: string }[] = [];
    const usedArticleIds = new Set<string>();

    topSubjects.forEach(subject => {
      // Find highest scored article containing this subject
      const matchingArticles = articleEntities
        .filter(ae => ae.entities.includes(subject) && !usedArticleIds.has(ae.article.id))
        .sort((a, b) => b.score - a.score);
      
      if (matchingArticles.length > 0) {
        topMatches.push({ article: matchingArticles[0].article, subject });
        usedArticleIds.add(matchingArticles[0].article.id);
      }
    });

    // Fallback if we didn't find enough matches (e.g. poor entity extraction)
    if (topMatches.length === 0 && articleEntities.length > 0) {
       articleEntities.sort((a, b) => b.score - a.score);
       articleEntities.slice(0, 3).forEach(ae => {
         topMatches.push({ article: ae.article, subject: ae.entities[0] || 'General Update' });
       });
    }

    // Connect previous category visually (Causal Links)
    if (selectedChain.length > 0) {
      // Find intersection between previous category topics and this category topics
      const intersection = previousCategoryTopics.filter(t => categoryTopTopics.includes(t));
      
      if (intersection.length > 0) {
        const topOverlap = intersection[0];
        selectedChain[selectedChain.length - 1].causalLinkToNext = 
          `High impact: We detected significant crossover regarding '${topOverlap}', seamlessly linking the momentum into ${category.toLowerCase()}.`;
      } else {
        selectedChain[selectedChain.length - 1].causalLinkToNext = 
          `Low to none: There is low impact and no direct correlation connecting the prior developments to ${category.toLowerCase()}.`;
      }
    }

    // 4. Generate Composite summary & Extract elements
    const bullets: string[] = [];
    const sourceArticles: any[] = [];
    
    // Clean top Subjects for display
    const formattedTopics = topSubjects.map(t => capitalize(t));
    
    // Crisp, personalized paragraph stitched together
    const userVibe = userPrefs.notificationStyle === 'Executive' ? 'a high-level, executive' : 'a detailed, tailored';
    let compositeSummary = `Based on high-frequency themes across top ${pool.length} updates, the primary drivers in ${category} are ${formattedTopics.length > 0 ? formattedTopics.map(t => `**${t}**`).join(', ') : 'overall trends'}. ${userPrefs.notificationStyle === 'Executive' ? 'Here is the high-level' : 'Here is the tailored'} breakdown aligned with your ${userPrefs.jobIndustry} focus: `;

    const transitions = [
      ["Leading the shifts, recent developments around", "indicate that"],
      ["Concurrently, looking at", "we see"],
      ["Furthermore, in the context of", "the focus is on"],
      ["Additionally, regarding", "reports suggest"]
    ];

    topMatches.forEach((m, idx) => {
      sourceArticles.push({
         title: m.article.title,
         summary: m.article.summary,
         link: m.article.link
      });
      
      // Understand what the sentence is about and simplify it for bullets
      let nlpDoc = nlp(m.article.summary || m.article.title).sentences().first();
      nlpDoc.remove('(#Adverb|#Preposition|#Conjunction|#Determiner)');
      let words = nlpDoc.terms().out('array').filter((x: string) => x.length > 0).slice(0, 7).join(' ');
      let extremelyShort = words.length > 5 ? words.charAt(0).toUpperCase() + words.slice(1) : (m.article.title.substring(0, 40) + '...');
      bullets.push(`${capitalize(m.subject)} - ${extremelyShort}`);

      // Summarize via first sentence heuristic but make it more descriptive for the paragraph
      const sentences = m.article.summary.split(/(?<=[.!?])\s+/);
      let crispSentence = sentences.length > 1 ? sentences[0] + ' ' + sentences[1] : sentences[0] || m.article.title;
      crispSentence = crispSentence.trim();
      if (crispSentence && !crispSentence.match(/[.!?]$/)) crispSentence += '.';

      // Stitch it into the summary rather than adding to bullets
      let displaySubject = `**${capitalize(m.subject)}**`;
      const transition = transitions[idx % transitions.length];
      
      if (idx === 0) {
        compositeSummary += `${transition[0]} ${displaySubject} ${transition[1]} ${crispSentence.charAt(0).toLowerCase() + crispSentence.slice(1)} `;
      } else if (idx === 1) {
        compositeSummary += `${transition[0]} ${displaySubject}, ${transition[1]} ${crispSentence.charAt(0).toLowerCase() + crispSentence.slice(1)} `;
      } else {
        compositeSummary += `Lastly, touching upon ${displaySubject}, ${crispSentence.charAt(0).toLowerCase() + crispSentence.slice(1)} `;
      }
    });

    const primaryMatch = topMatches[0]?.article || pool[0];

    const node = {
      id: primaryMatch.id,
      category: category,
      headline: `${category} Focus: ${formattedTopics[0] || 'Key Shifts'}`,
      summary: compositeSummary.trim(),
      bullets: bullets,
      dataPoints: [
        `Analyzed ${pool.length} real-time updates`,
        `Top Focus: ${formattedTopics[0] || 'Broad Overview'}`
      ],
      icon: 'Globe2',
      causalLinkToNext: null,
      style: userPrefs.notificationStyle || 'Narrative',
      sourceUrl: primaryMatch.link,
      topArticles: sourceArticles
    };

    selectedChain.push(node);
    
    // Pass topic context forward
    previousCategoryTopics = categoryTopTopics;
  }

  // The final chain has the generated nexus
  return { chain: selectedChain };
}
