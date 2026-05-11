import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserPreferences, DailyBriefing, NewsNode } from '../types';
import { Briefcase, Trophy, Film, Users, Globe2, Bell, Settings, X, ChevronRight } from 'lucide-react';
import { NexusWeb } from './NexusWeb';

interface DashboardProps {
  prefs: UserPreferences;
  briefing: DailyBriefing;
  onReset: () => void;
}

const icons: Record<string, any> = {
  Job: Briefcase,
  'Job & Industry': Briefcase,
  Sports: Trophy,
  Entertainment: Film,
  Society: Users,
  Geopolitics: Globe2
};

export function Dashboard({ prefs, briefing, onReset }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'brief' | 'web'>('brief'); // Let's default back to brief
  const [selectedArticle, setSelectedArticle] = useState<NewsNode | null>(null);

  // Helper to render content based on selected style
  const renderContent = (node: any) => {

    switch (prefs.notificationStyle) {
      case 'Bullets':
        return (
          <ul className="list-disc pl-5 space-y-1 text-zinc-400 mt-2">
            {node.bullets.map((b: string, i: number) => <li key={i}>{b}</li>)}
          </ul>
        );
      case 'Data-driven':
        return (
          <div className="flex flex-wrap gap-2 mt-3">
            {node.dataPoints.map((dp: string, i: number) => (
              <span key={i} className="bg-zinc-800 text-blue-300 text-xs font-mono px-2 py-1 rounded border border-zinc-700">
                {dp}
              </span>
            ))}
          </div>
        );
      case 'Narrative':
      default:
        // Use a truncated version for the card to encourage clicking
        return <p className="text-zinc-400 mt-2 leading-relaxed line-clamp-3">{node.summary}</p>;
    }
  };

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(168,85,247,0.4)]">
              <Globe2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-semibold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 to-white">The Nexus</span>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1 text-xs px-3 py-1.5 bg-zinc-900 rounded-full border border-zinc-800 text-zinc-400">
              <Bell className="w-3.5 h-3.5" />
              <span>Next drop at {prefs.notificationTime}</span>
            </div>
            <button onClick={onReset} className="p-2 text-zinc-400 hover:text-white transition-colors" title="Settings">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        <div className="mb-10">
          <h1 className="text-4xl sm:text-5xl font-light tracking-tight">Good morning, {prefs.name}.</h1>
          <p className="text-zinc-400 mt-2 text-lg">Here is how the world connects to you today.</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 p-1 bg-zinc-900 rounded-lg w-fit mb-8 border border-zinc-800">
          <button
            onClick={() => setActiveTab('brief')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'brief' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            The Briefing
          </button>
          <button
            onClick={() => setActiveTab('web')}
            className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
              activeTab === 'web' ? 'bg-zinc-800 text-white shadow-sm' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            The Nexus Web
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'brief' ? (
            <motion.div
              key="brief"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 relative"
            >
              {/* Background glow to tie the theme together */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-blue-500/10 via-purple-500/10 to-pink-500/10 blur-[100px] pointer-events-none rounded-full" />
              
              {briefing.chain.map((node, idx) => {
                const Icon = icons[node.category] || Globe2;
                return (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ type: 'spring', bounce: 0.4, duration: 0.8, delay: idx * 0.1 + 0.1 }}
                    key={node.id} 
                    onClick={() => setSelectedArticle(node)}
                    className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 p-6 rounded-3xl hover:-translate-y-1 hover:border-purple-500/40 hover:shadow-[0_10px_40px_rgba(168,85,247,0.2)] cursor-pointer transition-all duration-500 flex flex-col group relative overflow-hidden"
                  >
                    {/* Glowing Nexus border on hover */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    
                    {/* Subtle gradient background wash on hover */}
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-duration-500 pointer-events-none" />

                    <div className="relative z-10 flex flex-col h-full">
                      <div className="flex items-center space-x-3 mb-5">
                        <div className="w-12 h-12 rounded-full bg-black border-2 border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:border-blue-500/50 group-hover:text-blue-400 shadow-inner transition-all duration-300 group-hover:shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className="text-xs font-mono uppercase tracking-widest text-zinc-500 font-medium group-hover:text-zinc-300 transition-colors">
                          {node.category}
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-medium mb-3 leading-snug group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-blue-200 group-hover:to-white transition-all duration-300">
                        {node.headline}
                      </h3>
                      
                      <div className="flex-grow">
                        {renderContent(node)}
                      </div>
                      
                      <div className="mt-6 pt-4 border-t border-zinc-800/80 flex items-center text-xs font-mono tracking-wide font-medium text-zinc-500 group-hover:text-pink-400 transition-colors">
                        <span>Read full summary</span>
                        <ChevronRight className="w-4 h-4 ml-1 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div
              key="web"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4 }}
              className="py-10 -mx-6 sm:mx-0 overflow-hidden"
            >
              <NexusWeb briefing={briefing} prefs={prefs} />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedArticle && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
              onClick={() => setSelectedArticle(null)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 30 }}
                transition={{ type: 'spring', bounce: 0.15, duration: 0.6 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-zinc-900 border border-zinc-700/50 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-[0_0_50px_rgba(0,0,0,0.8)] relative group/modal"
              >
                {/* Glowing Nexus top border for modal */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />
                
                {/* Subtle gradient wash in background of modal */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-pink-500/5 opacity-100 pointer-events-none" />

                <button 
                  onClick={() => setSelectedArticle(null)}
                  className="absolute top-6 right-6 p-2 bg-zinc-800/80 rounded-full hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors z-20"
                >
                  <X className="w-5 h-5" />
                </button>
                
                <div className="p-8 sm:p-10 relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    {(() => {
                       const Icon = icons[selectedArticle.category] || Globe2;
                       return (
                         <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                           <Icon className="w-6 h-6" />
                         </div>
                       );
                    })()}
                    <span className="text-sm font-mono uppercase tracking-widest text-zinc-400 font-medium">
                      {selectedArticle.category}
                    </span>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl font-medium mb-6 leading-tight text-white tracking-tight">
                    {selectedArticle.headline}
                  </h2>
                  
                  <div className="prose prose-invert max-w-none">
                    <p className="text-lg leading-relaxed text-zinc-300 mb-8 font-light">
                      {selectedArticle.summary}
                    </p>
                    
                    {selectedArticle.topArticles && selectedArticle.topArticles.length > 0 && (
                      <div className="mb-8 p-6 bg-zinc-900/50 rounded-2xl border border-zinc-800/80">
                        <h4 className="text-sm uppercase font-mono text-zinc-400 mb-5 tracking-widest">Included Articles</h4>
                        <div className="space-y-5">
                          {selectedArticle.topArticles.map((article, i) => (
                            <div key={i} className="border-l-2 border-zinc-800 pl-4 py-1">
                              <a 
                                href={article.link} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-400 hover:text-blue-300 hover:underline font-medium text-base mb-1 block"
                              >
                                {article.title}
                              </a>
                              <p className="text-zinc-500 text-sm line-clamp-2">{article.summary}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                      <div className="bg-black/40 rounded-2xl p-5 border border-zinc-800/60">
                        <h4 className="text-[11px] uppercase font-mono text-zinc-500 mb-4 tracking-widest">Key Takeaways</h4>
                        <ul className="space-y-3 m-0 p-0 list-none text-zinc-300">
                          {selectedArticle.bullets.map((b, i) => (
                            <li key={i} className="flex items-start text-sm leading-snug">
                              <span className="text-blue-500 mr-2 shrink-0">❖</span>
                              <span>{b}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div className="bg-black/40 rounded-2xl p-5 border border-zinc-800/60">
                        <h4 className="text-[11px] uppercase font-mono text-zinc-500 mb-4 tracking-widest">Data Impact</h4>
                        <div className="flex flex-col space-y-3">
                          {selectedArticle.dataPoints.map((dp, i) => (
                            <div key={i} className="bg-blue-900/10 text-blue-300 text-sm font-mono px-4 py-2.5 rounded-xl border border-blue-800/30 flex items-center shadow-inner">
                              <span className="w-2 h-2 rounded-full bg-blue-500 mr-3 animate-pulse"></span>
                              {dp}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {selectedArticle.causalLinkToNext && (
                      <div className="mt-8 pt-6 border-t border-zinc-800/80">
                        <h4 className="text-[11px] uppercase font-mono text-pink-400 mb-3 tracking-widest flex items-center">
                          <Globe2 className="w-3.5 h-3.5 mr-2" />
                          The Nexus Effect
                        </h4>
                        <p className="text-zinc-400 italic text-sm md:text-base leading-relaxed">
                          {selectedArticle.causalLinkToNext}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

