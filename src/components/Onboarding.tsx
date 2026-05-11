import React, { useState } from 'react';
import { motion } from 'motion/react';
import { UserPreferences, NotificationStyle } from '../types';
import { ChevronRight, Check } from 'lucide-react';

interface OnboardingProps {
  onComplete: (prefs: UserPreferences) => void;
}

const STEPS = [
  'Welcome',
  'Job & Industry',
  'Sports',
  'Entertainment',
  'Society',
  'Geopolitics',
  'Delivery Preferences'
];

export function Onboarding({ onComplete }: OnboardingProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [prefs, setPrefs] = useState<UserPreferences>({
    name: '',
    jobIndustry: '',
    favoriteSports: [],
    entertainmentInterests: [],
    societyFocus: [],
    region: '',
    notificationTime: '08:00',
    notificationStyle: 'Bullets'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const nextStep = () => {
    if (stepIndex < STEPS.length - 1) {
      setStepIndex(s => s + 1);
    } else {
      if (isSubmitting) return;
      setIsSubmitting(true);
      onComplete(prefs);
    }
  };

  const updatePref = (key: keyof UserPreferences, value: any) => {
    setPrefs(p => ({ ...p, [key]: value }));
  };

  const toggleArrayPref = (key: keyof UserPreferences, value: string) => {
    setPrefs(p => {
      const current = p[key] as string[];
      if (current.includes(value)) {
        return { ...p, [key]: current.filter(item => item !== value) };
      } else {
        return { ...p, [key]: [...current, value] };
      }
    });
  };

  const isStepValid = () => {
    switch (stepIndex) {
      case 0: return prefs.name.trim().length > 0;
      case 1: return prefs.jobIndustry !== '';
      case 2: return prefs.favoriteSports.length > 0;
      case 3: return prefs.entertainmentInterests.length > 0;
      case 4: return prefs.societyFocus.length > 0;
      case 5: return prefs.region !== '';
      case 6: return true;
      default: return true;
    }
  };

  const SelectionButton = ({ active, onClick, children }: any) => (
    <button
      onClick={onClick}
      className={`px-4 py-3 rounded-lg border text-left flex items-center justify-between transition-all ${
        active ? 'border-primary bg-blue-50/10 ring-2 ring-blue-500/20 text-blue-400' : 'border-zinc-800 hover:border-zinc-600 text-zinc-300'
      }`}
    >
      <span className="font-medium">{children}</span>
      {active && <Check className="w-4 h-4" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 font-sans">
      <div className="w-full max-w-xl">
        {/* Progress bar */}
        <div className="mb-8 flex space-x-2">
          {STEPS.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? 'bg-blue-500' : 'bg-zinc-800'}`} />
          ))}
        </div>

        <motion.div
          key={stepIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-xl space-y-6"
        >
          {stepIndex === 0 && (
            <div className="space-y-4">
              <h1 className="text-3xl font-light tracking-tight">Welcome to The Nexus.</h1>
              <p className="text-zinc-400">Let's curate your personal news web. What should we call you?</p>
              <input
                type="text"
                autoFocus
                value={prefs.name}
                onChange={e => updatePref('name', e.target.value)}
                placeholder="Your Name"
                className="w-full bg-black border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-white text-lg placeholder-zinc-600"
                onKeyDown={e => e.key === 'Enter' && isStepValid() && nextStep()}
              />
            </div>
          )}

          {stepIndex === 1 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">1. Your World of Work</h2>
              <p className="text-zinc-400">Which industry impacts you the most?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Creative Arts'].map(ind => (
                  <SelectionButton 
                    key={ind} 
                    active={prefs.jobIndustry === ind} 
                    onClick={() => updatePref('jobIndustry', ind)}
                  >
                    {ind}
                  </SelectionButton>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 2 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">2. Passions & Sports</h2>
              <p className="text-zinc-400">Select the sports you follow (select multiple).</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {['Football/Soccer', 'Basketball', 'Tennis', 'Motorsport', 'Esports', 'Cricket'].map(sport => (
                  <SelectionButton 
                    key={sport} 
                    active={prefs.favoriteSports.includes(sport)} 
                    onClick={() => toggleArrayPref('favoriteSports', sport)}
                  >
                    {sport}
                  </SelectionButton>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 3 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">3. Entertainment</h2>
              <p className="text-zinc-400">What do you enjoy in your downtime?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {['Movies & TV', 'Gaming', 'Music', 'Literature', 'Theater & Arts', 'Pop Culture'].map(ent => (
                  <SelectionButton 
                    key={ent} 
                    active={prefs.entertainmentInterests.includes(ent)} 
                    onClick={() => toggleArrayPref('entertainmentInterests', ent)}
                  >
                    {ent}
                  </SelectionButton>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 4 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">4. Society & Culture</h2>
              <p className="text-zinc-400">Which societal movements or topics matter to you?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {['Technology & Ethics', 'Environment', 'Economy & Class', 'Urban Development', 'Public Health', 'Human Rights'].map(soc => (
                  <SelectionButton 
                    key={soc} 
                    active={prefs.societyFocus.includes(soc)} 
                    onClick={() => toggleArrayPref('societyFocus', soc)}
                  >
                    {soc}
                  </SelectionButton>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 5 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">5. Global Perspective</h2>
              <p className="text-zinc-400">Which region's geopolitics affect you the most?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                {['North America', 'Europe', 'Asia-Pacific', 'Middle East', 'Latin America', 'Africa'].map(reg => (
                  <SelectionButton 
                    key={reg} 
                    active={prefs.region === reg} 
                    onClick={() => updatePref('region', reg)}
                  >
                    {reg}
                  </SelectionButton>
                ))}
              </div>
            </div>
          )}

          {stepIndex === 6 && (
            <div className="space-y-4">
              <h2 className="text-2xl font-light">6. The Perfect Delivery</h2>
              <p className="text-zinc-400">How and when should we deliver your nexus?</p>
              
              <div className="pt-4 space-y-2">
                <label className="text-sm text-zinc-500 pr-4">Delivery Time</label>
                <input 
                  type="time" 
                  value={prefs.notificationTime}
                  onChange={e => updatePref('notificationTime', e.target.value)}
                  className="bg-black border border-zinc-700 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors text-white w-full sm:w-auto"
                />
              </div>

              <div className="pt-4 space-y-2">
                <label className="text-sm text-zinc-500">Reading Style</label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['Bullets', 'Narrative', 'Data-driven'] as NotificationStyle[]).map(style => (
                    <SelectionButton 
                      key={style} 
                      active={prefs.notificationStyle === style} 
                      onClick={() => updatePref('notificationStyle', style)}
                    >
                      {style}
                    </SelectionButton>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4 border-t border-zinc-800">
            <button
              onClick={nextStep}
              disabled={!isStepValid() || isSubmitting}
              className="bg-white text-black px-6 py-3 rounded-lg font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              <span>{isSubmitting ? 'Saving...' : stepIndex === STEPS.length - 1 ? 'Curate My World' : 'Next'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
