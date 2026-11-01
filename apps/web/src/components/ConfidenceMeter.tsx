import React from 'react';
import { ShieldCheck, Sparkles, HelpCircle } from 'lucide-react';

interface ConfidenceMeterProps {
  matchScore: number;
  scoreLabel: string;
  confidenceLevel: string;
  scoreBreakdown?: {
    genre_fit: number;
    mood_fit: number;
    historical_taste: number;
    critical_rating: number;
    runtime_fit: number;
  };
  supportingFactors?: string[];
  uncertaintyFactors?: string[];
}

export const ConfidenceMeter: React.FC<ConfidenceMeterProps> = ({
  matchScore,
  scoreLabel,
  confidenceLevel,
  scoreBreakdown,
  supportingFactors = [],
  uncertaintyFactors = []
}) => {
  // Color palette based on match score
  const getBadgeColors = () => {
    if (matchScore >= 85) return 'text-emerald-400 bg-emerald-500/15 border-emerald-500/40 shadow-sm';
    if (matchScore >= 70) return 'text-[#f24c27] bg-[#f24c27]/15 border-[#f24c27]/40 shadow-sm';
    return 'text-sky-400 bg-sky-500/15 border-sky-500/40';
  };

  const getBarColor = () => {
    if (matchScore >= 85) return 'from-emerald-500 to-teal-400';
    if (matchScore >= 70) return 'from-[#f24c27] to-amber-400';
    return 'from-sky-500 to-indigo-400';
  };

  return (
    <div className="evo-card p-6 space-y-4">
      {/* Header with Match Score */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles className="w-4 h-4 text-[#f24c27]" />
          <span className="tracked-caps text-white font-bold text-xs">
            Confidence & Calibration
          </span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border mono ${getBadgeColors()}`}>
          {matchScore}/100 • {scoreLabel}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-white/[0.08] h-2 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${getBarColor()} transition-all duration-700`}
          style={{ width: `${Math.max(5, matchScore)}%` }}
        />
      </div>

      {/* Score Breakdown Pills */}
      {scoreBreakdown && (
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs text-[#d4d4e2]">
          <div className="evocuir-glass-pill p-2.5 text-center">
            <span className="block text-[11px] text-[#a0a0ab] uppercase tracking-wider font-bold">Genre</span>
            <span className="font-extrabold text-white mono text-sm">{scoreBreakdown.genre_fit}/35</span>
          </div>
          <div className="evocuir-glass-pill p-2.5 text-center">
            <span className="block text-[11px] text-[#a0a0ab] uppercase tracking-wider font-bold">Mood</span>
            <span className="font-extrabold text-white mono text-sm">{scoreBreakdown.mood_fit}/25</span>
          </div>
          <div className="evocuir-glass-pill p-2.5 text-center">
            <span className="block text-[11px] text-[#a0a0ab] uppercase tracking-wider font-bold">Taste</span>
            <span className="font-extrabold text-white mono text-sm">{scoreBreakdown.historical_taste}/20</span>
          </div>
          <div className="evocuir-glass-pill p-2.5 text-center">
            <span className="block text-[11px] text-[#a0a0ab] uppercase tracking-wider font-bold">Rating</span>
            <span className="font-extrabold text-white mono text-sm">{scoreBreakdown.critical_rating}/10</span>
          </div>
          <div className="evocuir-glass-pill p-2.5 text-center col-span-2 sm:col-span-1">
            <span className="block text-[11px] text-[#a0a0ab] uppercase tracking-wider font-bold">Runtime</span>
            <span className="font-extrabold text-white mono text-sm">{scoreBreakdown.runtime_fit}/10</span>
          </div>
        </div>
      )}

      {/* Supporting Factors */}
      {supportingFactors.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <span className="tracked-caps text-[#f24c27] block text-[11px]">Primary Match Factors:</span>
          {supportingFactors.map((factor, i) => (
            <div key={i} className="flex items-start gap-2.5 text-sm text-[#d4d4e2] font-normal leading-relaxed">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      )}

      {/* Uncertainty Factors if any */}
      {uncertaintyFactors && uncertaintyFactors.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-white/[0.08]">
          <span className="tracked-caps text-amber-400 block text-[11px]">Potential Mismatches / Trade-offs:</span>
          {uncertaintyFactors.map((factor, i) => (
            <div key={i} className="flex items-start gap-2.5 text-xs text-[#d4d4e2]">
              <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{factor}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
