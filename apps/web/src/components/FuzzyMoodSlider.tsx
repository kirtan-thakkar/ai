import React from 'react';
import { Sun, Flame, Zap, Compass } from 'lucide-react';

interface FuzzyMoodSliderProps {
  value: number;
  onChange: (val: number) => void;
  showDetails?: boolean;
}

export const FuzzyMoodSlider: React.FC<FuzzyMoodSliderProps> = ({
  value,
  onChange,
  showDetails = true
}) => {
  // Client-side fuzzy approximation for instantaneous slider feedback
  const getFuzzyDistribution = (x: number) => {
    const chill = Math.max(0, Math.min(1, x <= 2.5 ? 1 : (4.5 - x) / 2));
    const balanced = Math.max(0, Math.min(1, x < 5 ? (x - 3) / 2 : (7 - x) / 2));
    const energetic = Math.max(0, Math.min(1, x < 7.5 ? (x - 5.5) / 2 : (9 - x) / 1.5));
    const intense = Math.max(0, Math.min(1, x < 7.5 ? 0 : (x - 7.5) / 1.5));
    const thoughtful = Math.max(0, Math.min(1, x < 4 ? 0 : (x < 7 ? (x - 4) / 3 : 1)));

    return {
      chill: Number(chill.toFixed(2)),
      balanced: Number(balanced.toFixed(2)),
      energetic: Number(energetic.toFixed(2)),
      intense: Number(intense.toFixed(2)),
      thoughtful: Number(thoughtful.toFixed(2))
    };
  };

  const fuzzy = getFuzzyDistribution(value);

  const getDominantMood = () => {
    if (value <= 3) return { label: 'Relaxed & Cozy', color: 'text-sky-400', icon: Sun };
    if (value <= 6) return { label: 'Balanced & Mellow', color: 'text-emerald-400', icon: Compass };
    if (value <= 8) return { label: 'Energetic & Upbeat', color: 'text-amber-400', icon: Zap };
    return { label: 'Intense & Mind-Bending', color: 'text-[#f24c27]', icon: Flame };
  };

  const dominant = getDominantMood();
  const Icon = dominant.icon;

  return (
    <div className="evo-card p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-white/[0.06] border border-white/[0.12] flex items-center justify-center">
            <Icon className={`w-5 h-5 ${dominant.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white uppercase tracking-wider">
                Mood Dial: <span className={dominant.color}>{dominant.label}</span>
              </h3>
            </div>
            <p className="text-xs text-[#a0a0ab] font-medium mt-0.5">Fuzzy Logic Membership Engine</p>
          </div>
        </div>
        <div className="text-2xl font-extrabold text-white mono px-4 py-1.5 rounded-full evocuir-glass-pill shadow-inner">
          {value.toFixed(1)}<span className="text-xs text-[#a0a0ab] font-normal">/10</span>
        </div>
      </div>

      {/* Slider Input */}
      <div className="relative pt-3 pb-1">
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value))}
          className="w-full h-2.5 bg-white/[0.08] rounded-full appearance-none cursor-pointer accent-[#f24c27] transition"
        />
        <div className="flex justify-between text-xs text-[#d4d4e2] font-semibold mono mt-2 px-1">
          <span>1.0 Chill</span>
          <span>4.0 Balanced</span>
          <span>7.0 Energetic</span>
          <span>10.0 Intense</span>
        </div>
      </div>

      {/* Fuzzy Distribution Bars (EvoAir Glass Monitors) */}
      {showDetails && (
        <div className="space-y-3 pt-3.5 border-t border-white/[0.08]">
          <div className="flex items-center justify-between text-xs text-[#d4d4e2]">
            <span className="tracked-caps text-[#f24c27]">Fuzzy Membership Degrees (μ):</span>
            <span className="text-xs text-[#a0a0ab] font-mono">Soft Overlap Curves</span>
          </div>

          <div className="grid grid-cols-5 gap-2.5 text-center text-xs">
            <div>
              <div className="h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-end p-1">
                <div
                  className="w-full bg-sky-400 rounded-lg transition-all duration-300"
                  style={{ height: `${Math.max(8, fuzzy.chill * 100)}%` }}
                />
              </div>
              <span className="text-[#d4d4e2] font-medium block mt-1.5">Chill</span>
              <span className="text-white mono font-bold">{fuzzy.chill}</span>
            </div>

            <div>
              <div className="h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-end p-1">
                <div
                  className="w-full bg-emerald-400 rounded-lg transition-all duration-300"
                  style={{ height: `${Math.max(8, fuzzy.balanced * 100)}%` }}
                />
              </div>
              <span className="text-[#d4d4e2] font-medium block mt-1.5">Balanced</span>
              <span className="text-white mono font-bold">{fuzzy.balanced}</span>
            </div>

            <div>
              <div className="h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-end p-1">
                <div
                  className="w-full bg-amber-400 rounded-lg transition-all duration-300"
                  style={{ height: `${Math.max(8, fuzzy.energetic * 100)}%` }}
                />
              </div>
              <span className="text-[#d4d4e2] font-medium block mt-1.5">Energetic</span>
              <span className="text-white mono font-bold">{fuzzy.energetic}</span>
            </div>

            <div>
              <div className="h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-end p-1">
                <div
                  className="w-full bg-[#f24c27] rounded-lg transition-all duration-300"
                  style={{ height: `${Math.max(8, fuzzy.intense * 100)}%` }}
                />
              </div>
              <span className="text-[#d4d4e2] font-medium block mt-1.5">Intense</span>
              <span className="text-white mono font-bold">{fuzzy.intense}</span>
            </div>

            <div>
              <div className="h-12 bg-white/[0.04] border border-white/[0.08] rounded-xl flex items-end p-1">
                <div
                  className="w-full bg-purple-400 rounded-lg transition-all duration-300"
                  style={{ height: `${Math.max(8, fuzzy.thoughtful * 100)}%` }}
                />
              </div>
              <span className="text-[#d4d4e2] font-medium block mt-1.5">Thoughtful</span>
              <span className="text-white mono font-bold">{fuzzy.thoughtful}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
