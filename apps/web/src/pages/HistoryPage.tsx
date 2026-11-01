import React, { useState, useEffect } from 'react';
import { feedbackApi } from '../services/api';
import { PostWatchReviewModal } from '../components/PostWatchReviewModal';
import { 
  History, 
  Star, 
  Clock, 
  MessageSquare
} from 'lucide-react';

export const HistoryPage: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Review modal
  const [modalOpen, setModalOpen] = useState(false);
  const [targetMovie, setTargetMovie] = useState<{ id: string; title: string } | null>(null);

  const loadData = async () => {
    try {
      const res = await feedbackApi.getHistory();
      setHistory(res.data.history || []);
      setReviews(res.data.reviews || []);
    } catch (err) {
      console.error('Failed to load history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReviewModal = (id: string, title: string) => {
    setTargetMovie({ id, title });
    setModalOpen(true);
  };

  const handleReviewSubmitted = () => {
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-3 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[#d4d4e2] mono font-semibold">Loading interaction history & reviews...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/[0.08] pb-8">
        <div>
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white mb-3 shadow-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracked-caps text-[#f24c27]">Feedback Loop</span>
            <span className="text-white/20">|</span>
            <span className="text-[#d4d4e2] font-medium">Bayesian Taste Calibration</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Watch History & Reviews</h1>
          <p className="text-sm sm:text-base text-[#c8c8d8] mt-2 font-normal leading-relaxed">
            Track completed watches and submit ratings to calibrate your taste profile dynamically.
          </p>
        </div>
      </div>

      {/* Submitted Reviews Section */}
      <div className="space-y-5">
        <h2 className="tracked-caps text-white font-bold text-sm flex items-center gap-2.5">
          <MessageSquare className="w-4 h-4 text-[#f24c27]" />
          <span>Completed Post-Watch Reviews ({reviews.length})</span>
        </h2>

        {reviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {reviews.map((rev: any) => (
              <div key={rev.id} className="evo-card p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-base font-bold text-white">
                    {rev.movie?.title || 'Movie'}
                  </h4>
                  <span className="text-xs text-[#a0a0ab] mono">
                    {new Date(rev.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-center text-xs">
                  <div className="evocuir-glass-pill p-3">
                    <span className="text-[11px] text-[#a0a0ab] uppercase tracking-wider block font-bold">Enjoyment</span>
                    <span className="font-extrabold text-amber-400 mono text-sm">{rev.enjoyment}/5 ★</span>
                  </div>
                  <div className="evocuir-glass-pill p-3">
                    <span className="text-[11px] text-[#a0a0ab] uppercase tracking-wider block font-bold">Rec Fit</span>
                    <span className="font-extrabold text-emerald-400 mono text-sm">{rev.recommendationAccuracy}/5</span>
                  </div>
                  <div className="evocuir-glass-pill p-3">
                    <span className="text-[11px] text-[#a0a0ab] uppercase tracking-wider block font-bold">Pacing</span>
                    <span className="font-extrabold text-sky-400 mono text-sm capitalize">{rev.pacingFit || 'balanced'}</span>
                  </div>
                </div>

                {rev.notes && (
                  <p className="text-sm text-[#c8c8d8] italic font-normal leading-relaxed">
                    "{rev.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="evo-card p-10 text-center space-y-3">
            <p className="text-sm text-[#a0a0ab]">No post-watch reviews recorded yet.</p>
          </div>
        )}
      </div>

      {/* Watch Events History */}
      <div className="space-y-5">
        <h2 className="tracked-caps text-white font-bold text-sm flex items-center gap-2.5">
          <History className="w-4 h-4 text-[#f24c27]" />
          <span>Interaction History ({history.length})</span>
        </h2>

        {history.length > 0 ? (
          <div className="space-y-3">
            {history.map((ev: any) => (
              <div key={ev.id} className="bento-box p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${
                    ev.eventType === 'completed_watch' ? 'bg-emerald-400' : 'bg-[#f24c27]'
                  }`} />
                  <div>
                    <span className="font-bold text-white text-base">{ev.movie?.title || ev.movieId}</span>
                    <span className="text-xs text-[#a0a0ab] ml-2 mono uppercase font-semibold">({ev.eventType})</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-xs text-[#a0a0ab] mono">
                    {new Date(ev.occurredAt).toLocaleString()}
                  </span>
                  {ev.eventType === 'completed_watch' && (
                    <button
                      onClick={() => openReviewModal(ev.movieId, ev.movie?.title || 'Movie')}
                      className="evocuir-glass-pill px-3 py-1.5 text-xs font-bold text-[#f24c27] hover:border-[#f24c27]"
                    >
                      Rate & Review
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="evo-card p-10 text-center space-y-3">
            <p className="text-sm text-[#a0a0ab]">No watch interactions logged yet. Mark movies as watched to track your journey.</p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {targetMovie && (
        <PostWatchReviewModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          movieId={targetMovie.id}
          movieTitle={targetMovie.title}
          recommendationItemId="history"
          onReviewSubmitted={handleReviewSubmitted}
        />
      )}
    </div>
  );
};
