import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('cinemind_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: (data: { name: string; email: string; password: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  quickLogin: (role: 'host' | 'guest') => api.post('/auth/quick-login', { role }),
  getMe: () => api.get('/users/me'),
  updateProfile: (data: { name: string }) => api.patch('/users/me', data),
  getInterests: () => api.get('/users/me/interests'),
  saveInterests: (interests: any[]) => api.put('/users/me/interests', { interests }),
  getTaxonomies: () => api.get('/interest-categories')
};

export const moviesApi = {
  list: (params?: any) => api.get('/movies', { params }),
  get: (id: string) => api.get(`/movies/${id}`),
  getAlternatives: (id: string, params?: any) => api.get(`/movies/${id}/alternatives`, { params })
};

export const recommendationsApi = {
  createSession: (payload: any) => api.post('/recommendation-sessions', payload),
  getSession: (id: string) => api.get(`/recommendation-sessions/${id}`),
  sendAction: (sessionId: string, movieId: string, action: string) =>
    api.post(`/recommendation-sessions/${sessionId}/actions`, { movieId, action }),
  refinePlaylist: (payload: any) => api.post('/recommendations/refine', payload),
  whatIf: (payload: any) => api.post('/recommendations/what-if', payload)
};

export const watchlistApi = {
  getAll: () => api.get('/watchlists'),
  create: (name: string) => api.post('/watchlists', { name }),
  add: (movieId: string) => api.post('/watchlists/movies', { movieId }),
  addMovie: (watchlistId: string, movieId: string) => api.post(`/watchlists/${watchlistId}/movies`, { movieId }),
  removeMovie: (watchlistId: string, movieId: string) => api.delete(`/watchlists/${watchlistId}/movies/${movieId}`),
  sequence: (watchlistId: string, arc_strategy: string) =>
    api.post(`/watchlists/${watchlistId}/sequence`, { arc_strategy })
};

export const plannerApi = {
  planMarathon: (payload: any) => api.post('/plans/marathon', payload),
  replan: (payload: any) => api.post('/plans/replan', payload)
};

export const watchPartyApi = {
  create: () => api.post('/watch-parties'),
  get: (idOrCode: string) => api.get(`/watch-parties/${idOrCode}`),
  join: (idOrCode: string) => api.post(`/watch-parties/${idOrCode}/join`),
  updatePreferences: (idOrCode: string, payload: any) => api.post(`/watch-parties/${idOrCode}/availability`, payload),
  recommend: (idOrCode: string, mode: string) => api.post(`/watch-parties/${idOrCode}/recommend`, { mode }),
  selectMovie: (idOrCode: string, movie: any) => api.post(`/watch-parties/${idOrCode}/select-movie`, { movie }),
  syncPlayback: (idOrCode: string, playback: { isPlaying: boolean; currentTime: number }) =>
    api.post(`/watch-parties/${idOrCode}/sync`, playback),
  sendChat: (idOrCode: string, payload: { text?: string; reaction?: string }) =>
    api.post(`/watch-parties/${idOrCode}/chat`, payload),
  submitPollVote: (idOrCode: string, optionIndex: number) =>
    api.post(`/watch-parties/${idOrCode}/poll-vote`, { optionIndex }),
  switchStage: (idOrCode: string, stage: string) =>
    api.post(`/watch-parties/${idOrCode}/stage`, { stage })
};

export const feedbackApi = {
  submitReview: (itemId: string, payload: any) => api.post(`/recommendations/${itemId}/feedback`, payload),
  getHistory: () => api.get('/users/me/history'),
  getPreferences: () => api.get('/users/me/preferences'),
  resetPreferences: () => api.post('/users/me/preferences/reset')
};

export const assistantApi = {
  parseGoal: (prompt: string) => api.post('/assistant/parse-goal', { prompt })
};

export const vivaApi = {
  getDiagnostics: () => api.get('/viva/diagnostics'),
  getFrame: (frameId: string) => api.get(`/viva/frames/${frameId}`),
  getGraphPath: (movieA: string, movieB: string) => api.get(`/viva/graph/path/${movieA}/${movieB}`),
  getLabDemo: (algorithm: string, param?: string) =>
    api.get(`/viva/lab-demo/${algorithm}${param ? `?param=${encodeURIComponent(param)}` : ''}`),
  explainChoice: (payload: {
    movie_id: string;
    target_genres?: string[];
    mood?: number;
    time_budget_minutes?: number;
    audience?: string;
    exclude_violence?: boolean;
  }) => api.post('/viva/explain-choice', payload),
  whatIf: (payload: any) => api.post('/viva/what-if', payload)
};

export default api;
