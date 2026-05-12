import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { startCronJobs } from './src/server/cron.js';
import { generateNexusBriefing } from './src/server/nexusAlgorithm.js';
import { validateUserPreferences } from './src/server/validation.js';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware to parse JSON bodies
  app.use(express.json());

  // Initialize the 3 AM RSS Corpus Cron Jobs
  startCronJobs();

  // Primary API endpoint for generating a personalized briefing
  app.post('/api/briefing', async (req, res) => {
    try {
      const { valid, errors, cleaned } = validateUserPreferences(req.body);

      if (!valid) {
        return res.status(400).json({ error: 'Invalid preferences provided.', details: errors });
      }

      const briefing = await generateNexusBriefing(cleaned);
      res.json(briefing);
    } catch (err: any) {
      console.error('Error in /api/briefing:', err);
      res.status(500).json({ error: 'Failed to generate Nexus Briefing.' });
    }
  });

  // Serve the frontend
  if (process.env.NODE_ENV !== 'production') {
    // Development Mode with Vite middleware
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production Mode serving static files
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Nexus Backend Node running organically on http://localhost:${PORT}`);
  });
}

startServer();
