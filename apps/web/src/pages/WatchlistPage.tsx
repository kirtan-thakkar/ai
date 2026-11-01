import React, { useState, useEffect } from 'react';
import { watchlistApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { 
  Bookmark, 
  ArrowUpDown, 
  Sparkles, 
  Trash2,
  PlusCircle,
  Film
} from 'lucide-react';

export const WatchlistPage: React.FC = () => {
  const [watchlists, setWatchlists] = useState<any[]>([]);
  const [selectedWlId, setSelectedWlId] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Sequencer state
  const [arcStrategy, setArcStrategy] = useState<'emotional_buildup' | 'release_chronology' | 'variety_pacing'>('emotional_buildup');
  const [sequencing, setSequencing] = useState(false);
  const [sequencedResult, setSequencedResult] = useState<any>(null);

  useEffect(() => {
    fetchWatchlists();
  }, []);

  const fetchWatchlists = async () => {
    try {
      const res = await watchlistApi.getAll();
      setWatchlists(res.data.watchlists || []);
      if (res.data.watchlists?.length > 0 && !selectedWlId) {
        setSelectedWlId(res.data.watchlists[0].id);
      }
    } catch (err) {
      console.error('Failed to load watchlists:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDefaults = async () => {
    const starterIds = ['m_inception', 'm_interstellar', 'm_the_dark_knight', 'm_dune_part_1', 'm_parasite'];
    for (const id of starterIds) {
      try {
        await watchlistApi.add(id);
      } catch (e) {
        console.error(e);
      }
    }
    await fetchWatchlists();
  };

  const handleRemove = async (movieId: string) => {
    if (!selectedWlId) return;
    try {
      await watchlistApi.removeMovie(selectedWlId, movieId);
      fetchWatchlists();
      setSequencedResult(null);
    } catch (err) {
      console.error('Failed to remove movie:', err);
    }
  };

  const handleSequence = async () => {
    if (!selectedWlId) return;
    setSequencing(true);
    try {
      const res = await watchlistApi.sequence(selectedWlId, arcStrategy);
      setSequencedResult(res.data);
    } catch (err) {
      console.error('Sequencing error:', err);
      alert('Sequencing failed. Ensure watchlist has at least 1 movie.');
    } finally {
      setSequencing(false);
    }
  };

  const currentWl = watchlists.find(w => w.id === selectedWlId);
  const currentMovies = sequencedResult ? sequencedResult.sequenced_movies : (currentWl?.movies || []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d4d4e2] mono font-semibold">Loading watchlist storage...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white mb-3 shadow-md">
            <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-pulse" />
            <span className="tracked-caps text-[#f24c27]">Watchlist Engine</span>
            <span className="text-white/20">|</span>
            <span className="text-[#d4d4e2] font-medium">Greedy Best-First Arc Optimizer</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">Your Saved Watchlist</h1>
          <p className="text-sm sm:text-base text-[#c8c8d8] mt-2 font-normal max-w-2xl leading-relaxed">
            Reorder saved movies using Greedy Best-First Search to craft an optimal emotional viewing arc without fatigue.
          </p>
        </div>

        {/* Sequencer Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={arcStrategy}
            onChange={(e: any) => setArcStrategy(e.target.value)}
            className="evocuir-glass-pill text-sm font-semibold text-white px-4 py-3 focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
          >
            <option value="emotional_buildup" className="bg-[#0c0c12]">Arc: Emotional Build-Up (Climax)</option>
            <option value="variety_pacing" className="bg-[#0c0c12]">Arc: Genre Variety (Alternating)</option>
            <option value="release_chronology" className="bg-[#0c0c12]">Arc: Chronological (Release Order)</option>
          </select>

          <button
            onClick={handleSequence}
            disabled={sequencing || !currentWl || currentWl.movies?.length === 0}
            className="btn-evo-accent !text-sm !py-3 !px-6 shadow-xl disabled:opacity-50"
          >
            <ArrowUpDown className="w-4 h-4" />
            <span>{sequencing ? 'Optimizing...' : 'Optimize Sequence'}</span>
          </button>
        </div>
      </div>

      {/* Sequence Explanation Banner (if optimized) */}
      {sequencedResult && (
        <div className="evo-card p-6 sm:p-7 space-y-4 border-emerald-500/40">
          <div className="flex items-center gap-2.5 text-emerald-400 font-bold text-sm uppercase tracking-wider">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <span>Optimal Viewing Arc Computed ({sequencedResult.arc_strategy})</span>
          </div>
          <div className="space-y-2.5 text-sm text-[#d4d4e2]">
            {sequencedResult.position_explanations?.map((exp: string, idx: number) => (
              <div key={idx} className="flex items-start gap-3 bg-white/[0.03] p-3 rounded-xl border border-white/[0.06]">
                <span className="mono text-[#f24c27] font-bold text-sm shrink-0">Position #{idx + 1}:</span>
                <span className="text-white font-medium leading-relaxed">{exp}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Movie Grid */}
      {currentMovies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentMovies.map((m: any, idx: number) => (
            <div key={m.id} className="relative group space-y-3">
              {sequencedResult && (
                <div className="absolute -top-3 left-4 z-10 px-3.5 py-1 rounded-full bg-[#f24c27] text-white text-xs font-bold mono shadow-lg">
                  Position #{idx + 1}
                </div>
              )}
              <MovieCard
                movie={{
                  id: m.id,
                  title: m.title,
                  releaseYear: m.release_year,
                  runtimeMinutes: m.runtime,
                  genres: m.genres,
                  directors: m.directors,
                  cast: m.cast,
                  imdbRating: m.imdb_rating,
                  posterUrl: m.poster_url,
                  overview: m.overview
                }}
                isSaved={true}
                showScore={false}
              />
              <button
                onClick={() => handleRemove(m.id)}
                className="w-full py-2.5 rounded-full evocuir-glass-pill hover:bg-rose-500/10 hover:border-rose-500/30 text-[#a0a0ab] hover:text-rose-400 text-xs font-bold transition flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Remove from Watchlist</span>
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="evo-card p-14 text-center space-y-5">
          <Bookmark className="w-12 h-12 text-[#6e6e7e] mx-auto" />
          <h3 className="text-xl font-bold text-white">Your Watchlist is currently empty</h3>
          <p className="text-sm text-[#c8c8d8] max-w-md mx-auto font-normal leading-relaxed">
            Discover movies matching your mood, search live titles, or load a starter set to immediately test Greedy Best-First sequencing.
          </p>
          <button
            onClick={handleSeedDefaults}
            className="btn-evo-accent !text-sm !py-3 !px-8 inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Load Starter Masterpiece Set</span>
          </button>
        </div>
      )}
    </div>
  );
};
