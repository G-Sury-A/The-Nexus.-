import React, { useState } from 'react';
import { Onboarding } from './components/Onboarding';
import { Dashboard } from './components/Dashboard';
import { UserPreferences, DailyBriefing } from './types';
import { AnimatePresence, motion } from 'motion/react';
import { generateBriefing } from './services/newsService';

export default function App() {
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [briefing, setBriefing] = useState<DailyBriefing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCompleteOnboarding = async (prefs: UserPreferences) => {
    setPreferences(prefs);
    setIsGenerating(true);
    
    // Use the algorithm-driven news generator
    const data = await generateBriefing(prefs);
    setBriefing(data);
    
    setIsGenerating(false);
  };

  return (
    <div className="bg-black text-white min-h-screen">
      <AnimatePresence mode="wait">
        {!preferences ? (
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
            <p className="text-sm text-zinc-500">Algorithmically correlating Geopolitics to {preferences.jobIndustry} and local Sports...</p>
          </motion.div>
        ) : briefing ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <Dashboard 
              prefs={preferences} 
              briefing={briefing} 
              onReset={() => {
                setPreferences(null);
                setBriefing(null);
              }} 
            />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

