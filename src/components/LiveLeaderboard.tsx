import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, Clock, Users, Calendar, Pause, Play, X } from 'lucide-react';
import { Participant, cn } from '../constants';
import { Link } from 'react-router-dom';
import { LOGO_WHITE_BASE64 } from '../assets';

interface LiveLeaderboardProps {
  participants: Participant[];
}

export default function LiveLeaderboard({ participants }: LiveLeaderboardProps) {
  const [categoryIdx, setCategoryIdx] = React.useState(0);
  const [isPaused, setIsPaused] = React.useState(false);
  const [selectedRace, setSelectedRace] = React.useState('All');
  const [selectedGender, setSelectedGender] = React.useState<'All' | 'Male' | 'Female'>('All');
  const [selectedLevel, setSelectedLevel] = React.useState<'All' | 'Intermediate' | 'Advanced'>('All');
  
  const categories = [
    { name: 'Advanced Male', level: 'Advanced', gender: 'Male' },
    { name: 'Advanced Female', level: 'Advanced', gender: 'Female' },
    { name: 'Intermediate Male', level: 'Intermediate', gender: 'Male' },
    { name: 'Intermediate Female', level: 'Intermediate', gender: 'Female' },
  ];

  const races = Array.from(new Set(participants.map(p => p.tabName))).sort().reverse();

  const currentCategory = categories[categoryIdx];
  
  // If user has manually selected filters, use them. Otherwise, use the auto-cycling category.
  const isAllSelected = selectedLevel === 'All' && selectedGender === 'All';
  
  const effectiveLevel = isAllSelected ? currentCategory.level : selectedLevel;
  const effectiveGender = isAllSelected ? currentCategory.gender : selectedGender;
  
  const effectiveName = !isAllSelected
    ? `${selectedLevel === 'All' ? 'All Divisions' : selectedLevel} ${selectedGender === 'All' ? 'All Genders' : selectedGender}`.trim()
    : currentCategory.name;

  const filtered = participants
    .filter(p => 
      (effectiveLevel === 'All' || p.level === effectiveLevel) && 
      (effectiveGender === 'All' || p.gender === effectiveGender) &&
      (selectedRace === 'All' || p.tabName === selectedRace)
    )
    .sort((a, b) => a.seconds - b.seconds);

  // Auto-cycle categories only if "All" is selected (default state)
  React.useEffect(() => {
    if (isPaused || !isAllSelected) return;
    const interval = setInterval(() => {
      setCategoryIdx((prev) => (prev + 1) % categories.length);
    }, 15000);
    return () => clearInterval(interval);
  }, [isPaused, isAllSelected]);

  // Scrolling logic: We'll use a CSS animation for continuous scroll if there are many participants
  const scrollDuration = Math.max(20, filtered.length * 2);

  return (
    <div className="fixed inset-0 bg-[#0a0a0a] text-white overflow-hidden flex flex-col font-sans">
      {/* Top Navigation / Header */}
      <div className="bg-[#0f0f0f] border-b border-maroon/50 px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row justify-between items-center gap-4 z-50 shadow-2xl">
        <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-16 sm:h-16 flex items-center justify-center">
              <img 
                src={LOGO_WHITE_BASE64} 
                alt="Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-4xl font-black tracking-tighter leading-none text-white italic">FIT CODE</h1>
              <p className="text-[7px] sm:text-[10px] font-bold uppercase tracking-[0.4em] text-maroon mt-0.5 sm:mt-1">Your Fitness Solution</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Race Select for Mobile */}
            <select 
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="sm:hidden bg-black border border-white/10 rounded px-2 py-1 text-[10px] font-bold text-white focus:outline-none focus:border-maroon max-w-[80px]"
            >
              <option value="All">Races</option>
              {races.map(r => <option key={r} value={r}>{r}</option>)}
            </select>

            {/* Mobile Controls */}
            <div className="flex sm:hidden gap-1">
              <button 
                onClick={() => setIsPaused(!isPaused)}
                className="p-1.5 bg-black border border-white/10 rounded hover:bg-maroon transition-colors"
              >
                {isPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3 fill-current" />}
              </button>
              <Link 
                to="/" 
                className="p-1.5 bg-black border border-white/10 rounded text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
          
        <div className="flex flex-col lg:flex-row items-center lg:items-center gap-4 w-full lg:w-auto">
          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
            {(['All', 'Male', 'Female'] as const).map((g) => (
              <button
                key={g}
                onClick={() => setSelectedGender(g)}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedGender === g ? "bg-maroon text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                {g}
              </button>
            ))}
          </div>

          <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-full sm:w-auto overflow-x-auto no-scrollbar shrink-0">
            {(['All', 'Intermediate', 'Advanced'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setSelectedLevel(l)}
                className={cn(
                  "flex-1 sm:flex-none px-4 py-2 rounded text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  selectedLevel === l ? "bg-maroon text-white shadow-lg" : "text-white/40 hover:text-white/60"
                )}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-6">
          <div className="text-right hidden md:block">
            <div className="text-[10px] font-black uppercase tracking-widest text-white/30 mb-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}
            </div>
            <select 
              value={selectedRace}
              onChange={(e) => setSelectedRace(e.target.value)}
              className="bg-black border border-white/10 rounded px-3 py-1 text-xs font-bold text-white focus:outline-none focus:border-maroon"
            >
              <option value="All">All Races</option>
              {races.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setIsPaused(!isPaused)}
              className="p-2 bg-black border border-white/10 rounded hover:bg-maroon transition-colors"
            >
              {isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
            </button>
            <Link 
              to="/" 
              className="flex items-center gap-2 px-4 py-2 bg-black border border-white/10 rounded text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-colors"
            >
              <X className="w-4 h-4" />
              Exit TV Mode
            </Link>
          </div>
        </div>
      </div>

      {/* Category Banner */}
      <div className="bg-maroon/10 py-3 sm:py-4 px-4 sm:px-8 border-b border-white/5 flex justify-center">
        <motion.h2 
          key={effectiveName}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-maroon italic text-center"
        >
          {effectiveName}
        </motion.h2>
      </div>

      {/* Scrolling Leaderboard Area */}
      <div className="flex-1 relative overflow-hidden bg-black">
        <AnimatePresence mode="wait">
          <motion.div
            key={effectiveName + selectedRace}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0"
          >
            {filtered.length > 0 ? (
              <div 
                className="flex flex-col"
                style={{
                  animation: !isPaused ? `scrollUp ${scrollDuration}s linear infinite` : 'none'
                }}
              >
                {/* Double the list for seamless loop if scrolling */}
                {[...filtered, ...filtered].map((p, idx) => (
                  <div 
                    key={`${p.name}-${p.tabName}-${idx}`}
                    className="flex items-center justify-between px-6 sm:px-12 py-6 sm:py-8 border-b border-white/5 hover:bg-white/5 transition-colors"
                  >
                    <div className="flex items-center gap-6 sm:gap-12">
                      <span className={cn(
                        "text-3xl sm:text-6xl font-black w-12 sm:w-24 italic",
                        idx % filtered.length === 0 ? "text-yellow-500" :
                        idx % filtered.length === 1 ? "text-gray-400" :
                        idx % filtered.length === 2 ? "text-amber-700" :
                        "text-white/20"
                      )}>
                        {(idx % filtered.length) + 1}
                      </span>
                      <div>
                        <div className="text-2xl sm:text-5xl font-black uppercase tracking-tight leading-none mb-2">{p.name}</div>
                        <div className="flex gap-4 sm:gap-6">
                          <span className="text-xs sm:text-lg font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-maroon" />
                            {p.ageGroup}
                          </span>
                          <span className="text-xs sm:text-lg font-bold uppercase tracking-widest text-white/40 flex items-center gap-2">
                            <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-maroon" />
                            {p.tabName}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-3xl sm:text-7xl font-black font-mono tracking-tighter text-maroon">
                      {p.completionTime}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
                <Trophy className="w-24 h-24 text-white/5" />
                <div>
                  <div className="text-4xl font-black text-white/20 uppercase tracking-widest">No Results Found</div>
                  <div className="text-xl text-white/10 uppercase tracking-[0.5em] mt-2">Check the filters or wait for updates</div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Ticker / Info */}
      <div className="bg-[#0f0f0f] border-t border-maroon/50 p-6 flex justify-between items-center z-50">
        <div className="flex items-center gap-4">
          <div className="bg-maroon px-3 py-1 rounded text-[10px] font-black uppercase tracking-widest">Live</div>
          <div className="text-sm font-bold uppercase tracking-widest text-white/60">Fit Code Official Leaderboard</div>
        </div>
        
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            <span className="text-xs font-black uppercase tracking-widest text-white/40">Database Connected</span>
          </div>
          <div className="text-2xl font-black font-mono text-white/80">
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
