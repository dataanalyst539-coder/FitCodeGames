import React from 'react';
import { Search, Filter, ChevronRight, TrendingUp, TrendingDown, Minus, Trophy, Calendar, Users } from 'lucide-react';
import { Participant, cn, formatSecondsToTime } from '../constants';
import { Link } from 'react-router-dom';

interface LeaderboardProps {
  participants: Participant[];
}

export default function Leaderboard({ participants }: LeaderboardProps) {
  const [search, setSearch] = React.useState('');
  const [division, setDivision] = React.useState('All');
  const [gender, setGender] = React.useState('All');
  const [ageGroup, setAgeGroup] = React.useState('All');
  const [race, setRace] = React.useState('All');

  const races = Array.from(new Set(participants.map(p => p.tabName))).sort().reverse();
  const ageGroups = Array.from(new Set(participants.map(p => p.ageGroup))).sort();

  const filtered = participants.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesDivision = division === 'All' || p.level === division;
    const matchesGender = gender === 'All' || p.gender === gender;
    const matchesAgeGroup = ageGroup === 'All' || p.ageGroup === ageGroup;
    const matchesRace = race === 'All' || p.tabName === race;
    return matchesSearch && matchesDivision && matchesGender && matchesAgeGroup && matchesRace;
  });

  const sorted = [...filtered].sort((a, b) => a.seconds - b.seconds);

  return (
    <div className="space-y-8">
      {/* Race Selection Tabs */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setRace('All')}
          className={cn(
            "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
            race === 'All' ? "bg-maroon text-white shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
          )}
        >
          All Races
        </button>
        {races.map(r => (
          <button
            key={r}
            onClick={() => setRace(r)}
            className={cn(
              "px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all",
              race === r ? "bg-maroon text-white shadow-lg" : "bg-white/5 text-white/40 hover:bg-white/10"
            )}
          >
            {r}
          </button>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-[#111] border border-white/5 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                placeholder="Search athlete..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-black/40 border border-white/10 rounded-xl focus:outline-none focus:border-maroon text-white placeholder:text-white/20 text-sm font-bold"
              />
            </div>

            <select
              value={ageGroup}
              onChange={(e) => setAgeGroup(e.target.value)}
              className="bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-maroon text-sm font-bold"
            >
              <option value="All">All Age Groups</option>
              {ageGroups.map(ag => (
                <option key={ag} value={ag}>{ag}</option>
              ))}
            </select>

            <div className="flex items-center justify-end text-[10px] font-black uppercase tracking-widest text-white/20 pr-2 lg:col-span-2">
              {sorted.length} Results
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Gender Filter */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Gender</span>
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {(['All', 'Male', 'Female'] as const).map((g) => (
                  <button
                    key={g}
                    onClick={() => setGender(g)}
                    className={cn(
                      "px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      gender === g ? "bg-maroon text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Division Filter */}
            <div className="space-y-3">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/20 ml-1">Division</span>
              <div className="flex gap-1 bg-black/40 p-1 rounded-lg border border-white/5 w-fit overflow-x-auto no-scrollbar">
                {(['All', 'Intermediate', 'Advanced'] as const).map((l) => (
                  <button
                    key={l}
                    onClick={() => setDivision(l)}
                    className={cn(
                      "px-6 py-2 rounded text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                      division === l ? "bg-maroon text-white shadow-lg" : "text-white/40 hover:text-white/60"
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl overflow-hidden shadow-2xl">
        {/* Mobile Card View */}
        <div className="md:hidden divide-y divide-white/5">
          {sorted.map((p, idx) => (
            <div key={`${p.name}-${p.tabName}`} className="p-6 space-y-4 hover:bg-white/2 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-black text-maroon italic">#{idx + 1}</span>
                  <Link to={`/participant/${encodeURIComponent(p.name)}`} className="font-black text-xl uppercase tracking-tight text-white">
                    {p.name}
                  </Link>
                </div>
                <Link
                  to={`/participant/${encodeURIComponent(p.name)}`}
                  className="p-2 rounded-lg bg-white/5 border border-white/10 text-white"
                >
                  <ChevronRight className="w-5 h-5" />
                </Link>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Race</div>
                  <div className="text-xs font-bold text-white/60 uppercase">{p.tabName}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Time</div>
                  <div className="text-lg font-black font-mono text-white">{p.completionTime}</div>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Division</div>
                  <span className={cn(
                    "px-2 py-0.5 rounded border text-[9px] font-black uppercase tracking-widest inline-block",
                    p.level === 'Advanced' ? "border-maroon/50 text-maroon bg-maroon/5" : "border-blue-900/50 text-blue-400 bg-blue-900/5"
                  )}>
                    {p.level}
                  </span>
                </div>
                <div>
                  <div className="text-[10px] font-black uppercase tracking-widest text-white/20 mb-1">Age Group</div>
                  <div className="text-xs font-bold text-white/60">{p.ageGroup}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/2 border-b border-white/5">
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-maroon">#</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Athlete</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Race</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Division</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Gender</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Age</th>
                <th className="px-6 lg:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">Time</th>
                <th className="px-6 lg:px-8 py-5"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {sorted.map((p, idx) => (
                <tr key={`${p.name}-${p.tabName}`} className="hover:bg-white/2 transition-colors group">
                  <td className="px-6 lg:px-8 py-6">
                    <span className="text-xl font-black text-white">{idx + 1}</span>
                  </td>
                  <td className="px-6 lg:px-8 py-6">
                    <Link to={`/participant/${encodeURIComponent(p.name)}`} className="font-black text-lg uppercase tracking-tight text-white group-hover:text-maroon transition-colors">
                      {p.name}
                    </Link>
                  </td>
                  <td className="px-6 lg:px-8 py-6 text-sm font-bold text-white/40 uppercase tracking-widest">{p.tabName}</td>
                  <td className="px-6 lg:px-8 py-6">
                    <span className={cn(
                      "px-3 py-1 rounded border text-[10px] font-black uppercase tracking-widest",
                      p.level === 'Advanced' ? "border-maroon/50 text-maroon bg-maroon/5" : "border-blue-900/50 text-blue-400 bg-blue-900/5"
                    )}>
                      {p.level}
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-6">
                    <span className="px-3 py-1 rounded border border-white/10 text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/5">
                      {p.gender}
                    </span>
                  </td>
                  <td className="px-6 lg:px-8 py-6 text-sm font-bold text-white/60">{p.ageGroup}</td>
                  <td className="px-6 lg:px-8 py-6 font-mono text-xl font-black text-white">{p.completionTime}</td>
                  <td className="px-6 lg:px-8 py-6 text-right">
                    <Link
                      to={`/participant/${encodeURIComponent(p.name)}`}
                      className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white hover:bg-maroon hover:border-maroon transition-all"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div className="p-20 text-center">
              <div className="text-4xl font-black text-white/5 uppercase tracking-widest mb-4">No Results</div>
              <p className="text-white/20 font-bold uppercase tracking-widest text-sm">Try adjusting your filters</p>
            </div>
          )}
        </div>
      </div>
      <style>{`
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
