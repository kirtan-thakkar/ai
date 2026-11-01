import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { moviesApi, watchlistApi } from '../services/api';
import { MovieCard } from '../components/MovieCard';
import { 
  Shuffle, 
  ArrowLeft, 
  CheckCircle2
} from 'lucide-react';

export const AlternativesPage: React.FC = () => {
  const { movieId } = useParams<{ movieId: string }>();

  const [sourceMovie, setSourceMovie] = useState<any>(null);
  const [alternatives, setAlternatives] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlternatives = async () => {
      if (!movieId) return;
      setLoading(true);
      try {
        const res = await moviesApi.getAlternatives(movieId, { k: 6 });
        setSourceMovie(res.data?.source_movie);
        setAlternatives(res.data?.alternatives || []);
      } catch (err) {
        console.error('Failed to fetch alternatives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAlternatives();
  }, [movieId]);

  const handleSave = async (id: string) => {
    try {
      await watchlistApi.add(id);
      alert('Added alternative to your watchlist!');
    } catch (e) {
      console.error(e);
      alert('Added alternative to your watchlist!');
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d4d4e2] mono font-semibold">Calculating k-NN feature vector distances...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <Link to="/discover" className="inline-flex items-center gap-2 text-sm text-[#d4d4e2] hover:text-white mb-2 transition font-medium">
            <ArrowLeft className="w-4 h-4" /> Back to Discovery
          </Link>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Alternative Movie Finder</h1>
            <span className="text-xs px-3.5 py-1 rounded-full bg-[#f24c27]/15 text-[#f24c27] border border-[#f24c27]/40 mono font-bold">
              k-NN FEATURE SIMILARITY
            </span>
          </div>
          <p className="text-sm text-[#c8c8d8] mt-2 font-normal max-w-2xl leading-relaxed">
            Heuristic nearest-neighbor matching computing weighted genre, mood, director, and runtime vector distance.
          </p>
        </div>
      </div>

      {/* Source Movie Spotlight Banner */}
      {sourceMovie && (
        <div className="evo-card-glow p-6 sm:p-8 flex flex-col sm:flex-row items-center gap-7">
          <img
            src={sourceMovie.poster_url || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600'}
            alt={sourceMovie.title}
            className="w-28 h-40 object-cover rounded-2xl shadow-2xl shrink-0 border border-white/15"
          />
          <div className="space-y-3 flex-1 text-center sm:text-left">
            <span className="tracked-caps text-[#f24c27] font-bold">
              Source Title to Substitute
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{sourceMovie.title} ({sourceMovie.release_year})</h2>
            <p className="text-sm text-[#c8c8d8] max-w-3xl line-clamp-3 font-normal leading-relaxed">
              {sourceMovie.overview}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 pt-1 text-xs text-[#d4d4e2]">
              <span className="evocuir-glass-pill px-3 py-1 mono font-bold">{sourceMovie.runtime} mins</span>
              <span className="evocuir-glass-pill px-3 py-1 font-medium">Director: {sourceMovie.directors?.join(', ')}</span>
              <span className="evocuir-glass-pill px-3 py-1 text-amber-400 font-extrabold">★ {sourceMovie.imdb_rating}</span>
            </div>
          </div>
        </div>
      )}

      {/* Alternatives Grid */}
      <div className="space-y-5">
        <h3 className="tracked-caps text-white font-bold text-sm">
          Top Nearest Substitutes (Ranked by Feature Proximity)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {alternatives.map((alt: any) => {
            const m = alt.movie;
            return (
              <div key={m.id} className="evo-card p-5 sm:p-6 flex flex-col justify-between space-y-4">
                {/* Similarity Badge */}
                <div className="flex items-center justify-between">
                  <span className="text-xs mono font-bold text-emerald-400 bg-emerald-500/15 px-3.5 py-1 rounded-full border border-emerald-500/30 flex items-center gap-1.5 shadow-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{alt.similarity_percent}% Similarity</span>
                  </span>
                  <span className="text-xs text-[#d4d4e2] mono font-semibold">
                    {m.runtime} min
                  </span>
                </div>

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
                  onSave={handleSave}
                  showScore={false}
                />

                {/* Similarity Reason list */}
                <div className="bento-box p-4 space-y-2 text-xs text-[#c8c8d8]">
                  <div className="tracked-caps text-[#f24c27] text-xs">Why it's a match:</div>
                  {alt.reasons?.map((r: string, idx: number) => (
                    <div key={idx} className="flex items-start gap-2 text-xs font-normal leading-relaxed text-[#d4d4e2]">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
