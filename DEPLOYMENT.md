# Deployment Instructions

This application is optimized for deployment on Vercel. Below are the steps and architectural details to ensure a successful setup.

## Environment Variables

To ensure the application functions correctly, especially for Firebase and authentication, you must set the following environment variables in your Vercel project settings:

| Variable | Description |
| :--- | :--- |
| `VITE_FIREBASE_API_KEY` | Your Firebase API Key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Your Firebase Auth Domain (e.g., `project.firebaseapp.com`) |
| `VITE_FIREBASE_PROJECT_ID` | Your Firebase Project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Your Firebase Storage Bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Your Firebase Messaging Sender ID |
| `VITE_FIREBASE_APP_ID` | Your Firebase App ID |
| `GEMINI_API_KEY` | Required for Gemini AI API calls (if applicable) |

## Vercel Architecture

- **Backend API**: The backend logic is served via Vercel Serverless Functions located in the `api/` directory. The main endpoint is `/api/briefing`.
- **Parallel Fetching**: To avoid Vercel's 10-second timeout limit for serverless functions, the RSS fetching logic has been optimized to run in parallel. This significantly reduces the time required to curate your personalized Nexus Briefing.
- **Routing**: `vercel.json` handles the routing, ensuring that `/api/briefing` points to the correct serverless function and that the React frontend handles all other routes (SPA routing).

## Troubleshooting

- **Timeout Errors**: If you encounter timeout errors, it may be due to one or more RSS feeds being extremely slow. The system has a built-in 5-second timeout per feed to mitigate this.
- **Missing Results**: Ensure that all required Firebase environment variables are correctly set, as the application relies on Firebase for user preferences and profile persistence.
