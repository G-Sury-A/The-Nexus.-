import React, { useState, useEffect } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { UserPreferences, DailyBriefing } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { generateBriefing } from './services/newsService';
import { useAuth } from './components/AuthContext';
import { getUserPreferences, saveUserPreferences } from './services/userService';
import { Shield, Sparkles, BrainCircuit, ArrowRight } from 'lucide-react';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [showAuthPopup, setShowAuthPopup] = useState(false);
  const [pendingPrefs, setPendingPrefs] = useState<UserPreferences | null>(null);

  const { user, loading, login, logout } = useAuth();
  const [initialFetchDone, setInitialFetchDone] = useState(false);

  useEffect(() => {
    // Check if we have pending prefs from a redirect login
    const savedPendingPrefs = localStorage.getItem('pending_nexus_prefs');
    if (savedPendingPrefs && user) {
      const prefs = JSON.parse(savedPendingPrefs);
      setPreferences(prefs);
      saveUserPreferences(user.uid, prefs, true);
      generate(prefs);
      localStorage.removeItem('pending_nexus_prefs');
      setShowAuthPopup(false);
      setInitialFetchDone(true);
      return;
    }

    async function loadUserPrefs() {
      if (user) {
        const prefs = await getUserPreferences(user.uid);
        if (prefs) {
          setPreferences(prefs);
          
          setIsGenerating(true);
          try {
            const data = await generateBriefing(prefs);
            setBriefing(data);
          } catch(err) {
             console.error("error making brief", err);
          } finally {
            setIsGenerating(false);
          }
        }
      }
      setInitialFetchDone(true);
    }
    
    if (!loading) {
       loadUserPrefs();
    }
  }, [user, loading]);

  const handleCompleteOnboarding = async (prefs: UserPreferences) => {
    if (user) {
      setPreferences(prefs);
      await saveUserPreferences(user.uid, prefs, true);
      generate(prefs);
    } else {
      setPendingPrefs(prefs);
      setShowAuthPopup(true);
    }
  };

  const generate = async (prefs: UserPreferences) => {
    setIsGenerating(true);
    try {
      const data = await generateBriefing(prefs);
      setBriefing(data);
    } catch(err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleLogin = async () => {
    if (!pendingPrefs) return;
    try {
      // Save pending prefs in case of redirect
      localStorage.setItem('pending_nexus_prefs', JSON.stringify(pendingPrefs));

      const loggedUser = await login();
      if (loggedUser) {
        setShowAuthPopup(false);
        setPreferences(pendingPrefs);
        await saveUserPreferences(loggedUser.uid, pendingPrefs, true);
        generate(pendingPrefs);
        localStorage.removeItem('pending_nexus_prefs');
      }
    } catch (e) {
      console.error("Login canceled", e);
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
        ) : isGenerating ? (
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

