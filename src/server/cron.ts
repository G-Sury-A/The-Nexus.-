import cron from 'node-cron';
import { fetchAllFeeds } from './fetcher.js';

export function startCronJobs() {
  console.log('[Cron] Initializing scheduled jobs...');
  
  // Set to run at 3:00 AM every single day
  cron.schedule('0 3 * * *', async () => {
    console.log('[Cron] 3:00 AM triggered. Initiating worldwide data pulse...');
    try {
      await fetchAllFeeds();
      console.log('[Cron] Pulse complete. Corpus updated for Nexus Briefs.');
    } catch (e) {
      console.error('[Cron] Error updating corpus:', e);
    }
  });

  // We immediately fetch once on startup to ensure we have initial data, without waiting until 3 AM.
  console.log('[Cron] Requesting initial payload to hydrate system memory.');
  fetchAllFeeds().catch(e => console.error('[Cron] Initial hydration failed:', e));
}
