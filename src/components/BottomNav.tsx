import React from 'react';
import { User, PlusCircle, Trophy } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'passport' | 'matches' | 'leaderboard';
  setActiveTab: (tab: 'passport' | 'matches' | 'leaderboard') => void;
  pendingMatchesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  setActiveTab,
  pendingMatchesCount = 0,
}) => {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B1D3A]/95 backdrop-blur-lg border-t border-[#3B3B3B] pb-safe">
      <div className="grid grid-cols-3 h-15 items-center px-2 max-w-md mx-auto">
        
        {/* Tab 1: Paspor Atlet */}
        <button
          onClick={() => setActiveTab('passport')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'passport' ? 'text-[#DFCA88]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'passport' ? 'bg-[#C8A75E]/20 text-[#DFCA88]' : ''}`}>
            <User className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Paspor Atlet</span>
        </button>

        {/* Tab 2: Upload Result */}
        <button
          onClick={() => setActiveTab('matches')}
          className={`relative flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'matches' ? 'text-[#DFCA88]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'matches' ? 'bg-[#C8A75E]/20 text-[#DFCA88]' : ''}`}>
            <PlusCircle className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Upload Result</span>
          {pendingMatchesCount > 0 && (
            <span className="absolute top-1 right-6 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8A75E] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8A75E]"></span>
            </span>
          )}
        </button>

        {/* Tab 3: Leaderboard (Poin Atlet DIY) */}
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex flex-col items-center justify-center min-h-[48px] py-1 transition-colors ${
            activeTab === 'leaderboard' ? 'text-[#DFCA88]' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <div className={`p-1 rounded-xl transition-all ${activeTab === 'leaderboard' ? 'bg-[#C8A75E]/20 text-[#DFCA88]' : ''}`}>
            <Trophy className="h-5 w-5" />
          </div>
          <span className="text-[11px] font-semibold mt-0.5 tracking-tight">Leaderboard</span>
        </button>

      </div>
    </nav>
  );
};
