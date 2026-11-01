import React, { useState } from 'react';
import { Star, X, CheckCircle, Sparkles, BrainCircuit } from 'lucide-react';
import { feedbackApi } from '../services/api';

interface PostWatchReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  movieId: string;
  movieTitle: string;
  recommendationItemId?: string;
  onReviewSubmitted?: (trace: any) => void;
}

export const PostWatchReviewModal: React.FC<PostWatchReviewModalProps> = ({
  isOpen,
  onClose,
  movieId,
  movieTitle,
  recommendationItemId = 'direct_watch',
  onReviewSubmitted
}) => {
  const [enjoyment, setEnjoyment] = useState<number>(5);
  const [accuracy, setAccuracy] = useState<number>(5);
  const [moodMatch, setMoodMatch] = useState<string>('Yes');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submittedTrace, setSubmittedTrace] = useState<any>(null);

  if (!isOpen) return null;

  const availableTags = [
    'Genre Match', 'Compelling Story', 'Fast Pacing', 'Slow Burn',
    'Great Cast', 'Perfect Runtime', 'Atmospheric', 'Too Predictable', 'Too Intense'
  ];

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await feedbackApi.submitReview(recommendationItemId, {
        movieId,
        enjoyment,
        recommendationAccuracy: accuracy,
        moodMatch,
        reasonTags: selectedTags
      });

      setSubmittedTrace(res.data.learningTrace);
      if (onReviewSubmitted) {
        onReviewSubmitted(res.data.learningTrace);
      }
    } catch (err) {
      console.error('Failed to submit review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      <div className="relative w-full max-w-lg evo-card-glow p-6 sm:p-8 text-white max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full evocuir-glass-pill flex items-center justify-center text-[#888896] hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        {!submittedTrace ? (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 text-[#f24c27] text-xs font-bold uppercase tracking-wider mb-1">
                <BrainCircuit className="w-4 h-4" />
                <span>Post-Watch Feedback Loop (F-22)</span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight">How was {movieTitle}?</h2>
              <p className="text-xs text-[#888896] mt-1 font-light">
                Your feedback calibrates the Bayesian taste model, updating genre and context weights.
              </p>
            </div>

            {/* Question 1: Enjoyment Rating */}
            <div className="bento-box p-4 space-y-2">
              <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider">
                1. How much did you enjoy the movie? ({enjoyment}/5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setEnjoyment(val)}
                    className="p-1 transition hover:scale-110"
                  >
                    <Star
                      className={`w-7 h-7 ${
                        val <= enjoyment ? 'fill-amber-400 text-amber-400' : 'text-[#444450]'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Question 2: Recommendation Accuracy */}
            <div className="bento-box p-4 space-y-2">
              <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider">
                2. Recommendation fit to your goal ({accuracy}/5)
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAccuracy(val)}
                    className={`w-10 h-10 rounded-full font-bold text-xs mono transition ${
                      accuracy === val
                        ? 'bg-white text-black font-bold shadow-md'
                        : 'evocuir-glass-pill text-[#888896] hover:text-white'
                    }`}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 3: Mood Match */}
            <div className="bento-box p-4 space-y-2">
              <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider">
                3. Did it fit your requested mood?
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Yes', 'Partly', 'No'].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setMoodMatch(opt)}
                    className={`py-2 px-3 rounded-full text-xs font-semibold transition ${
                      moodMatch === opt
                        ? 'bg-[#f24c27] text-white font-bold shadow-md shadow-[#f24c27]/25'
                        : 'evocuir-glass-pill text-[#888896] hover:text-white'
                    }`}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>

            {/* Question 4: Attribute Tags */}
            <div className="bento-box p-4 space-y-2">
              <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider">
                4. What influenced your rating?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {availableTags.map((tag) => {
                  const active = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`text-xs px-3 py-1 rounded-full border transition ${
                        active
                          ? 'bg-white text-black font-bold border-white shadow-sm'
                          : 'evocuir-glass-pill text-[#888896] hover:text-white'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/[0.06]">
              <button
                type="button"
                onClick={onClose}
                className="btn-evo-ghost !text-xs !py-2.5 !px-4"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-evo-accent !text-xs !py-2.5 !px-6 shadow-lg disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>{submitting ? 'Updating Bayesian Beliefs...' : 'Submit Review'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="py-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
              <CheckCircle className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">Taste Beliefs Updated!</h3>
            <p className="text-xs text-[#888896] max-w-sm mx-auto leading-relaxed font-light">
              {submittedTrace.learning_note || 'Bayesian posterior probabilities have been recalculated.'}
            </p>

            {submittedTrace.genre_updates && (
              <div className="bento-box p-3 text-left text-xs mono text-[#888896] space-y-1.5 max-h-40 overflow-y-auto">
                <div className="tracked-caps text-[#f24c27]">Inference Trace:</div>
                {Object.entries(submittedTrace.genre_updates).map(([genre, data]: [string, any]) => (
                  <div key={genre} className="flex justify-between items-center text-[11px] border-b border-white/[0.06] pb-1">
                    <span className="text-white">{genre}:</span>
                    <span className="text-emerald-400">
                      μ {data.prior?.mean?.toFixed(2)} → {data.posterior?.mean?.toFixed(2)} (α={data.posterior?.alpha}, β={data.posterior?.beta})
                    </span>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={onClose}
              className="mt-4 btn-evo-primary !text-xs !py-2 !px-6"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
