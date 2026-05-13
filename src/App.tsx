import React, { useState, useEffect, ErrorInfo, ReactNode } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { UserPreferences, DailyBriefing } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { generateBriefing } from './services/newsService';
import { useAuth } from './components/AuthContext';
import { getUserPreferences, saveUserPreferences } from './services/userService';
import { Shield, Sparkles, BrainCircuit, ArrowRight, X } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
            <X className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 text-white">Application Crash</h1>
          <p className="text-zinc-400 max-w-md mb-8">
            The Nexus has encountered a critical runtime error.
            {this.state.error && <span className="block mt-2 font-mono text-xs text-red-400 bg-red-950/30 p-2 rounded">{this.state.error.message}</span>}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
          >
            Reload Nexus
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [pendingPrefs, setPendingPrefs] = useState<UserPreferences | null>(null);

  const { user, loading, login, logout } = useAuth();
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  useEffect(() => {
    if (loading) return;

    async function handleAuthTransition() {
      const savedPendingPrefs = localStorage.getItem('pending_nexus_prefs');

      if (user) {
        if (savedPendingPrefs) {
          // Transitioning from redirect login
          try {
            const prefs = JSON.parse(savedPendingPrefs);
            setPreferences(prefs);
            // Use merge: true to avoid issues with createdAt security rules if they exist
            await saveUserPreferences(user.uid, prefs, true);
            await generate(prefs);
          } catch (err) {
            console.error("Error applying pending preferences:", err);
            setError("We logged you in but couldn't apply your preferences. Please try setting them again.");
          } finally {
            localStorage.removeItem('pending_nexus_prefs');
            setShowAuthPopup(false);
          }
        } else {
          // Normal login, load existing prefs
          try {
            const prefs = await getUserPreferences(user.uid);
            if (prefs) {
              setPreferences(prefs);
              await generate(prefs);
            }
          } catch (err: any) {
            console.error("Error loading user preferences:", err);
            setError("Failed to load your profile. Please try again.");
          }
        }
      }
      setInitialFetchDone(true);
    }
    
    handleAuthTransition();
  }, [user, loading]);

  const handleCompleteOnboarding = async (prefs: UserPreferences) => {
    setError(null);
    if (user) {
      setPreferences(prefs);
      try {
        await saveUserPreferences(user.uid, prefs, true);
        await generate(prefs);
      } catch (err: any) {
        console.error("Error saving preferences:", err);
        setError("Failed to save your preferences. You can still use the app as a guest for now.");
        // Fallback to guest-like behavior so they can at least see the briefing
        await generate(prefs);
      }
    } else {
      setPendingPrefs(prefs);
      setShowAuthPopup(true);
    }
  };

  const generate = async (prefs: UserPreferences) => {
    setIsGenerating(true);
    setError(null);
    try {
      const data = await generateBriefing(prefs);
      setBriefing(data);
    } catch(err: any) {
      console.error("Generation error:", err);
      // More descriptive error
      if (err.message?.includes('Database error') && err.message?.includes('permission-denied')) {
        setError("Access Denied. It seems you're trying to update an existing profile with inconsistent data. Try refreshing or logging in again.");
      } else if (err.message?.includes('Failed to fetch')) {
        setError("Unable to reach the Nexus server. Please check your internet connection.");
      } else {
        setError(`The Nexus Algorithm encountered an issue while correlating your briefing. ${err.message || ''}`);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = async () => {
    if (!pendingPrefs) return;
    setError(null);
    try {
      // Save pending prefs in case of redirect
      localStorage.setItem('pending_nexus_prefs', JSON.stringify(pendingPrefs));

      const loggedUser = await login();
      if (loggedUser) {
        setShowAuthPopup(false);
        setPreferences(pendingPrefs);
        try {
          await saveUserPreferences(loggedUser.uid, pendingPrefs, true);
        } catch (err) {
          console.error("Failed to save preferences after login:", err);
          // We don't block the user if saving fails, but we might want to show a warning
        }
        await generate(pendingPrefs);
        localStorage.removeItem('pending_nexus_prefs');
      }
    } catch (e) {
      console.error("Login failed", e);
      setError("Login failed. Please try again or continue as a guest.");
    }
  };

  const handleGuest = () => {
    if (!pendingPrefs) return;
    setShowAuthPopup(false);
    setPreferences(pendingPrefs);
    generate(pendingPrefs);
  };

  if (loading || (!initialFetchDone && user)) {
    return (
       <div className="bg-black text-white min-h-screen flex items-center justify-center">
         <div className="w-8 h-8 border-2 border-blue-500 rounded-full border-t-transparent animate-spin" />
       </div>
    );
  }

  return (
    <div className="bg-black text-white min-h-screen relative overflow-hidden">
      <AnimatePresence mode="wait">
        {!preferences && !showAuthPopup ? (
          <motion.div key="onboarding" exit={{ opacity: 0 }}>
            <Onboarding onComplete={handleCompleteOnboarding} />
          </motion.div>
        ) : (isGenerating || (preferences && !briefing && !error)) ? (
          <motion.div 
            key="generating"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center min-h-screen space-y-6"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <p className="text-xl font-light text-zinc-300 animate-pulse">Curating your personalized Nexus Web...</p>
            <p className="text-sm text-zinc-500">Algorithmically correlating Geopolitics to {preferences?.jobIndustry || pendingPrefs?.jobIndustry} and local matters...</p>
          </motion.div>
        ) : error ? (
          <motion.div
            key="error"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center min-h-screen p-6 text-center"
          >
            <div className="w-16 h-16 bg-red-500/10 rounded-2xl flex items-center justify-center mb-6 border border-red-500/20">
              <X className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Something went wrong</h2>
            <p className="text-zinc-400 max-w-md mb-8">{error}</p>
            <button
              onClick={() => preferences ? generate(preferences) : (pendingPrefs ? generate(pendingPrefs) : window.location.reload())}
              className="bg-white text-black px-8 py-3 rounded-xl font-medium hover:bg-zinc-200 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => {
                setError(null);
                setPreferences(null);
                setBriefing(null);
                setShowAuthPopup(false);
              }}
              className="mt-4 text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              Back to Start
            </button>
          </motion.div>
        ) : briefing ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dashboard 
              prefs={preferences!} 
              briefing={briefing} 
              onReset={() => {
                if (user) logout();
                else {
                  setPreferences(null);
                  setBriefing(null);
                  setError(null);
                }
              }} 
            />
          </motion.div>
        ) : null}
      </AnimatePresence>

      <AnimatePresence>
        {showAuthPopup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 30, rotateX: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0, rotateX: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="relative max-w-md w-full bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Premium Glow Effect */}
              <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-500/20 rounded-full blur-[100px] pointer-events-none" />
              <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-500/20 rounded-full blur-[100px] pointer-events-none" />

              <div className="relative z-10">
                <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-blue-500/20">
                  <BrainCircuit className="w-8 h-8 text-white" />
                </div>

                <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400 mb-4 inline-block">
                  Your Nexus is ready.
                </h2>
                <p className="text-zinc-400 leading-relaxed mb-8">
                  Sign in to preserve your custom intelligence graph. Why save your profile?
                </p>

                <div className="space-y-5 mb-10">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Persistent Intelligence</h4>
                      <p className="text-zinc-500 text-sm">Your preferences sync automatically across all your devices.</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h4 className="text-white font-medium mb-1">Zero-Trust Security</h4>
                      <p className="text-zinc-500 text-sm">Your profile settings are securely encrypted and totally private.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <button
                    onClick={handleLogin}
                    className="w-full relative group overflow-hidden bg-white text-black px-6 py-4 rounded-xl font-medium transition-all hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-blue-100 to-purple-100 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="relative flex items-center justify-center space-x-3">
                      <svg viewBox="0 0 24 24" className="w-5 h-5">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                      </svg>
                      <span>Sign In with Google</span>
                    </div>
                  </button>

                  <button
                    onClick={handleGuest}
                    className="w-full px-6 py-4 rounded-xl font-medium text-zinc-400 hover:text-white transition-colors flex items-center justify-center space-x-2 border border-transparent hover:border-zinc-800"
                  >
                    <span>Continue as Guest</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

