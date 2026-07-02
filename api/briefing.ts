import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateNexusBriefing } from '../src/server/nexusAlgorithm.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const prefs = req.body;
    const briefing = await generateNexusBriefing(prefs);
    return res.status(200).json(briefing);
  } catch (err: any) {
    console.error('Error in /api/briefing:', err);
    return res.status(500).json({ error: 'Failed to generate Nexus Briefing.', message: err.message });
  }
}