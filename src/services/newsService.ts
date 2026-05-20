import { UserPreferences, DailyBriefing, NewsNode } from '../types';

export const generateBriefing = async (prefs: UserPreferences): Promise<DailyBriefing> => {
  // Call the real Express/Vite backend that runs the Nexus Algorithm
  const response = await fetch('/api/briefing', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(prefs)
  });
  
  if (!response.ok) {
    throw new Error('Failed to generate real algorithm briefing');
  }

  const data = await response.json();
  
  // Create standardized briefing
  return {
    date: new Date().toISOString(),
    chain: data.chain
  };
};
