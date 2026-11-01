import React, { useState, useEffect } from 'react';
import { feedbackApi, authApi } from '../services/api';
import { 
  BrainCircuit, 
  RotateCcw, 
  Sparkles, 
  TrendingUp,
  Layers
} from 'lucide-react';

export const TasteProfilePage: React.FC = () => {
  const [genreBeliefs, setGenreBeliefs] = useState<Record<string, any>>({});
  const [interests, setInterests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);

  const loadProfile = async () => {
    try {
      const [prefRes, intRes] = await Promise.all([
        feedbackApi.getPreferences(),
        authApi.getInterests()
      ]);
      setGenreBeliefs(prefRes.data?.genreBeliefs || {});
      setInterests(intRes.data?.interests || []);
    } catch (err) {
      console.error('Failed to load taste profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to reset all learned preference beliefs back to default uninformative Beta(2, 2) priors?')) {
      return;
    }
    setResetting(true);
    try {
      await feedbackApi.resetPreferences();
      setGenreBeliefs({});
      alert('Preferences reset successfully.');
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-2 border-[#f24c27] border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-[#888896] mono">Loading Bayesian taste beliefs...</p>
      </div>
    );
  }

  const beliefEntries = Object.entries(genreBeliefs);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-10">
      
      {/* Header (Ahmedabad OS Style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.08] text-xs font-semibold text-white mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="tracked-caps text-[#f24c27]">Taste Learner</span>
            <span className="text-white/20">|</span>
            <span className="text-[#a0a0ab] font-light">Conjugate Beta-Binomial Inference (F-13)</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Learned Taste Beliefs</h1>
          <p className="text-xs text-[#888896] mt-1 font-light">
            Conjugate Beta-Binomial models maintain mean preference probability and uncertainty intervals.
          </p>
        </div>

        <button
          onClick={handleReset}
          disabled={resetting || beliefEntries.length === 0}
          className="evocuir-glass-pill px-4 py-2 text-xs font-semibold text-[#888896] hover:text-rose-400 hover:border-rose-500/30 transition flex items-center gap-2 disabled:opacity-30"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Learned Beliefs</span>
        </button>
      </div>

      {/* Explanatory Callout (EvoAir Glow Bento) */}
      <div className="evo-card p-5 text-xs text-[#a0a0ab] leading-relaxed flex items-start gap-3.5 font-light">
        <div className="w-8 h-8 rounded-full bg-[#f24c27]/10 flex items-center justify-center shrink-0 mt-0.5">
          <Sparkles className="w-4 h-4 text-[#f24c27]" />
        </div>
        <div>
          <strong className="text-white font-bold block mb-1">How Bayesian Updating Operates:</strong>
          Prior belief begins at <code className="text-[#f24c27] mono font-semibold">Beta(α=2.0, β=2.0)</code> (mean 0.50). Each 5-star rating adds evidence <code className="text-emerald-400 mono font-semibold">Δα=2.5</code>, while explicit dislikes add <code className="text-rose-400 mono font-semibold">Δβ=2.0</code>. Posterior mean represents your probability of enjoying matching titles.
        </div>
      </div>

      {/* Active Genre Beliefs Grid */}
      <div className="space-y-4">
        <h2 className="tracked-caps text-white flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5 text-[#f24c27]" />
          <span>Genre Preference Distributions ({beliefEntries.length})</span>
        </h2>

        {beliefEntries.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {beliefEntries.map(([genre, b]: [string, any]) => {
              const meanPct = Math.round(b.mean * 100);
              const ciLower = Math.round((b.ci_lower || 0.2) * 100);
              const ciUpper = Math.round((b.ci_upper || 0.8) * 100);

              return (
                <div key={genre} className="evo-card p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{genre}</h3>
                    <span className="text-xs mono font-bold text-[#f24c27]">
                      {meanPct}% Affinity
                    </span>
                  </div>

                  {/* Progress Bar with Credible Interval */}
                  <div className="space-y-1.5">
                    <div className="w-full bg-white/[0.06] h-2 rounded-full overflow-hidden relative">
                      <div
                        className="bg-gradient-to-r from-[#f24c27] to-amber-400 h-full rounded-full transition-all duration-500"
                        style={{ width: `${meanPct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-[#777785] mono">
                      <span>95% CI: [{ciLower}% - {ciUpper}%]</span>
                      <span>n = {b.evidence_count || 1}</span>
                    </div>
                  </div>

                  {/* Beta Parameters */}
                  <div className="pt-2 border-t border-white/[0.06] grid grid-cols-3 gap-2 text-center text-[10px] mono text-[#888896]">
                    <div className="bento-box p-1.5">
                      <span className="text-[#666675] block text-[9px] uppercase tracking-wider font-sans">α (Pos)</span>
                      <span className="text-white font-bold">{b.alpha}</span>
                    </div>
                    <div className="bento-box p-1.5">
                      <span className="text-[#666675] block text-[9px] uppercase tracking-wider font-sans">β (Neg)</span>
                      <span className="text-white font-bold">{b.beta}</span>
                    </div>
                    <div className="bento-box p-1.5">
                      <span className="text-[#666675] block text-[9px] uppercase tracking-wider font-sans">Var</span>
                      <span className="text-white font-bold">{b.variance}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="evo-card p-10 text-center space-y-3">
            <BrainCircuit className="w-10 h-10 text-[#555562] mx-auto" />
            <h3 className="text-sm font-bold text-white">Default Prior Beliefs Active</h3>
            <p className="text-xs text-[#888896] max-w-sm mx-auto font-light">
              Your profile is currently regularized at Beta(2.0, 2.0). As you rate movies or dismiss recommendations, Bayesian updates will populate this dashboard.
            </p>
          </div>
        )}
      </div>

      {/* Explicit Onboarding Interests */}
      <div className="space-y-4">
        <h2 className="tracked-caps text-white flex items-center gap-2">
          <Layers className="w-3.5 h-3.5 text-[#f24c27]" />
          <span>Explicit Onboarding Preferences ({interests.length})</span>
        </h2>

        {interests.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {interests.map((item: any, idx: number) => (
              <span
                key={idx}
                className={`text-xs px-3.5 py-1.5 rounded-full border flex items-center gap-2 ${
                  item.preference === 'like'
                    ? 'bg-white/[0.04] text-white border-white/[0.1]'
                    : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                }`}
              >
                <span>{item.preference === 'like' ? '★' : '✕'}</span>
                <span className="font-medium">{item.value}</span>
                <span className="text-[10px] text-[#777785]">({item.category})</span>
              </span>
            ))}
          </div>
        ) : (
          <div className="text-xs text-[#777785] italic font-light">No explicit onboarding preferences stored.</div>
        )}
      </div>
    </div>
  );
};
