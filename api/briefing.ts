import { generateNexusBriefing } from '../src/server/nexusAlgorithm.js';
import { validateUserPreferences } from '../src/server/validation.js';

interface VercelRequest {
  method: string;
  body: any;
}

interface VercelResponse {
  status: (code: number) => VercelResponse;
  json: (data: any) => void;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { valid, errors, cleaned } = validateUserPreferences(req.body);

    if (!valid) {
      return res.status(400).json({ error: 'Invalid preferences provided.', details: errors });
    }

    const briefing = await generateNexusBriefing(cleaned);
    res.status(200).json(briefing);
  } catch (err: any) {
    console.error('CRITICAL: Error in Vercel /api/briefing:', err);
    res.status(500).json({
      error: 'Failed to generate Nexus Briefing.',
      message: err.message
    });
  }
}
