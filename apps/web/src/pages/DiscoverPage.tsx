import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { recommendationsApi, assistantApi, moviesApi, watchlistApi } from '../services/api';
import { FuzzyMoodSlider } from '../components/FuzzyMoodSlider';
import { 
  Compass, 
  Sparkles, 
  Clock, 
  Send, 
  ArrowRight, 
  ShieldAlert, 
  Search, 
  Globe, 
  Check, 
  Bookmark, 
  Zap,
  Film
} from 'lucide-react';

export const DiscoverPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Natural Language Goal input
  const [goalPrompt, setGoalPrompt] = useState('');
  const [parsingGoal, setParsingGoal] = useState(false);
  const [goalInterpretation, setGoalInterpretation] = useState('');

  // Live Free Internet API Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [liveMovies, setLiveMovies] = useState<any[]>([]);
  const [liveLoading, setLiveLoading] = useState(false);
  const [savedLiveIds, setSavedLiveIds] = useState<string[]>([]);

  // Primary Recommendation Constraints
  const [mood, setMood] = useState<number>(parseFloat(searchParams.get('preset_mood') || '7.0'));
  const [timeBudget, setTimeBudget] = useState<number>(parseInt(searchParams.get('preset_time') || '180'));
  const [movieCount, setMovieCount] = useState<number>(2);
  const [audience, setAudience] = useState<string>('solo');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(['Sci-Fi', 'Action']);
  const [excludeViolence, setExcludeViolence] = useState<boolean>(false);
  const [excludeAdult, setExcludeAdult] = useState<boolean>(false);

  // Core Algorithmic Strategy (A* Search vs CSP Forward Checking)
  const [strategy, setStrategy] = useState<'astar' | 'csp'>('astar');
  const [loading, setLoading] = useState(false);

  const availableGenres = [
    'Sci-Fi', 'Action', 'Thriller', 'Comedy', 'Drama', 
    'Animation', 'Horror', 'Romance', 'Mystery', 'Crime', 'Family', 'Fantasy'
  ];

  const handleLiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLiveLoading(true);
    try {
      const res = await moviesApi.list({ search: searchQuery.trim(), limit: 6 });
      setLiveMovies(res.data?.movies || []);
    } catch (err) {
      console.error('Live search error:', err);
    } finally {
      setLiveLoading(false);
    }
  };

  const handleSaveLiveMovie = async (movieId: string) => {
    try {
      await watchlistApi.add(movieId);
      setSavedLiveIds(prev => [...prev, movieId]);
    } catch (e) {
      console.error(e);
      setSavedLiveIds(prev => [...prev, movieId]);
    }
  };

  const handleParseGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalPrompt.trim()) return;
    setParsingGoal(true);
    try {
      const res = await assistantApi.parseGoal(goalPrompt);
      const constraints = res.data.parsed_constraints;
      setGoalInterpretation(res.data.interpretation_summary);

      if (constraints.mood) setMood(constraints.mood);
      if (constraints.max_runtime_minutes) setTimeBudget(constraints.max_runtime_minutes);
      if (constraints.audience) setAudience(constraints.audience);
      if (constraints.genres?.length) setSelectedGenres(constraints.genres);
      if (constraints.exclusions?.includes('violence')) setExcludeViolence(true);
      if (constraints.exclusions?.includes('adult_content')) setExcludeAdult(true);
      if (constraints.target_movie_count) setMovieCount(constraints.target_movie_count);
    } catch (err) {
      console.error('Failed to parse goal:', err);
    } finally {
      setParsingGoal(false);
    }
  };

  const handleToggleGenre = (genre: string) => {
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(g => g !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleLaunchSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const excludeTags = [];
      if (excludeAdult) excludeTags.push('adult_content');

      const payload = {
        mood,
        timeBudgetMinutes: timeBudget,
        movieCount,
        genres: selectedGenres,
        audience,
        excludeTags,
        excludeViolence,
        strategy,
        beamWidth: 3
      };

      const res = await recommendationsApi.createSession(payload);
      navigate(`/recommendations/${res.data.id}`);
    } catch (err) {
      console.error('Discovery error:', err);
      alert('Search failed. Please ensure the AI service is operational.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Top Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white shadow-lg">
          <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-pulse" />
          <span className="tracked-caps text-[#f24c27]">Discovery Studio</span>
          <span className="text-white/20">|</span>
          <span className="text-[#d4d4e2] font-medium">A* Search & Constraint Satisfaction</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          Movie Discovery Studio
        </h1>
        <p className="text-sm sm:text-base text-[#c8c8d8] max-w-2xl mx-auto font-normal leading-relaxed">
          Calibrate mood, duration budget, and audience filters to find your ideal movie combination with zero login barriers.
        </p>
      </div>

      {/* Free Public Live Cinema API Search (Real Internet Data) */}
      <div className="evo-card p-6 sm:p-7 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-[#f24c27] text-sm font-bold uppercase tracking-wider">
            <Globe className="w-4 h-4 text-[#f24c27]" />
            <span>Live Movie Search (Free Internet API)</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-flex items-center gap-1.5 self-start sm:self-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online TVMaze API Live</span>
          </span>
        </div>

        <form onSubmit={handleLiveSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8e8e9e] absolute left-4 top-3.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search live titles from internet: e.g. 'Dune', 'Batman', 'Interstellar', 'Spider-Man'..."
              className="w-full bg-white/[0.04] border border-white/[0.14] rounded-full pl-11 pr-5 py-3 text-sm text-white placeholder-[#8e8e9e] focus:outline-none focus:border-[#f24c27] transition"
            />
          </div>
          <button
            type="submit"
            disabled={liveLoading}
            className="btn-evo-accent !text-sm !py-3 !px-7 shrink-0 disabled:opacity-50"
          >
            <span>{liveLoading ? 'Searching...' : 'Search Online'}</span>
          </button>
        </form>

        {liveMovies.length > 0 && (
          <div className="pt-4 border-t border-white/[0.08] space-y-4">
            <span className="tracked-caps text-[#d4d4e2] block">Live Online Results ({liveMovies.length} found):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveMovies.map((m) => {
                const isSaved = savedLiveIds.includes(m.id);
                return (
                  <div key={m.id} className="bento-box p-4 space-y-3 flex flex-col justify-between">
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={m.poster_url} 
                        alt={m.title} 
                        className="w-14 h-20 object-cover rounded-xl shrink-0 border border-white/10 shadow-md" 
                      />
                      <div className="overflow-hidden">
                        <h4 className="text-sm font-bold text-white truncate">{m.title}</h4>
                        <div className="text-xs text-[#a0a0ab] mono mt-0.5">{m.release_year} • {m.runtime}m</div>
                        <div className="text-xs text-amber-400 font-bold mt-1">★ {m.imdb_rating}</div>
                        {m.genres && m.genres.length > 0 && (
                          <div className="text-[11px] text-[#8e8e9e] truncate mt-1">
                            {m.genres.slice(0, 2).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/[0.06]">
                      <button
                        type="button"
                        onClick={() => {
                          if (m.genres?.length) setSelectedGenres(m.genres);
                          if (m.runtime) setTimeBudget(m.runtime);
                        }}
                        className="py-1.5 px-2 text-xs font-semibold evocuir-glass-pill text-[#d4d4e2] hover:text-white text-center"
                      >
                        Adopt Style
                      </button>

                      <button
                        type="button"
                        onClick={() => handleSaveLiveMovie(m.id)}
                        className={`py-1.5 px-2 text-xs font-bold rounded-full transition flex items-center justify-center gap-1 ${
                          isSaved
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            : 'evocuir-glass-pill text-[#f24c27] hover:border-[#f24c27]'
                        }`}
                      >
                        {isSaved ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Saved</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="w-3.5 h-3.5" />
                            <span>Watchlist</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Natural Language Goal Assistant */}
      <div className="evo-card p-6 sm:p-7 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 text-[#f24c27] text-sm font-bold uppercase tracking-wider">
            <Sparkles className="w-4 h-4" />
            <span>AI Natural Language Intent Parser</span>
          </div>
          <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1 rounded-full self-start sm:self-auto">
            Autonomous Constraint Extraction
          </span>
        </div>

        <form onSubmit={handleParseGoal} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={goalPrompt}
            onChange={(e) => setGoalPrompt(e.target.value)}
            placeholder="e.g. 'I have a rainy Sunday afternoon, 2.5 hours, watching with family. Suggest something uplifting without violence.'"
            className="flex-1 bg-white/[0.04] border border-white/[0.14] rounded-full px-5 py-3 text-sm text-white placeholder-[#8e8e9e] focus:outline-none focus:border-[#f24c27] transition"
          />
          <button
            type="submit"
            disabled={parsingGoal}
            className="btn-evo-accent !text-sm !py-3 !px-6 shrink-0 disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>{parsingGoal ? 'Interpreting...' : 'Parse Goal'}</span>
          </button>
        </form>

        {goalInterpretation && (
          <div className="p-4 rounded-2xl bg-white/[0.04] border border-[#f24c27]/40 text-sm text-white/90 flex items-start gap-3 animate-fadeIn">
            <Sparkles className="w-5 h-5 text-[#f24c27] shrink-0 mt-0.5" />
            <div>
              <span className="tracked-caps text-[#f24c27] block mb-1">Applied Assistant Constraints:</span>
              <p className="text-[#d4d4e2] font-normal">{goalInterpretation}</p>
            </div>
          </div>
        )}
      </div>

      {/* Main Search Configuration Bento Form */}
      <form onSubmit={handleLaunchSearch} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Left Column: Mood & Time */}
          <div className="space-y-6">
            <FuzzyMoodSlider value={mood} onChange={setMood} />

            {/* Time Budget */}
            <div className="evo-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Clock className="w-4 h-4 text-[#f24c27]" />
                  <span>Time Budget: {timeBudget} mins</span>
                </div>
                <div className="text-sm text-[#d4d4e2] mono font-bold">
                  ≈ {(timeBudget / 60).toFixed(1)} hrs
                </div>
              </div>

              <div className="grid grid-cols-6 gap-2">
                {[90, 120, 150, 180, 240, 300].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTimeBudget(t)}
                    className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold mono transition ${
                      timeBudget === t
                        ? 'bg-white text-black shadow-lg scale-102'
                        : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                    }`}
                  >
                    {t}m
                  </button>
                ))}
              </div>
            </div>

            {/* Movie Count & Audience */}
            <div className="evo-card p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
                  Target Movie Count
                </label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[1, 2, 3].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setMovieCount(num)}
                      className={`py-2.5 rounded-xl text-sm font-bold transition ${
                        movieCount === num
                          ? 'bg-white text-black shadow-lg'
                          : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                      }`}
                    >
                      {num} {num === 1 ? 'Movie' : 'Movies'}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
                  Viewing Audience
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {['solo', 'couple', 'friends', 'family'].map((aud) => (
                    <button
                      key={aud}
                      type="button"
                      onClick={() => setAudience(aud)}
                      className={`py-2.5 rounded-xl text-xs sm:text-sm font-bold capitalize transition ${
                        audience === aud
                          ? 'bg-[#f24c27] text-white shadow-md shadow-[#f24c27]/30'
                          : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                      }`}
                    >
                      {aud}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Genres, Safety & AI Algorithm Selector */}
          <div className="space-y-6">
            
            {/* Preferred Genres */}
            <div className="evo-card p-6 space-y-4">
              <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider">
                Preferred Genres ({selectedGenres.length} selected)
              </label>
              <div className="flex flex-wrap gap-2.5">
                {availableGenres.map((g) => {
                  const active = selectedGenres.includes(g);
                  return (
                    <button
                      key={g}
                      type="button"
                      onClick={() => handleToggleGenre(g)}
                      className={`text-xs sm:text-sm px-4 py-2 rounded-full border transition-all ${
                        active
                          ? 'bg-white text-black font-bold border-white shadow-md scale-105'
                          : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hard Safety Filters */}
            <div className="evo-card p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Content Safety Constraints</span>
              </div>
              <div className="space-y-3">
                <label className="flex items-center gap-3.5 text-sm text-[#d4d4e2] hover:text-white cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={excludeViolence}
                    onChange={(e) => setExcludeViolence(e.target.checked)}
                    className="w-5 h-5 rounded-md accent-[#f24c27] bg-white/[0.05] border-white/20"
                  />
                  <span>Exclude Moderate & Severe Violence</span>
                </label>

                <label className="flex items-center gap-3.5 text-sm text-[#d4d4e2] hover:text-white cursor-pointer transition">
                  <input
                    type="checkbox"
                    checked={excludeAdult}
                    onChange={(e) => setExcludeAdult(e.target.checked)}
                    className="w-5 h-5 rounded-md accent-[#f24c27] bg-white/[0.05] border-white/20"
                  />
                  <span>Filter Adult / Restricted Rated Content</span>
                </label>
              </div>
            </div>

            {/* Clear Core AI Algorithm Selector */}
            <div className="evo-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Zap className="w-4 h-4 text-[#f24c27]" />
                  <span>Search Methodology</span>
                </div>
                <span className="text-xs text-[#f24c27] mono font-bold">2 Core Strategies</span>
              </div>

              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => setStrategy('astar')}
                  className={`p-4 rounded-2xl text-left border transition ${
                    strategy === 'astar'
                      ? 'bg-white text-black border-white shadow-xl font-bold'
                      : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">A* Heuristic Search</div>
                  <div className={`text-xs mono mt-1 font-semibold ${strategy === 'astar' ? 'text-black/80' : 'text-[#f24c27]'}`}>
                    f(n) = g(n) + h(n)
                  </div>
                  <div className={`text-xs mt-1.5 leading-relaxed ${strategy === 'astar' ? 'text-black/70' : 'text-[#a0a0ab]'}`}>
                    Minimizes mood & genre mismatch.
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setStrategy('csp')}
                  className={`p-4 rounded-2xl text-left border transition ${
                    strategy === 'csp'
                      ? 'bg-white text-black border-white shadow-xl font-bold'
                      : 'evocuir-glass-pill text-[#d4d4e2] hover:text-white'
                  }`}
                >
                  <div className="text-sm font-bold">CSP Forward Checking</div>
                  <div className={`text-xs mono mt-1 font-semibold ${strategy === 'csp' ? 'text-black/80' : 'text-[#f24c27]'}`}>
                    Domain Pruning
                  </div>
                  <div className={`text-xs mt-1.5 leading-relaxed ${strategy === 'csp' ? 'text-black/70' : 'text-[#a0a0ab]'}`}>
                    Hard limits on exact minutes.
                  </div>
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-6 text-center">
          <button
            type="submit"
            disabled={loading}
            className="btn-evo-accent !text-base !py-4 !px-12 shadow-2xl hover:scale-105 disabled:opacity-50"
          >
            <Compass className="w-5 h-5" />
            <span>{loading ? 'Executing AI Search Pipeline...' : 'Generate AI Playlist'}</span>
            <ArrowRight className="w-5 h-5 ml-1" />
          </button>
        </div>

      </form>
    </div>
  );
};
