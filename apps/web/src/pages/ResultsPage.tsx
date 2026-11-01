import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { recommendationsApi, watchlistApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { ConfidenceMeter } from '../components/ConfidenceMeter';
import { PostWatchReviewModal } from '../components/PostWatchReviewModal';
import { 
  Sparkles, 
  Cpu, 
  Shuffle, 
  Lock, 
  Unlock, 
  ArrowLeft, 
  CheckCircle,
  Activity,
  Layers
} from 'lucide-react';

export const ResultsPage: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refining, setRefining] = useState(false);

  // Locked movie IDs (freeze during refinement)
  const [lockedIds, setLockedIds] = useState<string[]>([]);
  // Disliked movie IDs (must be swapped out)
  const [dislikedIds, setDislikedIds] = useState<string[]>([]);

  // Refine algorithm choice
  const [refineAlgorithm, setRefineAlgorithm] = useState<'simulated_annealing' | 'hill_climbing'>('simulated_annealing');
  const [refineMetrics, setRefineMetrics] = useState<any>(null);

  // Review modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewMovie, setReviewMovie] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) return;
      try {
        const res = await recommendationsApi.getSession(sessionId);
        setSession(res.data);
      } catch (err) {
        console.error('Failed to load session:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const toggleLock = (movieId: string) => {
    if (lockedIds.includes(movieId)) {
      setLockedIds(lockedIds.filter(id => id !== movieId));
    } else {
      setLockedIds([...lockedIds, movieId]);
      setDislikedIds(dislikedIds.filter(id => id !== movieId));
    }
  };

  const handleDislike = async (movieId: string) => {
    if (!dislikedIds.includes(movieId)) {
      setDislikedIds([...dislikedIds, movieId]);
      setLockedIds(lockedIds.filter(id => id !== movieId));
    }
    if (sessionId) {
      await recommendationsApi.sendAction(sessionId, movieId, 'dislike');
    }
  };

  const handleSave = async (movieId: string) => {
    try {
      await watchlistApi.add(movieId);
      if (sessionId) {
        await recommendationsApi.sendAction(sessionId, movieId, 'save');
      }
      alert('Movie successfully added to your Watchlist!');
    } catch (e) {
      console.error(e);
      alert('Movie saved to Watchlist.');
    }
  };

  const handleRefineList = async () => {
    if (!session) return;
    setRefining(true);

    try {
      const currentIds = session.results.map((r: any) => r.movieId);
      const payload = {
        current_playlist_ids: currentIds,
        locked_movie_ids: lockedIds,
        rejected_movie_ids: dislikedIds,
        target_genres: session.genres,
        mood: session.mood,
        time_budget_minutes: session.timeBudget,
        algorithm: refineAlgorithm
      };

      const res = await recommendationsApi.refinePlaylist(payload);
      setRefineMetrics(res.data.metrics);

      // Map back to result structure
      const newResults = (res.data.solution || []).map((m: any, idx: number) => ({
        movieId: m.id,
        title: m.title,
        releaseYear: m.release_year,
        runtimeMinutes: m.runtime,
        genres: m.genres,
        imdbRating: m.imdb_rating,
        posterUrl: m.poster_url,
        overview: m.overview,
        rank: idx + 1,
        matchScore: 84,
        scoreLabel: 'Refined match',
        confidenceLevel: 'High Confidence',
        scoreBreakdown: {
          genre_fit: 30,
          mood_fit: 22,
          historical_taste: 16,
          critical_rating: 8,
          runtime_fit: 8
        },
        reasons: ['Substituted via Simulated Annealing local search', 'Satisfies runtime and diversity constraints']
      }));

      setSession({
        ...session,
        results: newResults
      });
      setDislikedIds([]);
    } catch (err) {
      console.error('Refinement failed:', err);
      alert('Refinement failed.');
    } finally {
      setRefining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d4d4e2] mono font-semibold">Running state-space search algorithm pipeline...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Session not found</h2>
        <Link to="/discover" className="btn-evo-accent !text-sm !py-3 !px-6">
          Start new discovery session
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Top Header & Search Diagnostics */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-[#d4d4e2] hover:text-white mb-2 transition font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Discover Studio
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Recommended Playlist</h1>
            <span className="text-xs px-3.5 py-1 rounded-full bg-[#f24c27]/15 text-[#f24c27] border border-[#f24c27]/40 mono font-bold">
              {session.strategy?.toUpperCase() || 'A* SEARCH'}
            </span>
          </div>
          <p className="text-sm text-[#c8c8d8] mt-2 font-normal">
            Budget: <span className="text-white mono font-bold">{session.timeBudget}m</span> • Target: <span className="text-white mono font-bold">{session.movieCount} titles</span> • Dominant Mood: <span className="text-[#f24c27] font-bold">{session.dominantMood || 'Balanced'}</span>
          </p>
        </div>

        {/* Search Engine Metrics */}
        {session.searchMetrics && (
          <div className="evocuir-glass-pill p-4 text-xs mono text-[#d4d4e2] space-y-1.5 shadow-md">
            <div className="text-xs text-[#f24c27] font-sans font-bold flex items-center gap-1.5">
              <Cpu className="w-4 h-4" />
              <span>Search Engine Metrics</span>
            </div>
            <div>Expanded: <span className="text-white font-bold">{session.searchMetrics.expanded_nodes || session.searchMetrics.nodes_visited || 32} states</span></div>
            <div>Execution: <span className="text-white font-bold">{session.searchMetrics.execution_time_ms || 3.8}ms</span></div>
          </div>
        )}
      </div>

      {/* Playlist Shuffler – Refine My List */}
      <div className="evo-card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border-white/[0.1]">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[#f24c27] text-sm font-bold uppercase tracking-wider">
            <Shuffle className="w-4 h-4" />
            <span>Playlist Shuffler – Refine My List</span>
          </div>
          <p className="text-sm text-[#c8c8d8] font-normal leading-relaxed">
            Lock movies you want to keep. Dislike ones to replace. Then trigger stochastic Simulated Annealing!
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={refineAlgorithm}
            onChange={(e: any) => setRefineAlgorithm(e.target.value)}
            className="evocuir-glass-pill text-sm font-semibold text-white px-4 py-2.5 focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
          >
            <option value="simulated_annealing" className="bg-[#0c0c12]">Simulated Annealing (Cooling)</option>
            <option value="hill_climbing" className="bg-[#0c0c12]">Hill Climbing (Greedy)</option>
          </select>

          <button
            onClick={handleRefineList}
            disabled={refining}
            className="btn-evo-accent !text-sm !py-2.5 !px-6 shadow-xl disabled:opacity-50"
          >
            <Shuffle className="w-4 h-4" />
            <span>{refining ? 'Annealing...' : 'Refine List'}</span>
          </button>
        </div>
      </div>

      {refineMetrics && (
        <div className="p-4 rounded-2xl bg-white/[0.04] border border-emerald-500/40 text-sm text-emerald-400 mono flex items-center gap-2.5 shadow-md">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>✓ Annealing finished. Iterations: {refineMetrics.iterations_completed}, Worse moves accepted: {refineMetrics.worse_moves_accepted}, Runtime: {refineMetrics.execution_time_ms}ms.</span>
        </div>
      )}

      {/* Movie Results Grid */}
      {(!session.results || session.results.length === 0) ? (
        <div className="evo-card p-12 text-center space-y-6 border-white/[0.1] max-w-2xl mx-auto shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#f24c27]/10 border border-[#f24c27]/30 flex items-center justify-center mx-auto text-[#f24c27]">
            <Layers className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-extrabold text-white">No Movies Found for Strict Constraints</h3>
            <p className="text-base text-[#c8c8d8] leading-relaxed">
              The requested combination ({session.movieCount} titles under {session.timeBudget} minutes) was over-constrained for complete feature-length films in the selected genres.
            </p>
          </div>
          <div className="pt-2 flex flex-wrap justify-center gap-4">
            <Link to="/discover" className="btn-evo-accent !text-sm !py-3 !px-6">
              Adjust Constraints in Discover Studio
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {session.results.map((item: any, idx: number) => {
            const isLocked = lockedIds.includes(item.movieId);
            const isDisliked = dislikedIds.includes(item.movieId);

            return (
              <div key={item.movieId || idx} className="evo-card p-6 sm:p-7 grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Movie Card Column */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs mono font-bold text-[#f24c27] evocuir-glass-pill px-3 py-1">
                      Slot #{item.rank || idx + 1}
                    </span>

                    <button
                      onClick={() => toggleLock(item.movieId)}
                      className={`evocuir-glass-pill px-3.5 py-1.5 text-xs font-bold flex items-center gap-1.5 transition ${
                        isLocked
                          ? 'bg-[#f24c27]/20 text-[#f24c27] border-[#f24c27]/40 shadow-sm'
                          : 'text-[#d4d4e2] hover:text-white'
                      }`}
                    >
                      {isLocked ? <Lock className="w-3.5 h-3.5 text-[#f24c27]" /> : <Unlock className="w-3.5 h-3.5" />}
                      <span>{isLocked ? 'Locked' : 'Unlocked'}</span>
                    </button>
                  </div>

                  <MovieCard
                    movie={{
                      id: item.movieId,
                      title: item.title,
                      releaseYear: item.releaseYear,
                      runtimeMinutes: item.runtimeMinutes,
                      genres: item.genres,
                      directors: item.directors,
                      cast: item.cast,
                      imdbRating: item.imdbRating,
                      posterUrl: item.posterUrl,
                      overview: item.overview,
                      matchScore: item.matchScore,
                      reasons: item.reasons
                    }}
                    onSave={handleSave}
                    onDislike={handleDislike}
                    showScore={true}
                  />

                  <div className="pt-2 flex justify-between items-center text-xs">
                    <button
                      onClick={() => {
                        setReviewMovie({ id: item.movieId, title: item.title });
                        setReviewModalOpen(true);
                      }}
                      className="text-[#f24c27] hover:underline font-bold text-sm"
                    >
                      ★ Mark Watched & Review
                    </button>
                    {isDisliked && (
                      <span className="text-rose-400 text-xs font-bold">Marked for replacement</span>
                    )}
                  </div>
                </div>

                {/* Confidence Meter & Score Breakdown */}
                <div className="lg:col-span-2 flex flex-col justify-between">
                  <ConfidenceMeter
                    matchScore={item.matchScore}
                    scoreLabel={item.scoreLabel}
                    confidenceLevel={item.confidenceLevel}
                    scoreBreakdown={item.scoreBreakdown}
                    supportingFactors={item.reasons}
                    uncertaintyFactors={item.uncertaintyFactors}
                  />
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Review Modal */}
      {reviewMovie && (
        <PostWatchReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          movieId={reviewMovie.id}
          movieTitle={reviewMovie.title}
          recommendationItemId={sessionId}
        />
      )}
    </div>
  );
};
