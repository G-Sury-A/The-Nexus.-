import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Briefcase, Trophy, Film, Users, Globe2, User, X } from 'lucide-react';
import { DailyBriefing, UserPreferences } from '../types';

interface NexusWebProps {
  briefing: DailyBriefing;
  prefs: UserPreferences;
}

const icons: Record<string, any> = {
  Job: Briefcase,
  Sports: Trophy,
  Entertainment: Film,
  Society: Users,
  Geopolitics: Globe2
};

export function NexusWeb({ briefing, prefs }: NexusWebProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [selectedNode, setSelectedNode] = useState<number | null>(null);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    
    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  const nodes = briefing.chain;
  const isMobile = dimensions.width < 768;

  // Configuration for the radial layout
  // When a node is selected, shift the web slightly up
  const cx = dimensions.width / 2;
  const cy = dimensions.height / 2 - (selectedNode !== null ? (isMobile ? 100 : 50) : 0);
  const radius = isMobile ? Math.min(cx, cy) * 0.7 : Math.min(cx, cy) * 0.65;

  const getCoordinates = (index: number, total: number) => {
    const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle)
    };
  };

  const positions = nodes.map((_, i) => getCoordinates(i, nodes.length));

  // Determine path visibility
  const isPathActive = (pathIndex: number) => {
    if (selectedNode === null) return false;
    const prevNode = (selectedNode - 1 + nodes.length) % nodes.length;
    // Highlight the path leading INTO the selected node, and OUT of the selected node
    return pathIndex === prevNode || pathIndex === selectedNode;
  };

  const isNodeActive = (nodeIndex: number) => {
    if (selectedNode === null) return true; // all active if none selected
    const prevNode = (selectedNode - 1 + nodes.length) % nodes.length;
    const nextNode = (selectedNode + 1) % nodes.length;
    return nodeIndex === selectedNode || nodeIndex === prevNode || nodeIndex === nextNode;
  };

  const paths = positions.map((pos, i) => {
    const nextPos = positions[(i + 1) % positions.length];
    return {
      id: `path-${i}`,
      seqPath: `M ${pos.x} ${pos.y} Q ${cx} ${cy} ${nextPos.x} ${nextPos.y}`,
      centerPath: `M ${cx} ${cy} L ${pos.x} ${pos.y}`,
      isActive: isPathActive(i)
    };
  });

  if (dimensions.width === 0) return <div ref={containerRef} className="w-full h-[600px] md:h-[800px]" />;

  const activeNodeData = selectedNode !== null ? nodes[selectedNode] : null;
  const prevNodeData = selectedNode !== null ? nodes[(selectedNode - 1 + nodes.length) % nodes.length] : null;
  const nextNodeData = selectedNode !== null ? nodes[(selectedNode + 1) % nodes.length] : null;

  return (
    <div ref={containerRef} className="w-full h-[700px] md:h-[800px] relative transition-all duration-700 ease-out">
      <svg className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-700">
        {paths.map((p, i) => (
          <g key={p.id}>
            {/* Center to Node connections */}
            <motion.path
              initial={false}
              animate={{ 
                opacity: selectedNode === null ? 0.2 : (selectedNode === i ? 0.4 : 0.05),
                pathLength: 1
              }}
              transition={{ duration: 0.5 }}
              d={p.centerPath}
              stroke="white"
              strokeWidth="1"
              strokeDasharray="4 4"
              fill="none"
            />
            {/* Sequential Causality connections */}
            <motion.path
              initial={false}
              animate={{ 
                opacity: selectedNode === null ? 0.4 : (p.isActive ? 1 : 0.05),
                strokeWidth: selectedNode === null ? 2 : (p.isActive ? 4 : 1)
              }}
              transition={{ duration: 0.5 }}
              d={p.seqPath}
              stroke={p.isActive ? "url(#gradient-active)" : "url(#gradient)"}
              fill="none"
            />
            {/* Animated dot moving along the web */}
            <motion.circle
              r={p.isActive ? "5" : "3"}
              fill="#3b82f6"
              initial={{ offsetDistance: "0%", opacity: 0 }}
              animate={{ 
                offsetDistance: "100%", 
                opacity: selectedNode === null ? [0, 1, 1, 0] : (p.isActive ? [0, 1, 1, 0] : 0)
              }}
              transition={{
                duration: p.isActive ? 2 : 3,
                delay: selectedNode === null ? (1 + i * 0.3) : 0,
                repeat: Infinity,
                repeatDelay: p.isActive ? 0.5 : 2,
                ease: "linear"
              }}
              style={{ offsetPath: `path('${p.seqPath}')` } as any}
            />
          </g>
        ))}
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#a855f7" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ec4899" stopOpacity="0.5" />
          </linearGradient>
          <linearGradient id="gradient-active" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60a5fa" />
            <stop offset="50%" stopColor="#c084fc" />
            <stop offset="100%" stopColor="#f472b6" />
          </linearGradient>
        </defs>
      </svg>

      {/* Center "You" Node */}
      <motion.div
        animate={{ 
          left: cx, 
          top: cy,
          opacity: selectedNode === null ? 1 : 0.3
        }}
        transition={{ type: 'spring', bounce: 0.2, duration: 0.7 }}
        className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center justify-center group"
      >
        <div className="w-16 h-16 md:w-20 md:h-20 bg-black rounded-full border-2 border-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.4)] flex items-center justify-center z-10 relative">
          <User className="w-8 h-8 text-blue-400" />
          <div className="absolute inset-0 rounded-full animate-ping opacity-20 border border-blue-500" style={{ animationDuration: '3s' }}></div>
        </div>
        <span className="mt-3 text-sm font-medium tracking-tight bg-zinc-900/80 px-3 py-1 rounded-full border border-zinc-800 backdrop-blur-md">
          {prefs.name}
        </span>
      </motion.div>

      {/* Surrounding Nodes */}
      {nodes.map((node, i) => {
        const Icon = icons[node.category];
        const active = isNodeActive(i);
        const isSelected = selectedNode === i;

        return (
          <motion.div
            key={node.id}
            animate={{ 
              left: positions[i].x, 
              top: positions[i].y,
              scale: isSelected ? 1.2 : (active ? 1 : 0.8),
              opacity: active ? 1 : 0.2
            }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.7 }}
            onClick={() => setSelectedNode(isSelected ? null : i)}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 z-30 group cursor-pointer"
          >
            {/* The Node Icon Bubble */}
            <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full border-2 flex items-center justify-center transition-all relative z-10 bg-black shadow-lg
              ${isSelected 
                ? 'border-blue-400 text-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.6)]' 
                : 'border-zinc-700 text-zinc-300 hover:border-blue-500/50 hover:text-blue-400'
              }
            `}>
              <Icon className="w-5 h-5 md:w-6 md:h-6" />
            </div>

            {/* Permanent Label (mobile friendly) visible when unselected or directly related */}
            <div className={`absolute top-full mt-2 left-1/2 transform -translate-x-1/2 w-max text-center max-w-[120px] transition-opacity duration-300 ${isSelected ? 'opacity-0' : 'opacity-100'}`}>
              <span className={`font-mono text-[10px] md:text-xs font-medium px-2 py-0.5 rounded-full block backdrop-blur-md
                ${selectedNode === null ? 'bg-black/50 text-zinc-400' : 'bg-blue-900/40 text-blue-300 border border-blue-800/50'}`}>
                {node.category}
              </span>
            </div>
          </motion.div>
        );
      })}

      {/* Central Interactive Panel for Selected Node */}
      <AnimatePresence>
        {selectedNode !== null && activeNodeData && prevNodeData && nextNodeData && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4 }}
            className="absolute bottom-4 sm:bottom-12 left-1/2 transform -translate-x-1/2 w-[95%] sm:w-[85%] max-w-2xl bg-zinc-950/90 backdrop-blur-xl border border-zinc-700/50 rounded-3xl p-5 sm:p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)] z-50 overflow-hidden"
          >
            {/* Close Button */}
            <button 
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 p-2 bg-zinc-900/80 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Glowing Accent */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-80" />

            {/* Incoming Connection Context */}
            <div className="text-xs sm:text-sm text-zinc-400 mb-5 pb-5 border-b border-zinc-800/80 flex flex-col sm:flex-row sm:items-center">
               <div className="flex items-center space-x-2 text-purple-400 font-medium mb-1 sm:mb-0 mr-4 shrink-0">
                 <icons.Geopolitics className="w-4 h-4" /> {/* Generic link icon visual, could use dynamic */}
                 <span>Driven by {prevNodeData.category}:</span>
               </div>
               <span className="text-zinc-300 italic flex-grow">"{prevNodeData.causalLinkToNext}"</span>
            </div>

            {/* Primary Content */}
            <div className="mb-6 flex space-x-4">
              <div className="hidden sm:flex mt-1 shrink-0 w-12 h-12 bg-blue-500/10 rounded-full border border-blue-500/20 items-center justify-center text-blue-400">
                {(() => {
                  const ActiveIcon = icons[activeNodeData.category];
                  return <ActiveIcon className="w-6 h-6" />;
                })()}
              </div>
              <div>
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-widest text-blue-400 mb-1 block">
                  {activeNodeData.category}
                </span>
                <h2 className="text-xl sm:text-2xl font-medium text-white mb-3 tracking-tight">
                  {activeNodeData.headline}
                </h2>
                
                {prefs.notificationStyle === 'Bullets' ? (
                  <ul className="list-disc pl-5 text-zinc-300 space-y-1.5 text-sm sm:text-base">
                    {activeNodeData.bullets.map((b, idx) => <li key={idx}>{b}</li>)}
                  </ul>
                ) : prefs.notificationStyle === 'Data-driven' ? (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {activeNodeData.dataPoints.map((dp, i) => (
                      <span key={i} className="bg-blue-900/20 text-blue-300 text-sm font-mono px-3 py-1.5 rounded-lg border border-blue-800/30">
                        {dp}
                      </span>
                    ))}
                    <p className="text-zinc-400 mt-3 text-sm">{activeNodeData.summary}</p>
                  </div>
                ) : (
                  <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
                    {activeNodeData.summary}
                  </p>
                )}
              </div>
            </div>

            {/* Outgoing Connection Context */}
            <div className="text-xs sm:text-sm text-zinc-400 pt-5 border-t border-zinc-800/80 flex flex-col sm:flex-row sm:items-center">
               <div className="flex items-center space-x-2 text-pink-400 font-medium mb-1 sm:mb-0 mr-4 shrink-0">
                 <span>Leads to {nextNodeData.category}:</span>
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
               </div>
               <span className="text-zinc-300 italic flex-grow">"{activeNodeData.causalLinkToNext}"</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
