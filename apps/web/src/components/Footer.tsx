import React from 'react';
import { Sparkles, Compass, Users, Calendar, ArrowRight, Film } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-white/[0.08] bg-[#050507] mt-24 text-[#c8c8d8] text-sm py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Bento Cluster */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-white/[0.08]">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#f24c27] flex items-center justify-center font-black text-black text-xs shadow-md shadow-[#f24c27]/30">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="font-extrabold text-white text-base tracking-tight uppercase font-mono">CineMind AI</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#f24c27]/15 text-[#f24c27] border border-[#f24c27]/40 font-bold">
                CORE ENGINE
              </span>
            </div>
            <p className="text-sm text-[#a0a0ab] leading-relaxed font-normal">
              Autonomous cinematic discovery platform formulating recommendations as state-space search, constraint satisfaction, and adversarial game theory.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs text-emerald-400 font-bold">Core AI Engines Active</span>
            </div>
          </div>

          {/* Core Algorithms */}
          <div>
            <h4 className="tracked-caps text-white mb-4 flex items-center gap-2 font-bold">
              <Sparkles className="w-4 h-4 text-[#f24c27]" /> Core Methodologies
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8b8cb] font-normal">
              <li className="hover:text-white transition">• A* State-Space Search (f = g + h)</li>
              <li className="hover:text-white transition">• CSP with Forward Checking Pruning</li>
              <li className="hover:text-white transition">• Simulated Annealing Playlist Shuffler</li>
              <li className="hover:text-white transition">• 2-Player Minimax with Alpha-Beta</li>
            </ul>
          </div>

          {/* Quick Features */}
          <div>
            <h4 className="tracked-caps text-white mb-4 flex items-center gap-2 font-bold">
              <Film className="w-4 h-4 text-[#f24c27]" /> Platform Features
            </h4>
            <ul className="space-y-2.5 text-sm text-[#b8b8cb] font-normal">
              <li className="hover:text-white transition"><Link to="/discover">Mood-Aware Discovery</Link></li>
              <li className="hover:text-white transition"><Link to="/watchlist">Smart Watchlist Sequencer</Link></li>
              <li className="hover:text-white transition"><Link to="/watch-party">Couch War Consensus</Link></li>
              <li className="hover:text-white transition"><Link to="/planner">Marathon Goal Planner</Link></li>
            </ul>
          </div>

          {/* Quick Direct Start */}
          <div className="space-y-3.5">
            <h4 className="tracked-caps text-white mb-4 flex items-center gap-2 font-bold">
              <Compass className="w-4 h-4 text-[#f24c27]" /> Quick Discovery
            </h4>
            <p className="text-sm text-[#a0a0ab] leading-relaxed font-normal">
              Pick your mood, specify your available minutes, and let the A* search agent generate your playlist.
            </p>
            <Link
              to="/discover"
              className="btn-evo-accent !text-xs !py-3 !px-6 inline-flex items-center gap-2 shadow-lg"
            >
              <span>Launch Discover Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8e8e9e] font-medium">
          <p>© 2026 CineMind AI. Designed with EvoAir luxury glass aesthetic & Ahmedabad OS architecture.</p>
          <div className="flex items-center gap-5">
            <Link to="/discover" className="hover:text-white transition">Discover</Link>
            <Link to="/planner" className="hover:text-white transition">Marathon Planner</Link>
            <Link to="/watch-party" className="hover:text-white transition">Couch War</Link>
            <Link to="/watchlist" className="hover:text-white transition">Watchlist</Link>
          </div>
        </div>

      </div>
    </footer>
  );
};
