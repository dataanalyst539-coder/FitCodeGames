import React from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { fetchAllResults } from './services/sheetsService';
import { Participant, cn } from './constants';
import Navbar from './components/Navbar';
import Leaderboard from './components/Leaderboard';
import ParticipantDetail from './components/ParticipantDetail';
import LiveLeaderboard from './components/LiveLeaderboard';
import { Loader2, AlertCircle } from 'lucide-react';

function AppContent() {
  const [participants, setParticipants] = React.useState<Participant[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const location = useLocation();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchAllResults();
      setParticipants(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load leaderboard data. Please check your API key.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(loadData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const isLiveMode = location.pathname === '/live';

  if (loading && participants.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <Loader2 className="w-12 h-12 text-maroon animate-spin mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-widest">Loading Results</h2>
        <p className="text-gray-500 mt-2 uppercase text-xs tracking-[0.3em]">Connecting to Fit Code Database</p>
      </div>
    );
  }

  if (error && participants.length === 0) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white p-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-black uppercase tracking-widest">Connection Error</h2>
        <p className="text-gray-500 mt-2 text-center max-w-md">{error}</p>
        <button 
          onClick={loadData}
          className="mt-8 px-8 py-3 bg-maroon rounded-full font-black uppercase tracking-widest hover:scale-105 transition-transform"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className={cn("min-h-screen", isLiveMode ? "bg-black" : "bg-[#050505]")}>
      {!isLiveMode && <Navbar />}
      <main className={cn(isLiveMode ? "" : "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12")}>
        <Routes>
          <Route path="/" element={<Leaderboard participants={participants} />} />
          <Route path="/participant/:name" element={<ParticipantDetail participants={participants} />} />
          <Route path="/live" element={<LiveLeaderboard participants={participants} />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}
