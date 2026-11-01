import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { moviesApi, watchlistApi, feedbackApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { PostWatchReviewModal } from '../components/PostWatchReviewModal';
import { 
  Sparkles, 
  Compass, 
  Bookmark, 
  Clock, 
  BrainCircuit, 
  ArrowRight,
  Sun,
  Zap,
  Flame,
  Star,
  Activity
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [topPicks, setTopPicks] = useState<any[]>([]);
  const [watchlist, setWatchlist] = useState<any[]>([]);
  const [beliefs, setBeliefs] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);

  // Review Modal state
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [selectedReviewMovie, setSelectedReviewMovie] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [moviesRes, wlRes, prefRes] = await Promise.all([
          moviesApi.list({ limit: 4 }),
          watchlistApi.getAll(),
          feedbackApi.getPreferences()
        ]);

        setTopPicks(moviesRes.data?.movies || []);
        if (wlRes.data?.watchlists?.[0]?.movies) {
          setWatchlist(wlRes.data.watchlists[0].movies);
        }
        if (prefRes.data?.genreBeliefs) {
          setBeliefs(prefRes.data.genreBeliefs);
        }
      } catch (err) {
        console.error('Failed to load dashboard:', err);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const openReviewModal = (id: string, title: string) => {
    setSelectedReviewMovie({ id, title });
    setReviewModalOpen(true);
  };

  const quickLaunch = (mood: number, time: number) => {
    navigate(`/discover?preset_mood=${mood}&preset_time=${time}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10">
      
      {/* Welcome Banner (EvoAir Glow Card) */}
      <div className="evo-card-glow p-6 sm:p-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="tracked-caps text-[#f24c27]">Active Cinema Agent</span>
              <span className="text-white/20">|</span>
              <span className="text-[#a0a0ab] font-light">FAI Intelligent Orchestrator</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Ready for cinema, {user?.name ? user.name.split(' ')[0] : 'Viewer'}?
            </h1>
            <p className="text-xs sm:text-sm text-[#888896] leading-relaxed font-light">
              Calibrate your mood dial and runtime, or let our Goal Stack Planner optimize your weekend viewing schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/discover"
              className="btn-evo-accent !text-xs !py-3 !px-6 shadow-xl hover:scale-105"
            >
              <Compass className="w-4 h-4" />
              <span>Start Discovery Session</span>
            </Link>

            <Link
              to="/planner"
              className="btn-evo-ghost !text-xs !py-3 !px-5 hover:border-white/30"
            >
              <span>Marathon Planner</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Link>
          </div>
        </div>

        {/* Quick Mood Presets (EvoAir Glass Pills) */}
        <div className="mt-8 pt-6 border-t border-white/[0.06] flex flex-wrap items-center gap-2.5 text-xs">
          <span className="tracked-caps text-[#777785] mr-1">Quick Presets:</span>
          <button
            onClick={() => quickLaunch(2.5, 90)}
            className="evocuir-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-sky-400 hover:text-white transition"
          >
            <Sun className="w-3.5 h-3.5" />
            <span>Relaxed Night (90m)</span>
          </button>
          <button
            onClick={() => quickLaunch(8.0, 150)}
            className="evocuir-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-amber-400 hover:text-white transition"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Action Rush (150m)</span>
          </button>
          <button
            onClick={() => quickLaunch(9.5, 180)}
            className="evocuir-glass-pill px-3.5 py-1.5 flex items-center gap-1.5 text-[#f24c27] hover:text-white transition"
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Mind-Bending Double (180m)</span>
          </button>
        </div>
      </div>

      {/* Grid: Watchlist & Bayesian Beliefs Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Saved Watchlist (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-full bg-[#f24c27]/10 flex items-center justify-center">
                <Bookmark className="w-3.5 h-3.5 text-[#f24c27]" />
              </div>
              <h2 className="text-base font-bold text-white tracking-wide">Your Watchlist</h2>
              <span className="text-xs text-[#777785] mono">({watchlist.length})</span>
            </div>
            <Link
              to="/watchlist"
              className="text-xs font-semibold text-[#f24c27] hover:underline flex items-center gap-1"
            >
              <span>View & Sequence</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {watchlist.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {watchlist.slice(0, 4).map((m: any) => (
                <MovieCard
                  key={m.id}
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
                  isSaved={true}
                  showScore={false}
                />
              ))}
            </div>
          ) : (
            <div className="evo-card p-10 text-center space-y-3">
              <Bookmark className="w-8 h-8 text-[#555562] mx-auto" />
              <p className="text-sm text-white font-medium">Your watchlist is currently empty.</p>
              <p className="text-xs text-[#777785] max-w-sm mx-auto font-light">
                Discover movies matching your mood and bookmark them to optimize viewing sequences.
              </p>
              <Link
                to="/discover"
                className="btn-evo-ghost !text-xs !py-2 !px-4 mt-2"
              >
                <span>Find recommendations</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Link>
            </div>
          )}
        </div>

        {/* Right: Learned Taste & Quick Reviews (1 col) */}
        <div className="space-y-6">
          
          {/* Bayesian Beliefs Card */}
          <div className="evo-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-white uppercase tracking-wider">Learned Taste Beliefs</h3>
              </div>
              <Link
                to="/profile/preferences"
                className="text-xs text-[#f24c27] hover:underline font-semibold"
              >
                Details
              </Link>
            </div>
            <p className="text-xs text-[#888896] font-light leading-relaxed">
              Conjugate Beta priors updated from explicit reviews and skips (F-13).
            </p>

            <div className="space-y-3 pt-1">
              {Object.keys(beliefs).length > 0 ? (
                Object.entries(beliefs).slice(0, 4).map(([genre, b]: [string, any]) => (
                  <div key={genre} className="space-y-1.5 text-xs">
                    <div className="flex justify-between text-[#a0a0ab]">
                      <span className="font-medium text-white">{genre}</span>
                      <span className="mono text-[#f24c27] font-semibold">{Math.round(b.mean * 100)}%</span>
                    </div>
                    <div className="w-full bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-[#f24c27] to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${Math.round(b.mean * 100)}%` }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/[0.06] text-xs text-[#777785] text-center font-light">
                  Beliefs initialized at uninformative prior Beta(2, 2). Mark movies watched to start Bayesian learning.
                </div>
              )}
            </div>
          </div>

          {/* Quick Review Prompt Card */}
          <div className="evo-card p-6 space-y-3.5">
            <div className="flex items-center gap-2 text-amber-400">
              <Star className="w-4 h-4 fill-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Finished a Movie?</h3>
            </div>
            <p className="text-xs text-[#888896] leading-relaxed font-light">
              Submit a quick 30-second post-watch review to update your taste parameters.
            </p>
            <button
              onClick={() => openReviewModal('m_inception', 'Inception')}
              className="btn-evo-ghost w-full !text-xs !py-2.5 !rounded-xl"
            >
              Review a Watched Movie
            </button>
          </div>

        </div>
      </div>

      {/* Review Modal */}
      {selectedReviewMovie && (
        <PostWatchReviewModal
          isOpen={reviewModalOpen}
          onClose={() => setReviewModalOpen(false)}
          movieId={selectedReviewMovie.id}
          movieTitle={selectedReviewMovie.title}
        />
      )}
    </div>
  );
};
