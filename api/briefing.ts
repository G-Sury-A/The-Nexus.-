import type { VercelRequest, VercelResponse } from '@vercel/node';
import { generateNexusBriefing } from '../src/server/nexusAlgorithm.js';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    try {
      const prefs = req.body;
      const briefing = await generateNexusBriefing(prefs);
      res.status(200).json(briefing);
    } catch (err: any) {
      console.error('Error in /api/briefing:', err);
      res.status(500).json({ error: 'Failed to generate Nexus Briefing.' });
    }
  } else {
    res.status(405).json({ error: 'Method Not Allowed' });
  }
}
