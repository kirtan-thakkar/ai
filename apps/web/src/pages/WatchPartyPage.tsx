import React, { useState } from 'react';
import { watchPartyApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { 
  Users, 
  Swords, 
  Cpu, 
  CheckCircle2, 
  ArrowRight
} from 'lucide-react';

export const WatchPartyPage: React.FC = () => {
  const [room, setRoom] = useState<any>(null);
  const [recommending, setRecommending] = useState(false);

  // Group members simulation
  const [members] = useState([
    {
      id: 'p1',
      name: 'Player 1 (Alex)',
      likedGenres: ['Sci-Fi', 'Action'],
      dislikedGenres: ['Romance'],
      vetoes: ['Horror'],
      preferredMood: 'energetic'
    },
    {
      id: 'p2',
      name: 'Player 2 (Sam)',
      likedGenres: ['Mystery', 'Thriller', 'Comedy'],
      dislikedGenres: ['Action'],
      vetoes: [],
      preferredMood: 'thoughtful'
    }
  ]);

  const [mode, setMode] = useState<'collaborative_fairness' | 'adversarial_minimax'>('collaborative_fairness');
  const [results, setResults] = useState<any>(null);

  const handleRunRecommendation = async () => {
    setRecommending(true);
    try {
      const roomId = room ? room.id : 'demo_room';
      const res = await watchPartyApi.recommend(roomId, mode);
      setResults(res.data);
    } catch (err) {
      console.error('Group recommend error:', err);
    } finally {
      setRecommending(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-pulse" />
          <span className="tracked-caps text-[#f24c27]">Consensus Engine</span>
          <span className="text-white/20">|</span>
          <span className="text-[#d4d4e2] font-medium">Adversarial Minimax & Group Fairness</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          Couch War & Group Watch Party
        </h1>
        <p className="text-sm sm:text-base text-[#c8c8d8] max-w-2xl mx-auto font-normal leading-relaxed">
          Adversarial Minimax with Alpha-Beta Pruning for 2 viewers, plus Collaborative Max-Min Fairness and Nash Social Welfare for friends.
        </p>
      </div>

      {/* Decision Engine Selection */}
      <div className="evo-card p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <span className="tracked-caps text-[#f24c27] block mb-1">Algorithmic Solver</span>
            <h3 className="text-lg font-bold text-white">Select Decision Engine</h3>
            <p className="text-sm text-[#c8c8d8] font-normal mt-0.5">Choose between academic adversarial game tree or real group fairness.</p>
          </div>

          <div className="flex items-center gap-2 bg-white/[0.04] p-1.5 rounded-full border border-white/[0.1]">
            <button
              onClick={() => setMode('collaborative_fairness')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
                mode === 'collaborative_fairness'
                  ? 'bg-white text-black shadow-lg'
                  : 'text-[#d4d4e2] hover:text-white'
              }`}
            >
              Collaborative Max-Min
            </button>
            <button
              onClick={() => setMode('adversarial_minimax')}
              className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-bold transition ${
                mode === 'adversarial_minimax'
                  ? 'bg-[#f24c27] text-white shadow-lg shadow-[#f24c27]/30'
                  : 'text-[#d4d4e2] hover:text-white'
              }`}
            >
              2-Player Minimax (Alpha-Beta)
            </button>
          </div>
        </div>

        {/* Member Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3">
          {members.map((member, idx) => (
            <div key={member.id} className="bento-box p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white flex items-center gap-2.5">
                  <span className={`w-2.5 h-2.5 rounded-full ${idx === 0 ? 'bg-[#f24c27]' : 'bg-emerald-400'}`} />
                  {member.name}
                </span>
                <span className="text-xs text-[#a0a0ab] uppercase mono font-bold">
                  {idx === 0 ? 'Player 1 (Max)' : 'Player 2 (Min)'}
                </span>
              </div>

              <div className="space-y-2.5 text-sm text-[#c8c8d8]">
                <div className="flex justify-between">
                  <span>Likes:</span>
                  <span className="text-emerald-400 font-bold">{member.likedGenres.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Dislikes:</span>
                  <span className="text-rose-400 font-bold">{member.dislikedGenres.length ? member.dislikedGenres.join(', ') : 'None'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Vetoes:</span>
                  <span className="text-rose-500 font-bold">{member.vetoes.length ? member.vetoes.join(', ') : 'None'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="pt-3 text-center">
          <button
            onClick={handleRunRecommendation}
            disabled={recommending}
            className="btn-evo-accent !text-sm !py-3.5 !px-10 shadow-xl hover:scale-105 disabled:opacity-50"
          >
            <Swords className="w-5 h-5" />
            <span>{recommending ? 'Computing Compromise...' : `Execute ${mode === 'adversarial_minimax' ? 'Minimax Search' : 'Fairness Solver'}`}</span>
          </button>
        </div>
      </div>

      {/* Results Display */}
      {results && (
        <div className="space-y-8 animate-fadeIn">
          {mode === 'adversarial_minimax' ? (
            /* Minimax Results */
            <div className="evo-card p-6 sm:p-8 space-y-7 border-purple-500/40">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-white/[0.08] pb-5">
                <div>
                  <div className="flex items-center gap-2 text-purple-400 text-xs font-bold uppercase tracking-wider">
                    <Cpu className="w-4 h-4" />
                    <span>2-Player Minimax Adversarial Game Tree</span>
                  </div>
                  <h3 className="text-2xl font-bold text-white mt-1.5">
                    Optimal Game-Theoretic Equilibrium
                  </h3>
                </div>

                <div className="evocuir-glass-pill p-3.5 text-xs mono text-[#d4d4e2] space-y-1 shadow-md">
                  <div>Cutoffs: <span className="text-white font-bold">{results.metrics?.alpha_beta_cutoffs || 0} branches pruned</span></div>
                  <div>Nodes: <span className="text-white font-bold">{results.metrics?.nodes_evaluated || 12}</span></div>
                  <div>Payoff Delta: <span className="text-[#f24c27] font-bold">{results.minimax_payoff_differential}</span></div>
                </div>
              </div>

              {results.selected_movie && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <MovieCard
                    movie={{
                      id: results.selected_movie.id,
                      title: results.selected_movie.title,
                      releaseYear: results.selected_movie.release_year,
                      runtimeMinutes: results.selected_movie.runtime,
                      genres: results.selected_movie.genres,
                      imdbRating: results.selected_movie.imdb_rating,
                      posterUrl: results.selected_movie.poster_url,
                      overview: results.selected_movie.overview
                    }}
                    showScore={false}
                  />

                  <div className="md:col-span-2 space-y-5 flex flex-col justify-between">
                    <div className="bento-box p-6 space-y-4">
                      <h4 className="text-sm font-bold text-white uppercase tracking-wider">Player Utility Distribution</h4>
                      <div className="space-y-4 text-sm">
                        <div>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-[#d4d4e2] font-semibold">Player 1 Satisfaction:</span>
                            <span className="font-extrabold text-amber-400 mono">{Math.round(results.player1_utility * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div className="bg-amber-400 h-full rounded-full" style={{ width: `${results.player1_utility * 100}%` }} />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between mb-1.5">
                            <span className="text-[#d4d4e2] font-semibold">Player 2 Satisfaction:</span>
                            <span className="font-extrabold text-purple-400 mono">{Math.round(results.player2_utility * 100)}%</span>
                          </div>
                          <div className="w-full bg-white/[0.08] h-2.5 rounded-full overflow-hidden">
                            <div className="bg-purple-400 h-full rounded-full" style={{ width: `${results.player2_utility * 100}%` }} />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-5 rounded-2xl bg-white/[0.04] border border-purple-500/40 text-sm text-purple-200 leading-relaxed font-normal shadow-md">
                      💡 <strong>Game Theory Rationale:</strong> Minimax assumes both players act rationally to optimize payoff. The tree was searched to depth {results.metrics?.tree_depth || 3} with alpha-beta pruning, eliminating subtrees where Player 2 would strictly veto or minimize Player 1's options.
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Collaborative Group Fairness Results */
            <div className="evo-card p-6 sm:p-8 space-y-7">
              <div className="border-b border-white/[0.08] pb-5">
                <span className="tracked-caps text-[#f24c27] block mb-1">
                  Collaborative Max-Min & Nash Social Welfare
                </span>
                <h3 className="text-2xl font-bold text-white">Compromise Recommendations</h3>
                <p className="text-sm text-[#c8c8d8] mt-1 font-normal leading-relaxed">
                  {results.compromise_analysis}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {(results.recommendations || []).map((rec: any, idx: number) => {
                  const m = rec.movie;
                  return (
                    <div key={m.id} className="bento-box p-5 flex flex-col justify-between space-y-4">
                      <div className="flex items-center justify-between text-sm mono font-bold">
                        <span className="text-[#f24c27]">Option #{idx + 1}</span>
                        <span className="text-emerald-400">
                          Min: {Math.round(rec.min_satisfaction * 100)}%
                        </span>
                      </div>

                      <MovieCard
                        movie={{
                          id: m.id,
                          title: m.title,
                          releaseYear: m.release_year,
                          runtimeMinutes: m.runtime,
                          genres: m.genres,
                          imdbRating: m.imdb_rating,
                          posterUrl: m.poster_url,
                          overview: m.overview
                        }}
                        showScore={false}
                      />

                      <div className="space-y-2 pt-3 border-t border-white/[0.08] text-xs text-[#c8c8d8]">
                        {Object.entries(rec.member_breakdown || {}).map(([name, u]: [string, any]) => (
                          <div key={name} className="flex justify-between font-medium">
                            <span>{name}:</span>
                            <span className="font-bold text-white mono">{Math.round(u * 100)}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
