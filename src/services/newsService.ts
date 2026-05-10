import { UserPreferences, DailyBriefing, NewsNode } from '../types';

export const generateBriefing = async (prefs: UserPreferences): Promise<DailyBriefing> => {
  // Simulating purely algorithmic/software-driven recursive web scraping and correlation
  // The prompt specified pure software over AI for hard work curation.
  await new Promise(r => setTimeout(r, 2000));

  const region = prefs.region || 'Global';
  const job = prefs.jobIndustry || 'Business';
  const society = prefs.societyFocus.length > 0 ? prefs.societyFocus[0] : 'Community Health';
  const ent = prefs.entertainmentInterests.length > 0 ? prefs.entertainmentInterests[0] : 'Media';
  const sport = prefs.favoriteSports.length > 0 ? prefs.favoriteSports[0] : 'Athletics';

  const themes = ['Resource Reallocation', 'Technological Shift', 'Workforce Evolution', 'Cultural Renaissance', 'Sustainability Drive'];
  const theme = themes[Math.floor(Math.random() * themes.length)];

  const chain: NewsNode[] = [];

  // 1. Geopolitics
  chain.push({
    id: `geo-${Date.now()}`,
    category: 'Geopolitics',
    icon: 'Globe2',
    headline: `${region} Trade Alliances Trigger ${theme}`,
    summary: `Recent bilateral agreements negotiated within ${region} are fundamentally altering global supply lines, directly emphasizing a new era of ${theme.toLowerCase()}.`,
    bullets: [
      `New economic pacts signed across ${region}`,
      `Global supply chain restructuring initiated`,
      `Policy focus sharply pivoting toward ${theme.toLowerCase()}`
    ],
    dataPoints: [`+14.5% ${region} Trade flow`, '$45B Economic Shift'],
    causalLinkToNext: `These macro-economic parameters force immediate structural adaptation within the ${job} sector.`
  });

  // 2. Job
  chain.push({
    id: `job-${Date.now()}`,
    category: 'Job',
    icon: 'Briefcase',
    headline: `${job} Industry Pivot & Hiring Surge`,
    summary: `Responding directly to the ${region} policy shifts, the ${job} industry is aggressively restructuring. Specialized talent pools are being heavily recruited to handle new compliance and operations parameters.`,
    bullets: [
      `Massive structural shift in primary ${job} corporations`,
      `Surge in compliance, strategy, and logistics hiring`,
      `Remote and hybrid operation models formalized globally`
    ],
    dataPoints: ['+22.1% Hiring Growth', '150k New Roles Created'],
    causalLinkToNext: `The rapid scaling and remote work adoption directly alters community dynamics, shifting the focus to ${society}.`
  });

  // 3. Society
  chain.push({
    id: `soc-${Date.now()}`,
    category: 'Society',
    icon: 'Users',
    headline: `Urban Centers Reallocate For ${society}`,
    summary: `As the workforce decentralizes, city councils and private coalitions are rapidly shifting budgets to heavily support ${society}, enhancing local infrastructure for remote workers.`,
    bullets: [
      `Legislative budget pivot towards ${society}`,
      `Public infrastructure enhancements approved in 40+ major metros`,
      `Community integration programs launched with unprecedented backing`
    ],
    dataPoints: ['$2.5B Regional Investment', '+30% Community Sentiment metric'],
    causalLinkToNext: `With stronger community infrastructure and localized spending, ${ent} events are experiencing a massive revival.`
  });

  // 4. Entertainment
  chain.push({
    id: `ent-${Date.now()}`,
    category: 'Entertainment',
    icon: 'Film',
    headline: `${ent} Experiences Local Renaissance`,
    summary: `Revitalized community spaces have triggered a boom in ${ent}. Localized grassroots creators and venues are taking center stage, drawing crowds away from digital isolation.`,
    bullets: [
      `Grassroots ${ent} creators see massive influx of live audiences`,
      `Local venues report record-breaking attendance and revenue`,
      `Observable cultural shift away from traditional mega-productions`
    ],
    dataPoints: ['+41% Event Booking Rate', '2M+ Total Monthly Attendees'],
    causalLinkToNext: `The revival of physical community gathering naturally flows back into local ${sport} fandoms.`
  });

  // 5. Sports
  chain.push({
    id: `spo-${Date.now()}`,
    category: 'Sports',
    icon: 'Trophy',
    headline: `Record Support & Funding for ${sport}`,
    summary: `Community pride, heavily fueled by the vibrant ${ent} revival, has led to unprecedented grassroots funding and viewership for ${sport} leagues and developmental programs.`,
    bullets: [
      `Unprecedented grassroots funding injections for ${sport}`,
      `Local leagues report soaring engagement and broadcast metrics`,
      `Youth developmental systems fully backed for the upcoming season`
    ],
    dataPoints: ['10-yr High Attendance', '+108% Fan Engagement'],
    causalLinkToNext: `This local momentum and economic revitalization in ${region} sets the stage for the next cycle of socio-economic policy shifts.`
  });

  return {
    date: new Date().toISOString(),
    chain
  };
};
