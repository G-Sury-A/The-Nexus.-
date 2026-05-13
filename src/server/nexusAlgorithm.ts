import { globalCorpus, RawArticle, fetchAllFeeds } from './fetcher.js';
import { tokenize, extractEntities } from './nlpUtils.js';

function calculateAffinity(a: RawArticle, b: RawArticle): { score: number, commonKeys: string[] } {
  // Base token affinity - use cached
  const tokensA = a.tokens;
  const tokensB = b.tokens;
  
  // Entity affinity (higher weight) - use cached
  const entitiesA = a.entities;
  const entitiesB = b.entities;

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
  const tokens = article.tokens;
  const entities = article.entities;
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
  const personaString = `${userPrefs.jobIndustry} ${userPrefs.societyFocus} ${userPrefs.entertainmentInterests} ${userPrefs.region} ${userPrefs.notificationStyle}`;
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
         style: userPrefs.notificationStyle
      });
      continue;
    }

    // Limit to top 50 for performance and relevancy mapping
    const pool = rawPool.slice(0, 50);

    // 1. Frequency Analysis: Gather entities from all 50 articles
    const entityFrequency: Record<string, number> = {};
    const articleEntities: { article: RawArticle; entities: Set<string>; score: number }[] = [];

    pool.forEach(article => {
      const entities = article.entities;
      const personaScore = scoreAgainstPersona(article, prefTokens);

      articleEntities.push({ article, entities, score: personaScore });

      entities.forEach(ent => {
        // Boost frequency if it matches user persona directly
        const weight = prefTokens.has(ent) ? 3 : 1; 
        entityFrequency[ent] = (entityFrequency[ent] || 0) + weight;
      });
    });

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
        .filter(ae => ae.entities.has(subject) && !usedArticleIds.has(ae.article.id))
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
         topMatches.push({ article: ae.article, subject: Array.from(ae.entities)[0] || 'General Update' });
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
    
    // Crisp, personalized paragraph
    const userVibe = userPrefs.notificationStyle === 'Executive' ? 'a high-level' : 'a tailored';
    let compositeSummary = `Based on frequency across 50 recent articles, the biggest drivers in ${category} are: ${topSubjects.join(', ')}. `;
    compositeSummary += `Here is ${userVibe} breakdown perfectly aligned with your ${userPrefs.jobIndustry} context:`;

    topMatches.forEach((m, idx) => {
      sourceArticles.push({
         title: m.article.title,
         summary: m.article.summary,
         link: m.article.link
      });
      // Summarize via first sentence heuristic to keep it crisp
      const sentences = m.article.summary.split(/(?<=[.!?])\s+/);
      const crispSentence = sentences[0] || m.article.title;
      bullets.push(`${m.subject.toUpperCase()}: ${crispSentence}`);
    });

    const primaryMatch = topMatches[0]?.article || pool[0];

    const node = {
      id: primaryMatch.id,
      category: category,
      headline: `${category} Key Movements: ${topSubjects[0] || ''}`,
      summary: compositeSummary.trim(),
      bullets: bullets,
      dataPoints: [
        `Analyzed 50 top items`,
        `Primary focus: ${topSubjects[0] || 'General'}`
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
