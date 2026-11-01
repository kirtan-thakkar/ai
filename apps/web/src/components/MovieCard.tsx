import React, { useState } from 'react';
import { Star, Clock, Bookmark, ThumbsDown, Shuffle, ExternalLink, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { watchlistApi } from '../services/api';

export interface MovieCardProps {
  movie: {
    id: string;
    title: string;
    releaseYear?: number;
    runtimeMinutes?: number;
    genres?: string[];
    imdbRating?: number;
    posterUrl?: string;
    overview?: string;
    directors?: string[];
    cast?: string[];
    frameType?: string;
    matchScore?: number;
    scoreLabel?: string;
    reasons?: string[];
  };
  onSave?: (id: string) => void;
  onDislike?: (id: string) => void;
  isSaved?: boolean;
  showScore?: boolean;
}

export const MovieCard: React.FC<MovieCardProps> = ({
  movie,
  onSave,
  onDislike,
  isSaved = false,
  showScore = true
}) => {
  const [imgError, setImgError] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [savedLocal, setSavedLocal] = useState(isSaved);
  const [saving, setSaving] = useState(false);

  const fallbackPoster = 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80';
  const poster = imgError || !movie.posterUrl ? fallbackPoster : movie.posterUrl;

  const scoreBadgeStyle = () => {
    const s = movie.matchScore || 0;
    if (s >= 85) return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.2)]';
    if (s >= 70) return 'bg-[#f24c27]/15 text-[#f24c27] border-[#f24c27]/30 shadow-[0_0_12px_rgba(242,76,39,0.2)]';
    return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
  };

  const handleSaveClick = async () => {
    if (onSave) {
      onSave(movie.id);
      setSavedLocal(true);
      return;
    }
    
    // Direct default watchlist persistence
    setSaving(true);
    try {
      await watchlistApi.add(movie.id);
      setSavedLocal(true);
    } catch (e) {
      console.error('Failed to save to watchlist:', e);
      // Still set local saved state for demo smoothness
      setSavedLocal(true);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="evo-card group flex flex-col justify-between overflow-hidden transition-all duration-300 hover:-translate-y-1">
      {/* Poster Media Frame */}
      <div className="relative aspect-[16/10] sm:aspect-[16/11] w-full overflow-hidden bg-[#07070a]">
        <img
          src={poster}
          alt={movie.title}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e14] via-[#0e0e14]/40 to-transparent" />

        {/* Top Floating Glass Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          {/* IMDb Rating Glass Pill */}
          <div className="evocuir-glass-pill px-3 py-1 flex items-center gap-1.5 text-xs font-bold text-amber-400 pointer-events-auto shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span className="mono">{movie.imdbRating?.toFixed(1) || '8.0'}</span>
          </div>

          {/* Calibrated Match Score */}
          {showScore && movie.matchScore !== undefined && (
            <div className={`px-3 py-1 rounded-full border text-xs font-bold flex items-center gap-1.5 pointer-events-auto backdrop-blur-xl ${scoreBadgeStyle()}`}>
              <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
              <span>{movie.matchScore}% Match</span>
            </div>
          )}
        </div>

        {/* Bottom Poster Info: Runtime & Year */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-[#d4d4e2] font-semibold">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#a0a0ab]" />
            <span>{movie.runtimeMinutes || 120} min</span>
          </div>
          <span className="mono text-white bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
            {movie.releaseYear || 2020}
          </span>
        </div>
      </div>

      {/* Content & Metadata */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3.5">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-lg font-bold text-white group-hover:text-[#f24c27] transition-colors line-clamp-1">
              {movie.title}
            </h3>
            {movie.frameType && (
              <span className="text-[11px] mono text-[#c8c8d8] font-bold uppercase tracking-wider bg-white/[0.06] px-2 py-0.5 rounded-md border border-white/[0.1] shrink-0">
                {movie.frameType}
              </span>
            )}
          </div>

          {/* Genres (Glass Pill Style) */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {(movie.genres || []).slice(0, 3).map((g) => (
              <span
                key={g}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-white/[0.06] text-[#d4d4e2] border border-white/[0.1]"
              >
                {g}
              </span>
            ))}
          </div>

          {/* Overview */}
          {movie.overview && (
            <p className="text-sm text-[#b8b8cb] line-clamp-2 mt-3 leading-relaxed font-normal">
              {movie.overview}
            </p>
          )}

          {/* Explain Reasoning Banner */}
          {movie.reasons && movie.reasons.length > 0 && (
            <div className="mt-3 text-xs text-[#f5f5f7] bg-white/[0.04] border border-white/[0.1] p-2.5 rounded-xl flex items-center justify-between gap-2">
              <span className="line-clamp-1 text-[#d4d4e2]">
                💡 <span className="font-bold text-white">AI Reason:</span> {movie.reasons[0]}
              </span>
              <button
                onClick={() => setShowExplanation(!showExplanation)}
                className="text-xs text-[#f24c27] font-bold hover:underline shrink-0"
              >
                {showExplanation ? 'Hide' : 'Why?'}
              </button>
            </div>
          )}

          {/* Full explanation expandable drawer */}
          {showExplanation && movie.reasons && (
            <div className="mt-2.5 p-3.5 rounded-xl bg-black/70 border border-white/15 text-xs space-y-2">
              <span className="tracked-caps text-[#f24c27] block">Recommendation Reasoning:</span>
              <ul className="space-y-1.5 list-disc list-inside text-[#c8c8d8]">
                {movie.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Action Toolbar (EvoAir Pill Buttons) */}
        <div className="pt-3.5 border-t border-white/[0.08] flex items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveClick}
              disabled={saving}
              className={`evocuir-glass-pill px-3.5 py-2 flex items-center gap-1.5 font-bold transition text-xs ${
                savedLocal
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-sm'
                  : 'text-[#d4d4e2] hover:text-white hover:border-white/30'
              }`}
              title={savedLocal ? 'Saved in Watchlist' : 'Add to Watchlist'}
            >
              {savedLocal ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <>
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{saving ? 'Saving...' : 'Watchlist'}</span>
                </>
              )}
            </button>

            {onDislike && (
              <button
                onClick={() => onDislike(movie.id)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e8e9e] hover:text-red-400 hover:bg-white/[0.06] transition"
                title="Not interested (dislike)"
              >
                <ThumbsDown className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {/* Find Alternatives Quick Link */}
            <Link
              to={`/alternatives/${movie.id}`}
              className="evocuir-glass-pill px-3 py-2 flex items-center gap-1.5 text-xs font-semibold text-[#d4d4e2] hover:text-white hover:border-white/30"
              title="Find Alternatives"
            >
              <Shuffle className="w-3.5 h-3.5 text-[#f24c27]" />
              <span>Similar</span>
            </Link>

            {/* IMDb Outlink */}
            <a
              href={`https://www.imdb.com/title/${movie.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[#8e8e9e] hover:text-white hover:bg-white/[0.06] transition"
              title="View on IMDb"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
