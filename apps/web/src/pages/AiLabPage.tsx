import React, { useState, useEffect } from 'react';
import { vivaApi, moviesApi } from '../services/api';
import { 
  GraduationCap, 
  Search, 
  Cpu, 
  Sliders, 
  Share2, 
  TrendingUp, 
  FileCheck2, 
  Shuffle, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Layers, 
  Info, 
  ArrowRight,
  ShieldAlert,
  Clock,
  Sparkles
} from 'lucide-react';

export const AiLabPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'what_if' | 'astar' | 'csp' | 'fuzzy' | 'knowledge_graph' | 'bayesian' | 'expert_system'>('what_if');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tab Data States
  const [whatIfData, setWhatIfData] = useState<any>(null);
  const [astarData, setAstarData] = useState<any>(null);
  const [cspData, setCspData] = useState<any>(null);
  const [fuzzyData, setFuzzyData] = useState<any>(null);
  const [graphData, setGraphData] = useState<any>(null);
  const [bayesianData, setBayesianData] = useState<any>(null);
  const [expertData, setExpertData] = useState<any>(null);

  // Interactive controls state
  // What-If controls
  const [wiBudget, setWiBudget] = useState(130);
  const [wiAudience, setWiAudience] = useState('family');
  const [wiExcludeViolence, setWiExcludeViolence] = useState(true);
  const [wiMood, setWiMood] = useState(6.5);

  // Fuzzy controls
  const [fuzzySlider, setFuzzySlider] = useState(7.0);

  // Knowledge Graph controls
  const [graphMovieA, setGraphMovieA] = useState('Inception');
  const [graphMovieB, setGraphMovieB] = useState('Interstellar');

  // Bayesian controls
  const [bayesLikes, setBayesLikes] = useState(4);
  const [bayesDislikes, setBayesDislikes] = useState(1);

  // Expert system controls
  const [expertMovieId, setExpertMovieId] = useState('m_inception');
  const [expertAudience, setExpertAudience] = useState('family');
  const [expertExcludeViolence, setExpertExcludeViolence] = useState(false);

  // Load initial active tab data
  useEffect(() => {
    loadTabData(activeTab);
  }, [activeTab]);

  const loadTabData = async (tab: string) => {
    setLoading(true);
    setError(null);
    try {
      if (tab === 'what_if') {
        const res = await vivaApi.getLabDemo('what_if');
        setWhatIfData(res.data);
      } else if (tab === 'astar') {
        const res = await vivaApi.getLabDemo('astar');
        setAstarData(res.data);
      } else if (tab === 'csp') {
        const res = await vivaApi.getLabDemo('csp');
        setCspData(res.data);
      } else if (tab === 'fuzzy') {
        const res = await vivaApi.getLabDemo('fuzzy', String(fuzzySlider));
        setFuzzyData(res.data);
      } else if (tab === 'knowledge_graph') {
        const res = await vivaApi.getLabDemo('knowledge_graph', `${graphMovieA}:${graphMovieB}`);
        setGraphData(res.data);
      } else if (tab === 'bayesian') {
        const res = await vivaApi.getLabDemo('bayesian');
        setBayesianData(res.data);
      } else if (tab === 'expert_system') {
        const res = await vivaApi.getLabDemo('expert_system');
        setExpertData(res.data);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.error || err.message || 'Failed to load algorithm data');
    } finally {
      setLoading(false);
    }
  };

  // Run Custom What-If
  const handleRunCustomWhatIf = async () => {
    setLoading(true);
    setError(null);
    try {
      const payload = {
        original_request: {
          mood: 7.0,
          time_budget_minutes: 240,
          movie_count: 2,
          genres: ['Sci-Fi', 'Action'],
          audience: 'solo',
          exclude_violence: false
        },
        modified_request: {
          mood: wiMood,
          time_budget_minutes: wiBudget,
          movie_count: 2,
          genres: ['Sci-Fi', 'Action'],
          audience: wiAudience,
          exclude_violence: wiExcludeViolence
        }
      };
      const res = await vivaApi.whatIf(payload);
      setWhatIfData({
        algorithm: "Cinematic What-If Counterfactual Reasoning Engine",
        syllabus_unit: "State-Space Search & Constraint Propagation",
        scenario: {
          baseline: { time_budget: 240, audience: 'solo', exclude_violence: false, mood: 7.0 },
          counterfactual: { time_budget: wiBudget, audience: wiAudience, exclude_violence: wiExcludeViolence, mood: wiMood }
        },
        analysis: res.data.analysis
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run Graph Path
  const handleRunGraphSearch = async () => {
    setLoading(true);
    try {
      const res = await vivaApi.getLabDemo('knowledge_graph', `${graphMovieA}:${graphMovieB}`);
      setGraphData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Run Expert Proof
  const handleRunExpertProof = async () => {
    setLoading(true);
    try {
      const res = await vivaApi.explainChoice({
        movie_id: expertMovieId,
        target_genres: ['Sci-Fi', 'Action'],
        mood: 7.5,
        time_budget_minutes: 240,
        audience: expertAudience,
        exclude_violence: expertExcludeViolence
      });
      setExpertData({
        ...expertData,
        working_memory_facts: res.data.proof.working_memory_facts,
        fired_proof_steps: res.data.proof.forward_chaining_proof,
        final_conclusions: res.data.proof.deduced_conclusions,
        academic_explanation: res.data.proof.academic_explanation
      });
    } catch (err: any) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Fuzzy Slider change
  const handleFuzzyChange = async (val: number) => {
    setFuzzySlider(val);
    try {
      const res = await vivaApi.getLabDemo('fuzzy', String(val));
      setFuzzyData(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Academic Header */}
      <div className="evo-card p-8 sm:p-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f24c27]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs uppercase tracking-widest text-[#f24c27] font-extrabold mono">
                University Academic Evaluation Workbench
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Foundations of AI Algorithm Laboratory
            </h1>
            <p className="text-base text-[#c8c8d8] max-w-3xl leading-relaxed">
              Live algorithmic execution visualizer for university viva presentation. Explore deterministic state-space searches, soft fuzzy sets, adversarial minimax game trees, knowledge graph traversals, and formal expert system proofs.
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="evocuir-glass-pill px-4 py-2 border border-white/10 text-xs font-mono text-[#d4d4e2]">
              <span className="text-[#f24c27] font-bold">Course:</span> Foundations of AI (FAI)
            </div>
            <div className="evocuir-glass-pill px-4 py-2 border border-emerald-500/20 text-xs font-mono text-emerald-400">
              <span className="font-bold">Catalog:</span> 61 Titles • 584 Graph Nodes
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tab Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {[
          { id: 'what_if', label: 'What-If Engine', icon: Sparkles, desc: 'Counterfactual Search' },
          { id: 'astar', label: 'A* Search', icon: Search, desc: 'f(n)=g(n)+h(n)' },
          { id: 'csp', label: 'CSP Forward Checking', icon: Cpu, desc: 'Constraint Propagation' },
          { id: 'fuzzy', label: 'Fuzzy Mood Logic', icon: Sliders, desc: 'Soft Membership Sets' },
          { id: 'knowledge_graph', label: 'Knowledge Graph', icon: Share2, desc: 'BFS Semantic Traversal' },
          { id: 'bayesian', label: 'Bayesian Taste', icon: TrendingUp, desc: 'Beta Conjugate Update' },
          { id: 'expert_system', label: 'Expert System', icon: FileCheck2, desc: 'Forward-Chaining Proof' },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl text-sm font-bold whitespace-nowrap transition-all border ${
                active
                  ? 'bg-white text-black border-white shadow-xl scale-102 font-extrabold'
                  : 'bg-[#0c0c14]/80 text-[#d4d4e2] border-white/10 hover:border-white/30 hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${active ? 'text-[#f24c27]' : 'text-[#a0a0ab]'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 1. What-If Reasoning Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'what_if' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Interactive Control Panel */}
            <div className="evo-card p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sparkles className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">Scenario Constraints</h3>
              </div>

              <div className="space-y-5 text-sm">
                <div>
                  <div className="flex justify-between font-semibold text-white mb-2">
                    <span>Revised Time Budget</span>
                    <span className="mono text-[#f24c27] font-bold">{wiBudget} mins</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="300"
                    step="10"
                    value={wiBudget}
                    onChange={(e) => setWiBudget(Number(e.target.value))}
                    className="w-full accent-[#f24c27]"
                  />
                  <span className="text-xs text-[#a0a0ab]">Baseline was 240 mins</span>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-white mb-2">
                    <span>Target Audience</span>
                    <span className="mono text-[#f24c27] capitalize font-bold">{wiAudience}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {['solo', 'family', 'child'].map((aud) => (
                      <button
                        key={aud}
                        onClick={() => setWiAudience(aud)}
                        className={`py-2 px-3 rounded-xl font-bold capitalize text-xs border ${
                          wiAudience === aud
                            ? 'bg-[#f24c27] text-white border-[#f24c27]'
                            : 'bg-white/5 text-[#d4d4e2] border-white/10 hover:border-white/20'
                        }`}
                      >
                        {aud}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="flex justify-between font-semibold text-white mb-2">
                    <span>Mood Shift</span>
                    <span className="mono text-[#f24c27] font-bold">{wiMood.toFixed(1)} / 10</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={wiMood}
                    onChange={(e) => setWiMood(Number(e.target.value))}
                    className="w-full accent-[#f24c27]"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
                  <div className="space-y-0.5">
                    <span className="font-bold text-white block">Strict Non-Violent Filter</span>
                    <span className="text-xs text-[#a0a0ab]">Prunes Action/Crime gore</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={wiExcludeViolence}
                    onChange={(e) => setWiExcludeViolence(e.target.checked)}
                    className="w-5 h-5 accent-[#f24c27] rounded cursor-pointer"
                  />
                </div>

                <button
                  onClick={handleRunCustomWhatIf}
                  disabled={loading}
                  className="w-full btn-evo-accent !py-3 flex items-center justify-center gap-2 font-bold shadow-xl"
                >
                  <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  <span>Execute State-Space Delta</span>
                </button>
              </div>
            </div>

            {/* Delta Analysis Output */}
            <div className="lg:col-span-2 space-y-6">
              {whatIfData?.analysis ? (
                <div className="space-y-6">
                  {/* Summary Bar */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30">
                      <span className="text-xs mono uppercase text-emerald-400 font-bold block">Kept Candidates</span>
                      <span className="text-3xl font-extrabold text-white">{whatIfData.analysis.kept_count}</span>
                      <span className="text-xs text-[#a0a0ab] block mt-1">Invariant across constraints</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30">
                      <span className="text-xs mono uppercase text-rose-400 font-bold block">Pruned / Removed</span>
                      <span className="text-3xl font-extrabold text-white">{whatIfData.analysis.removed_count}</span>
                      <span className="text-xs text-[#a0a0ab] block mt-1">Eliminated by constraint shift</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30">
                      <span className="text-xs mono uppercase text-cyan-400 font-bold block">Promoted / Added</span>
                      <span className="text-3xl font-extrabold text-white">{whatIfData.analysis.added_count}</span>
                      <span className="text-xs text-[#a0a0ab] block mt-1">Selected into optimal frontier</span>
                    </div>
                  </div>

                  {/* Pruned Movies with Formal AI Justifications */}
                  <div className="evo-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-rose-400" />
                      <h4 className="text-base font-bold text-white">Pruned Movies & State-Space Justifications</h4>
                    </div>

                    {whatIfData.analysis.removed_movies?.length === 0 ? (
                      <p className="text-sm text-[#a0a0ab]">No movies were eliminated under this delta.</p>
                    ) : (
                      <div className="space-y-3">
                        {whatIfData.analysis.removed_movies.map((item: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-rose-500/20 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="font-extrabold text-white text-base">{item.movie?.title}</span>
                              <span className="text-xs text-rose-400 font-mono font-bold">PRUNED</span>
                            </div>
                            <div className="space-y-1">
                              {item.pruning_reasons?.map((reason: string, rIdx: number) => (
                                <div key={rIdx} className="text-xs text-[#e0a0a0] flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Promoted / Added Movies */}
                  <div className="evo-card p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <h4 className="text-base font-bold text-white">Promoted Alternatives in Revised Frontier</h4>
                    </div>

                    {whatIfData.analysis.added_movies?.length === 0 ? (
                      <p className="text-sm text-[#a0a0ab]">No new candidates required.</p>
                    ) : (
                      <div className="space-y-3">
                        {whatIfData.analysis.added_movies.map((item: any, i: number) => (
                          <div key={i} className="p-4 rounded-xl bg-white/[0.03] border border-emerald-500/20 space-y-2">
                            <div className="flex justify-between items-baseline">
                              <span className="font-extrabold text-white text-base">{item.movie?.title}</span>
                              <span className="text-xs text-emerald-400 font-mono font-bold">PROMOTED</span>
                            </div>
                            <div className="space-y-1">
                              {item.selection_reasons?.map((reason: string, rIdx: number) => (
                                <div key={rIdx} className="text-xs text-[#a0e0b0] flex items-center gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                                  <span>{reason}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Academic Principle */}
                  <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8] leading-relaxed">
                    <span className="text-white font-bold block mb-1">Academic Viva Defense:</span>
                    {whatIfData.academic_notes}
                  </div>
                </div>
              ) : (
                <div className="evo-card p-12 text-center text-[#a0a0ab]">
                  Loading scenario analysis...
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 2. A* Search Visualizer Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'astar' && astarData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Theoretical Formulation */}
            <div className="evo-card p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Search className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">A* Mathematical Model</h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 space-y-3 font-mono text-xs">
                <div className="text-emerald-400 font-bold text-sm">f(n) = g(n) + h(n)</div>
                <div className="text-[#a0a0ab] space-y-1.5">
                  <p><span className="text-white font-bold">g(n):</span> {astarData.g_description}</p>
                  <p><span className="text-white font-bold">h(n):</span> {astarData.h_description}</p>
                  <p><span className="text-[#f24c27] font-bold">λ (Mood Parameter):</span> {astarData.mood_lambda}</p>
                </div>
              </div>

              <div className="space-y-2 text-xs text-[#c8c8d8] leading-relaxed">
                <span className="text-white font-bold block">Admissibility Condition:</span>
                <p>
                  Because <span className="mono text-emerald-400">h(n) ≤ h*(n)</span> across all frontier states, A* is mathematically guaranteed to find the playlist with minimum total mismatch cost without evaluating every possible permutation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xs text-[#a0a0ab] block">Nodes Expanded</span>
                  <span className="text-2xl font-extrabold text-white">{astarData.metrics?.expanded_nodes}</span>
                </div>
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center">
                  <span className="text-xs text-[#a0a0ab] block">Nodes Generated</span>
                  <span className="text-2xl font-extrabold text-white">{astarData.metrics?.generated_nodes}</span>
                </div>
              </div>
            </div>

            {/* Live Search Trace & Priority Queue */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Cpu className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">OPEN Priority Queue & Search Trace</h3>
                </div>
                <span className="text-xs mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Optimal Frontier
                </span>
              </div>

              <div className="space-y-3">
                {astarData.open_list_sample?.map((item: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs mono text-[#f24c27] font-bold">State #{idx + 1}</span>
                        <span className={`text-xs font-mono px-2 py-0.5 rounded font-bold ${
                          item.status === 'GOAL_REACHED' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/10 text-[#d4d4e2]'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <span className="font-extrabold text-white text-sm block">
                        {item.state.join('  ➔  ')}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-mono">
                      <div className="text-right">
                        <span className="text-[#a0a0ab] block">g(n)</span>
                        <span className="text-white font-bold">{item.g}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[#a0a0ab] block">h(n)</span>
                        <span className="text-cyan-400 font-bold">{item.h}</span>
                      </div>
                      <div className="text-right p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                        <span className="text-emerald-400 block font-bold">f(n)</span>
                        <span className="text-white font-extrabold">{item.f}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Resulting Optimal Sequence */}
              <div className="pt-2 border-t border-white/10">
                <span className="text-xs uppercase text-[#a0a0ab] font-bold block mb-3">Optimal Output Playlist:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {astarData.solution_playlist?.map((m: any, i: number) => (
                    <div key={i} className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                      <span className="text-xs text-[#f24c27] font-bold">#{i + 1}</span>
                      <span className="font-bold text-white text-sm block truncate">{m.title}</span>
                      <span className="text-xs text-[#a0a0ab]">{m.runtime}m • ⭐ {m.imdbRating}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 3. CSP Forward Checking Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'csp' && cspData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* CSP Formulation */}
            <div className="evo-card p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Cpu className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">CSP Problem Model</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <span className="text-[#f24c27] font-bold block mb-1">Variables (X):</span>
                  <div className="space-y-1 text-white">
                    {cspData.variables?.map((v: string, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">{v}</div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-emerald-400 font-bold block mb-1">Hard Constraints (C):</span>
                  <div className="space-y-1 text-[#c8c8d8]">
                    {cspData.constraints?.map((c: string, i: number) => (
                      <div key={i} className="p-2 rounded-lg bg-white/5 border border-white/10">✓ {c}</div>
                    ))}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#08080c] border border-white/10">
                  <span className="text-[#a0a0ab] block">Domain Size per Variable:</span>
                  <span className="text-xl font-extrabold text-white">|D| = {cspData.domain_initial_size} movies</span>
                </div>
              </div>
            </div>

            {/* Forward Checking Step-By-Step Pruning */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Forward Checking Propagation Trace</h3>
                </div>
                <span className="text-xs mono font-bold text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
                  Domain Pruning
                </span>
              </div>

              <div className="space-y-4">
                {cspData.step_trace?.map((step: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[#f24c27]/20 text-[#f24c27] text-xs font-bold flex items-center justify-center">
                          {step.step}
                        </span>
                        <span className="font-extrabold text-white text-sm">{step.action}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/30">
                        Assigned: {step.assigned}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                      <div className="text-[#a0a0ab]">
                        <span className="text-white font-bold">Domain Size Before:</span> {step.domain_size_before}
                      </div>
                      <div className="text-rose-400 font-bold font-mono">
                        Eliminated via Lookahead: -{step.forward_checking_pruned} candidates
                      </div>
                    </div>
                    <p className="text-xs text-[#c8c8d8] italic">{step.reason}</p>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8]">
                <span className="text-white font-bold block mb-1">Lookahead Efficiency:</span>
                {cspData.academic_notes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 4. Fuzzy Mood Logic Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'fuzzy' && fuzzyData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Slider Control & Active Memberships */}
            <div className="evo-card p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Sliders className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">Mood Input Slider</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between font-bold text-white text-sm mb-2">
                    <span>Input Value (x):</span>
                    <span className="mono text-2xl text-[#f24c27] font-extrabold">{fuzzySlider.toFixed(1)}</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.25"
                    value={fuzzySlider}
                    onChange={(e) => handleFuzzyChange(Number(e.target.value))}
                    className="w-full accent-[#f24c27] h-2 cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-[#a0a0ab] font-mono mt-1">
                    <span>1.0 Chill</span>
                    <span>5.5 Balanced</span>
                    <span>10.0 Intense</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                  <span className="text-xs text-[#a0a0ab] block">Dominant Linguistic Category:</span>
                  <span className="text-lg font-extrabold text-white capitalize">{fuzzyData.dominant_mood}</span>
                </div>

                {/* Membership Degrees Table */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs uppercase text-[#a0a0ab] font-bold block">Fuzzy Degrees μ(x):</span>
                  {Object.entries(fuzzyData.membership_degrees || {}).map(([key, val]: any) => (
                    <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-white/[0.02] border border-white/5 text-xs font-mono">
                      <span className="capitalize text-white font-bold">{key}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-[#f24c27] h-full rounded-full transition-all duration-300"
                            style={{ width: `${Math.round(val * 100)}%` }}
                          />
                        </div>
                        <span className="text-[#f24c27] font-bold w-10 text-right">{val.toFixed(2)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* SVG Curve Plot */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Fuzzy Membership Functions μ(x)</h3>
                </div>
                <span className="text-xs mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Triangular & Trapezoidal Soft Sets
                </span>
              </div>

              {/* SVG Canvas Graph */}
              <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 overflow-hidden">
                <svg viewBox="0 0 500 220" className="w-full h-56">
                  {/* Grid Lines */}
                  <line x1="40" y1="20" x2="40" y2="180" stroke="#333" strokeWidth="1" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="#333" strokeWidth="1" />
                  <line x1="40" y1="20" x2="480" y2="20" stroke="#222" strokeDasharray="4" />
                  <line x1="40" y1="100" x2="480" y2="100" stroke="#222" strokeDasharray="4" />

                  {/* Y Axis Labels */}
                  <text x="15" y="25" fill="#888" fontSize="10" fontFamily="monospace">1.0</text>
                  <text x="15" y="105" fill="#888" fontSize="10" fontFamily="monospace">0.5</text>
                  <text x="15" y="185" fill="#888" fontSize="10" fontFamily="monospace">0.0</text>

                  {/* X Axis Labels */}
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => {
                    const cx = 40 + ((v - 1) / 9) * 440;
                    return (
                      <text key={v} x={cx - 3} y="198" fill="#888" fontSize="10" fontFamily="monospace">
                        {v}
                      </text>
                    );
                  })}

                  {/* Curves */}
                  {Object.entries(fuzzyData.curves || {}).map(([cKey, curve]: any) => {
                    const pts = curve.points.map((p: any) => {
                      const sx = 40 + ((p.x - 1) / 9) * 440;
                      const sy = 180 - p.y * 160;
                      return `${sx},${sy}`;
                    }).join(' ');
                    return (
                      <polyline
                        key={cKey}
                        fill="none"
                        stroke={curve.color}
                        strokeWidth="2.5"
                        points={pts}
                        opacity="0.85"
                      />
                    );
                  })}

                  {/* Active Vertical Cursor Bar */}
                  {(() => {
                    const cursorX = 40 + ((fuzzySlider - 1) / 9) * 440;
                    return (
                      <g>
                        <line x1={cursorX} y1="20" x2={cursorX} y2="180" stroke="#fff" strokeWidth="2" strokeDasharray="3 3" />
                        <circle cx={cursorX} cy="180" r="4" fill="#f24c27" />
                      </g>
                    );
                  })()}
                </svg>

                {/* Legend */}
                <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs font-mono">
                  {Object.entries(fuzzyData.curves || {}).map(([cKey, curve]: any) => (
                    <div key={cKey} className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: curve.color }} />
                      <span className="text-[#d4d4e2]">{curve.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8]">
                <span className="text-white font-bold block mb-1">Syllabus Justification:</span>
                {fuzzyData.academic_notes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 5. Knowledge Graph Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'knowledge_graph' && graphData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Graph Query Controls & Hubs */}
            <div className="evo-card p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <Share2 className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">Multi-Hop Path Finder</h3>
              </div>

              <div className="space-y-4 text-sm">
                <div>
                  <label className="text-xs text-[#a0a0ab] font-bold block mb-1">Source Movie A</label>
                  <select
                    value={graphMovieA}
                    onChange={(e) => setGraphMovieA(e.target.value)}
                    className="w-full evocuir-glass-pill text-white px-3 py-2 bg-[#0c0c12] border border-white/10 text-xs font-semibold"
                  >
                    {graphData.available_titles?.map((t: string) => (
                      <option key={t} value={t} className="bg-[#0c0c12]">{t}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs text-[#a0a0ab] font-bold block mb-1">Target Movie B</label>
                  <select
                    value={graphMovieB}
                    onChange={(e) => setGraphMovieB(e.target.value)}
                    className="w-full evocuir-glass-pill text-white px-3 py-2 bg-[#0c0c12] border border-white/10 text-xs font-semibold"
                  >
                    {graphData.available_titles?.map((t: string) => (
                      <option key={t} value={t} className="bg-[#0c0c12]">{t}</option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleRunGraphSearch}
                  disabled={loading}
                  className="w-full btn-evo-accent !py-2.5 flex items-center justify-center gap-2 text-xs font-bold"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Traverse Semantic Graph (BFS)</span>
                </button>

                {/* Hub Entities Table */}
                <div className="pt-2 border-t border-white/10 space-y-2">
                  <span className="text-xs font-bold text-white uppercase block">High-Degree Hub Entities</span>
                  <div className="space-y-1.5 text-xs font-mono">
                    {graphData.hub_entities?.slice(0, 5).map((hub: any, i: number) => (
                      <div key={i} className="flex justify-between p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-white font-bold truncate max-w-[150px]">{hub.id}</span>
                        <span className="text-[#f24c27]">{hub.connections} connections</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Path Visualizer */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-cyan-400" />
                  <h3 className="text-lg font-bold text-white">Semantic Multi-Hop Path</h3>
                </div>
                <div className="text-xs font-mono text-[#a0a0ab]">
                  {graphData.stats?.total_nodes} nodes • {graphData.stats?.total_edges} relations
                </div>
              </div>

              {graphData.path_found?.length > 0 ? (
                <div className="p-6 rounded-2xl bg-[#08080c] border border-white/10 space-y-6">
                  <div className="text-xs font-mono text-emerald-400 font-bold">
                    ✓ Shortest Semantic Path Found ({graphData.path_length} hops):
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {graphData.path_found.map((node: string, idx: number) => (
                      <React.Fragment key={idx}>
                        <div className={`p-3 rounded-2xl border font-mono text-xs font-bold ${
                          idx === 0 || idx === graphData.path_found.length - 1
                            ? 'bg-[#f24c27]/20 border-[#f24c27] text-white shadow-lg shadow-[#f24c27]/20'
                            : 'bg-white/10 border-white/20 text-cyan-300'
                        }`}>
                          {node}
                        </div>
                        {idx < graphData.path_found.length - 1 && (
                          <ArrowRight className="w-4 h-4 text-white/40 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-white/[0.02] border border-white/10 text-center text-sm text-[#a0a0ab]">
                  No direct semantic path between selected entities within 4 hops.
                </div>
              )}

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8]">
                <span className="text-white font-bold block mb-1">Knowledge Representation Principle:</span>
                {graphData.academic_notes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 6. Bayesian Taste Updating Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'bayesian' && bayesianData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Bayesian Model Formulation */}
            <div className="evo-card p-6 space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <TrendingUp className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">Beta-Binomial Model</h3>
              </div>

              <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 space-y-2 font-mono text-xs">
                <span className="text-emerald-400 font-bold block text-sm">Conjugate Prior Formulation</span>
                <p className="text-[#a0a0ab] leading-relaxed">
                  Beta(α + k, β + n - k) ∝ Beta(α, β) × Binomial(k, n)
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
                  <span className="text-cyan-400 font-bold block">Prior Parameters:</span>
                  <div className="flex justify-between text-[#c8c8d8]">
                    <span>α₀ = {bayesianData.prior?.alpha}, β₀ = {bayesianData.prior?.beta}</span>
                    <span>Mean: {bayesianData.prior?.mean}</span>
                  </div>
                  <div className="text-[#a0a0ab] text-[11px]">Variance: {bayesianData.prior?.variance}</div>
                </div>

                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 space-y-1">
                  <span className="text-emerald-400 font-bold block">Posterior (After Feedback):</span>
                  <div className="flex justify-between text-white font-bold">
                    <span>α = {bayesianData.posterior?.alpha}, β = {bayesianData.posterior?.beta}</span>
                    <span>Mean: {bayesianData.posterior?.mean}</span>
                  </div>
                  <div className="text-emerald-300 text-[11px]">Variance: {bayesianData.posterior?.variance}</div>
                </div>

                <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center font-bold text-white text-xs">
                  {bayesianData.confidence_gain}
                </div>
              </div>
            </div>

            {/* SVG Beta Distribution Curves */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Belief Distribution Shift</h3>
                </div>
                <div className="flex items-center gap-3 text-xs font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-cyan-400" />
                    <span className="text-[#d4d4e2]">Prior Beta(2,2)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-emerald-400" />
                    <span className="text-[#d4d4e2]">Posterior Beta(6,3)</span>
                  </div>
                </div>
              </div>

              {/* SVG Canvas for PDF */}
              <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 overflow-hidden">
                <svg viewBox="0 0 500 220" className="w-full h-56">
                  {/* Grid */}
                  <line x1="40" y1="20" x2="40" y2="180" stroke="#333" strokeWidth="1" />
                  <line x1="40" y1="180" x2="480" y2="180" stroke="#333" strokeWidth="1" />

                  {/* Prior Curve */}
                  {bayesianData.prior_distribution_curve && (
                    <polyline
                      fill="none"
                      stroke="#38bdf8"
                      strokeWidth="2.5"
                      points={bayesianData.prior_distribution_curve.map((p: any) => {
                        const sx = 40 + p.p * 440;
                        const sy = 180 - (p.density / 3.0) * 150;
                        return `${sx},${sy}`;
                      }).join(' ')}
                    />
                  )}

                  {/* Posterior Curve */}
                  {bayesianData.posterior_distribution_curve && (
                    <polyline
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="3"
                      points={bayesianData.posterior_distribution_curve.map((p: any) => {
                        const sx = 40 + p.p * 440;
                        const sy = 180 - (p.density / 3.0) * 150;
                        return `${sx},${sy}`;
                      }).join(' ')}
                    />
                  )}

                  {/* X Axis labels */}
                  {[0.0, 0.2, 0.4, 0.6, 0.8, 1.0].map((v) => (
                    <text key={v} x={40 + v * 440 - 8} y="198" fill="#888" fontSize="10" fontFamily="monospace">
                      {v.toFixed(1)}
                    </text>
                  ))}
                </svg>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8]">
                <span className="text-white font-bold block mb-1">Theoretical Significance:</span>
                {bayesianData.academic_notes}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* 7. Expert System Tab */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'expert_system' && expertData && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Working Memory Facts & Control */}
            <div className="evo-card p-6 space-y-6">
              <div className="flex items-center gap-2 pb-3 border-b border-white/10">
                <FileCheck2 className="w-5 h-5 text-[#f24c27]" />
                <h3 className="text-lg font-bold text-white">Working Memory Facts</h3>
              </div>

              <div className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[#a0a0ab] font-bold block mb-1">Select Candidate Movie</label>
                  <select
                    value={expertMovieId}
                    onChange={(e) => setExpertMovieId(e.target.value)}
                    className="w-full evocuir-glass-pill text-white px-3 py-2 bg-[#0c0c12] border border-white/10 font-semibold"
                  >
                    <option value="m_inception" className="bg-[#0c0c12]">Inception</option>
                    <option value="m_interstellar" className="bg-[#0c0c12]">Interstellar</option>
                    <option value="m_the_dark_knight" className="bg-[#0c0c12]">The Dark Knight</option>
                    <option value="m_pulp_fiction" className="bg-[#0c0c12]">Pulp Fiction</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#a0a0ab] font-bold block mb-1">Audience Context</label>
                  <select
                    value={expertAudience}
                    onChange={(e) => setExpertAudience(e.target.value)}
                    className="w-full evocuir-glass-pill text-white px-3 py-2 bg-[#0c0c12] border border-white/10 font-semibold"
                  >
                    <option value="solo" className="bg-[#0c0c12]">Solo</option>
                    <option value="family" className="bg-[#0c0c12]">Family</option>
                    <option value="child" className="bg-[#0c0c12]">Child</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-lg bg-white/5 border border-white/10">
                  <span className="text-white font-bold">Exclude Violence</span>
                  <input
                    type="checkbox"
                    checked={expertExcludeViolence}
                    onChange={(e) => setExpertExcludeViolence(e.target.checked)}
                    className="w-4 h-4 accent-[#f24c27]"
                  />
                </div>

                <button
                  onClick={handleRunExpertProof}
                  disabled={loading}
                  className="w-full btn-evo-accent !py-2.5 flex items-center justify-center gap-2 font-bold"
                >
                  <Play className="w-3.5 h-3.5" />
                  <span>Execute Forward Chaining</span>
                </button>

                {/* Asserted Facts Dump */}
                <div className="p-3 rounded-xl bg-[#08080c] border border-white/10 space-y-1 text-[#d4d4e2]">
                  <span className="text-[#f24c27] font-bold block">Active Assertions:</span>
                  <p>Movie: {expertData.working_memory_facts?.movie_title}</p>
                  <p>Runtime: {expertData.working_memory_facts?.runtime}m</p>
                  <p>Rating: {expertData.working_memory_facts?.imdb_rating}/10</p>
                  <p>Age: {expertData.working_memory_facts?.age_rating}</p>
                  <p>Violence: {expertData.working_memory_facts?.violence_level}</p>
                </div>
              </div>
            </div>

            {/* Fired Proof Steps & Deductions */}
            <div className="lg:col-span-2 evo-card p-6 space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <FileCheck2 className="w-5 h-5 text-emerald-400" />
                  <h3 className="text-lg font-bold text-white">Forward-Chaining Inference Chain</h3>
                </div>
                <span className="text-xs mono font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  Production Rules
                </span>
              </div>

              <div className="space-y-3">
                {expertData.fired_proof_steps?.map((step: any, idx: number) => (
                  <div key={idx} className="p-4 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs mono text-[#f24c27] font-bold">{step.rule}</span>
                      <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/20">
                        {step.status}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-[#a0a0ab]">
                      <span className="text-white font-bold">Premise:</span> {step.premise}
                    </div>
                    <div className="text-xs text-white">
                      <span className="text-emerald-400 font-bold">Inference:</span> {step.inference}
                    </div>
                  </div>
                ))}
              </div>

              {/* Deductions Box */}
              <div className="p-4 rounded-2xl bg-[#08080c] border border-white/10 space-y-2">
                <span className="text-xs mono uppercase text-emerald-400 font-bold block">Derived Conclusions:</span>
                <div className="space-y-1 text-xs text-[#d4d4e2]">
                  {expertData.final_conclusions?.map((c: string, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                      <span>{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-xs text-[#c8c8d8]">
                <span className="text-white font-bold block mb-1">Academic Proof Summary:</span>
                {expertData.academic_notes}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};