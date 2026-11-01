import React, { useState } from 'react';
import { plannerApi } from '../services/api';
import { 
  Calendar, 
  Clock, 
  FastForward, 
  Sparkles, 
  RefreshCw,
  Cpu
} from 'lucide-react';

export const PlannerPage: React.FC = () => {
  const [startTime, setStartTime] = useState('18:00');
  const [curfewTime, setCurfewTime] = useState('01:30');
  const [movieCount, setMovieCount] = useState(3);
  const [includeMealBreak, setIncludeMealBreak] = useState(true);
  const [mealBreakMinutes, setMealBreakMinutes] = useState(40);
  const [mood, setMood] = useState(7.5);

  const [plan, setPlan] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [replanning, setReplanning] = useState(false);
  const [replanLog, setReplanLog] = useState<string[]>([]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setReplanLog([]);
    try {
      const res = await plannerApi.planMarathon({
        start_time: startTime,
        movie_count: movieCount,
        mood,
        include_meal_break: includeMealBreak,
        meal_break_minutes: mealBreakMinutes,
        curfew_time: curfewTime
      });
      setPlan(res.data);
    } catch (err) {
      console.error('Marathon planning error:', err);
      alert('Planning failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Reactive Replanning on Drop-off
  const handleSimulateDropOff = async (itemToSkip: any) => {
    if (!plan) return;
    setReplanning(true);
    try {
      const res = await plannerApi.replan({
        current_timeline: plan.timeline,
        event_type: 'movie_skipped',
        event_payload: {
          skipped_item_id: itemToSkip.item_id,
          replace_with_alternative: true
        }
      });

      setPlan({
        ...plan,
        timeline: res.data.replanned_timeline,
        finish_time: res.data.new_finish_time
      });
      setReplanLog(res.data.replan_notes || []);
    } catch (err) {
      console.error('Replanning error:', err);
    } finally {
      setReplanning(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-white shadow-md">
          <span className="w-2 h-2 rounded-full bg-[#f24c27] animate-pulse" />
          <span className="tracked-caps text-[#f24c27]">Temporal Scheduler</span>
          <span className="text-white/20">|</span>
          <span className="text-[#d4d4e2] font-medium">Goal Stack Planning & Reactive Replanning</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-[1.1]">
          Movie Marathon Planner
        </h1>
        <p className="text-sm sm:text-base text-[#c8c8d8] max-w-2xl mx-auto font-normal leading-relaxed">
          Generates structured timelines incorporating intermissions, food intervals, and curfew constraints with reactive replanning when drop-offs occur.
        </p>
      </div>

      {/* Planning Controls Form */}
      <form onSubmit={handleGeneratePlan} className="evo-card p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
          <div>
            <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
              Start Time
            </label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full evocuir-glass-pill px-4 py-3 text-sm text-white mono font-bold focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
              Curfew / Finish Limit
            </label>
            <input
              type="time"
              value={curfewTime}
              onChange={(e) => setCurfewTime(e.target.value)}
              className="w-full evocuir-glass-pill px-4 py-3 text-sm text-white mono font-bold focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
              Movie Count
            </label>
            <select
              value={movieCount}
              onChange={(e) => setMovieCount(parseInt(e.target.value))}
              className="w-full evocuir-glass-pill px-4 py-3 text-sm font-semibold text-white focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
            >
              <option value={2} className="bg-[#0c0c12]">2 Titles (Double Feature)</option>
              <option value={3} className="bg-[#0c0c12]">3 Titles (Classic Trilogy)</option>
              <option value={4} className="bg-[#0c0c12]">4 Titles (Full Marathon)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#d4d4e2] uppercase tracking-wider mb-2.5">
              Dinner Break (mins)
            </label>
            <input
              type="number"
              min={15}
              max={90}
              value={mealBreakMinutes}
              onChange={(e) => setMealBreakMinutes(parseInt(e.target.value))}
              className="w-full evocuir-glass-pill px-4 py-3 text-sm text-white mono font-bold focus:outline-none focus:border-[#f24c27] bg-[#0c0c12]"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 pt-5 border-t border-white/[0.08]">
          <label className="flex items-center gap-3.5 text-sm font-medium text-[#d4d4e2] hover:text-white cursor-pointer transition">
            <input
              type="checkbox"
              checked={includeMealBreak}
              onChange={(e) => setIncludeMealBreak(e.target.checked)}
              className="w-5 h-5 rounded-md accent-[#f24c27] bg-white/[0.05]"
            />
            <span>Include Scheduled Dinner Break 🍕</span>
          </label>

          <button
            type="submit"
            disabled={loading}
            className="btn-evo-accent !text-sm !py-3.5 !px-8 shadow-xl disabled:opacity-50"
          >
            <Calendar className="w-4 h-4" />
            <span>{loading ? 'Planning Goal Stack...' : 'Schedule Marathon'}</span>
          </button>
        </div>
      </form>

      {/* Reactive Replan Feedback Banner */}
      {replanLog.length > 0 && (
        <div className="p-5 rounded-2xl bg-white/[0.04] border border-purple-500/40 text-sm text-purple-200 space-y-2 animate-fadeIn shadow-lg">
          <div className="flex items-center gap-2 font-bold uppercase text-xs tracking-wider text-purple-400">
            <RefreshCw className="w-4 h-4 text-purple-400 animate-spin" />
            <span>Reactive Replanning Triggered</span>
          </div>
          {replanLog.map((log, i) => (
            <p key={i} className="font-normal text-[#e0d0f0]">• {log}</p>
          ))}
        </div>
      )}

      {/* Generated Timeline View */}
      {plan && (
        <div className="evo-card p-6 sm:p-8 space-y-7">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
            <div>
              <span className="text-xs text-[#f24c27] uppercase mono font-bold tracking-widest">
                Goal Stack Plan: {plan.plan_id}
              </span>
              <h2 className="text-2xl font-bold text-white mt-1.5">
                Marathon Timeline: <span className="mono text-[#f24c27]">{plan.start_time}</span> → <span className="mono text-[#f24c27]">{plan.finish_time}</span>
              </h2>
              <p className="text-sm text-[#c8c8d8] font-normal mt-1">
                Total Duration: <span className="text-white font-bold">{Math.floor(plan.total_duration_minutes / 60)}h {plan.total_duration_minutes % 60}m</span> • {plan.curfew_note}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-4 py-1.5 rounded-full text-xs font-bold border ${
                plan.curfew_satisfied 
                  ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/40'
                  : 'bg-rose-500/15 text-rose-400 border-rose-500/40'
              }`}>
                {plan.curfew_satisfied ? 'Curfew Satisfied' : 'Curfew Alert'}
              </span>
            </div>
          </div>

          {/* Timeline Items Track */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-white/[0.1]">
            {plan.timeline.map((item: any, idx: number) => {
              const isMovie = item.type === 'movie';
              return (
                <div key={idx} className="relative flex items-start gap-4 pl-2 group">
                  {/* Indicator Icon */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 z-10 border ${
                    isMovie
                      ? 'bg-[#f24c27] text-white border-[#f24c27] font-bold text-sm shadow-lg shadow-[#f24c27]/30'
                      : 'evocuir-glass-pill text-white text-sm'
                  }`}>
                    {isMovie ? idx + 1 : (item.break_type === 'meal' ? '🍕' : '☕')}
                  </div>

                  {/* Item Content Box */}
                  <div className={`flex-1 p-5 rounded-2xl border transition ${
                    isMovie
                      ? 'bg-white/[0.04] border-white/[0.1] hover:border-white/[0.25]'
                      : 'bg-white/[0.02] border-white/[0.06] text-[#c8c8d8] border-dashed'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="mono text-[#f24c27] font-bold text-sm">
                        {item.start_time} — {item.end_time}
                      </span>
                      {isMovie ? (
                        <span className="text-xs px-3 py-1 rounded-full bg-white/[0.06] text-[#d4d4e2] font-semibold border border-white/[0.1]">
                          {item.role} • {item.runtime}m
                        </span>
                      ) : (
                        <span className="text-xs text-[#a0a0ab] font-mono">
                          {item.duration_minutes} min interval
                        </span>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <h4 className="text-base font-bold text-white">
                        {item.title || item.label}
                      </h4>

                      {/* Drop-off / Skip simulation button */}
                      {isMovie && (
                        <button
                          type="button"
                          onClick={() => handleSimulateDropOff(item)}
                          disabled={replanning}
                          className="evocuir-glass-pill px-3 py-1.5 text-xs text-purple-300 hover:text-white flex items-center gap-1.5 transition font-semibold disabled:opacity-50 self-start sm:self-auto"
                          title="Simulate user skipping this movie to test dynamic replanning"
                        >
                          <FastForward className="w-3.5 h-3.5 text-purple-400" />
                          <span>Simulate Skip & Replan</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Goal Stack Trace Details */}
          <div className="pt-5 border-t border-white/[0.08] text-xs font-mono text-[#a0a0ab] space-y-2">
            <div className="text-xs text-[#f24c27] font-sans font-bold flex items-center gap-2 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-[#f24c27]" />
              <span>Goal Stack Execution Trace:</span>
            </div>
            <div className="flex flex-wrap gap-2 pt-1">
              {plan.goal_stack_trace?.map((goal: string, i: number) => (
                <span key={i} className="evocuir-glass-pill px-3 py-1 text-[#d4d4e2] text-xs font-semibold">
                  {goal}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
