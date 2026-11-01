export interface Movie {
  id: string;
  title: string;
  release_year: number;
  runtime: number;
  language: string;
  country?: string;
  genres: string[];
  age_rating?: string;
  violence_level?: string;
  content_descriptors?: string[];
  directors: string[];
  cast: string[];
  franchise?: string | null;
  themes?: string[];
  mood_scores?: Record<string, number>;
  frame_type?: string;
  overview?: string;
  imdb_rating: number;
  poster_url?: string;
  tags?: string[];
}

export interface RecommendationItem {
  movieId: string;
  title: string;
  releaseYear: number;
  runtimeMinutes: number;
  genres: string[];
  directors: string[];
  cast: string[];
  imdbRating: number;
  posterUrl?: string;
  overview?: string;
  rank: number;
  matchScore: number;
  scoreLabel: string;
  confidenceLevel: string;
  scoreBreakdown: {
    genre_fit: number;
    mood_fit: number;
    historical_taste: number;
    critical_rating: number;
    runtime_fit: number;
  };
  reasons: string[];
  uncertaintyFactors: string[];
}

export interface RecommendationSession {
  id: string;
  userId: string;
  mood: number;
  timeBudget: number;
  movieCount: number;
  strategy: string;
  genres: string[];
  dominantMood: string;
  modelVersion: string;
  results: RecommendationItem[];
  searchMetrics?: Record<string, any>;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  status: string;
  created_at: string;
}

export interface UserInterest {
  category: string;
  value: string;
  preference: 'like' | 'neutral' | 'avoid';
  weight: number;
  source?: string;
}

export interface GenreBelief {
  alpha: number;
  beta: number;
  mean: number;
  variance: number;
  ci_lower?: number;
  ci_upper?: number;
  evidence_count: number;
}

export interface Watchlist {
  id: string;
  userId: string;
  name: string;
  movieIds: string[];
  movies?: Movie[];
  createdAt: string;
}

export interface WatchPartyMember {
  userId: string;
  name: string;
  role: string;
  likedGenres: string[];
  dislikedGenres: string[];
  vetoes: string[];
  preferredMood: string;
  availability: string[];
}

export interface WatchPartyRoom {
  id: string;
  code: string;
  hostUserId: string;
  hostName: string;
  status: string;
  members: WatchPartyMember[];
  recommendations?: any;
  createdAt: string;
}

export interface TimelineItem {
  type: 'movie' | 'break';
  item_id?: string;
  title?: string;
  runtime?: number;
  genres?: string[];
  start_time: string;
  end_time: string;
  role?: string;
  break_type?: string;
  label?: string;
  duration_minutes?: number;
}

export interface MarathonPlan {
  plan_id: string;
  start_time: string;
  finish_time: string;
  total_duration_minutes: number;
  movie_count: number;
  timeline: TimelineItem[];
  curfew_satisfied: boolean;
  curfew_note: string;
  goal_stack_trace: string[];
  pacing_explanations: string[];
}
