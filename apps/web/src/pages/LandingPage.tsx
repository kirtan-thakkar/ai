import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Compass, 
  Users, 
  Calendar, 
  ArrowRight,
  Zap,
  Activity,
  Shuffle,
  ShieldCheck,
  CheckCircle2,
  Film
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const algorithms = [
    { 
      title: 'A* State-Space Search', 
      tag: 'Heuristic Search', 
      formula: 'f(n) = g(n) + h(n)',
      desc: 'Searches multi-movie combinations to find the highest-satisfaction playlist under your exact time budget and emotional mood curve.' 
    },
    { 
      title: 'CSP with Forward Checking', 
      tag: 'Constraint Satisfaction', 
      formula: 'Domain Pruning',
      desc: 'Enforces hard constraints (runtime limits, audience age, content safety). Prunes impossible titles from future slots the moment a movie is selected.' 
    },
    { 
      title: 'Simulated Annealing Shuffler', 
      tag: 'Local Optimization', 
      formula: 'P = exp(ΔE / T)',
      desc: 'Stochastic playlist refiner. Freezes movies you love and explores new substitutes using temperature cooling to escape local ruts.' 
    },
    { 
      title: '2-Player Minimax with Alpha-Beta', 
      tag: 'Adversarial Game Theory', 
      formula: 'Nash Equilibrium',
      desc: 'Resolves the "Couch War" debate when two viewers have opposing tastes, evaluating game-tree payoffs so neither person feels shortchanged.' 
    }
  ];

  return (
    <div className="space-y-32 py-8 relative">
      
      {/* Background Ambient Glows */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[450px] bg-gradient-to-b from-[#f24c27]/15 to-transparent rounded-full blur-[130px] pointer-events-none -z-10" />
      <div className="absolute top-[650px] right-10 w-[550px] h-[450px] bg-gradient-to-b from-amber-500/10 to-transparent rounded-full blur-[150px] pointer-events-none -z-10" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 text-center max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/[0.05] border border-white/[0.12] text-xs font-bold text-[#f5f5f7] mb-8 backdrop-blur-xl shadow-xl">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="tracked-caps text-[#f24c27]">Intelligent Cinema Engine</span>
          <span className="text-white/20">|</span>
          <span className="text-[#d4d4e2] font-medium">Constraint-Based Discovery & Planning</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-7xl font-extrabold text-white tracking-tight leading-[1.08] mb-6">
          Cinema discovery, <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-[#f5f5f7] to-[#c8c8d8]">
            engineered with intelligence.
          </span>
        </h1>

        <p className="text-base sm:text-xl text-[#d4d4e2] max-w-2xl mx-auto leading-relaxed font-normal mb-10">
          CineMind AI formulates film discovery as rigorous Artificial Intelligence search, constraint satisfaction, local optimization, and game-theoretic group consensus.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/discover"
            className="btn-evo-accent !text-base !py-4 !px-9 shadow-2xl hover:scale-105 transition-all"
          >
            <Compass className="w-5 h-5" />
            <span>Launch Discovery Studio</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Link>

          <Link
            to="/watch-party"
            className="btn-evo-ghost !text-base !py-4 !px-8 hover:border-white/30 transition-all"
          >
            <Users className="w-5 h-5 text-[#f24c27]" />
            <span>Start Couch War (Minimax)</span>
          </Link>
        </div>

        {/* Floating Quick Feature Pills */}
        <div className="mt-14 pt-8 border-t border-white/[0.08] flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm">
          <div className="evocuir-glass-pill px-4 py-2 flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#f24c27]" />
            <span className="mono text-white font-bold">A* Search</span>
            <span className="text-[#a0a0ab]">Mood-Scaled Heuristic</span>
          </div>
          <div className="evocuir-glass-pill px-4 py-2 flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            <span className="mono text-white font-bold">CSP + Forward Checking</span>
            <span className="text-[#a0a0ab]">Strict Runtime Limits</span>
          </div>
          <div className="evocuir-glass-pill px-4 py-2 flex items-center gap-2">
            <Shuffle className="w-4 h-4 text-amber-400" />
            <span className="mono text-white font-bold">Simulated Annealing</span>
            <span className="text-[#a0a0ab]">Playlist Refinement</span>
          </div>
        </div>

      </section>

      {/* 4 Core Algorithms Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="tracked-caps text-[#f24c27]">Algorithmic Core</span>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            How The AI Formulates Cinema
          </h2>
          <p className="text-base text-[#c8c8d8] font-normal leading-relaxed">
            Four classical AI methodologies engineered into an intuitive, seamless streaming experience.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {algorithms.map((algo, i) => (
            <div key={i} className="evo-card p-6 sm:p-7 flex flex-col justify-between space-y-5 group">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-xs mono font-bold px-3 py-1 rounded-full bg-white/[0.08] text-white border border-white/10">
                    {algo.tag}
                  </span>
                  <span className="text-sm font-mono text-[#f24c27] font-extrabold">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white group-hover:text-[#f24c27] transition-colors">
                  {algo.title}
                </h3>
                <div className="text-xs mono font-bold text-[#f24c27] bg-[#f24c27]/10 px-2.5 py-1 rounded-md inline-block my-2">
                  {algo.formula}
                </div>
                <p className="text-sm text-[#b8b8cb] leading-relaxed font-normal mt-1">
                  {algo.desc}
                </p>
              </div>

              <div className="pt-4 border-t border-white/[0.08] flex items-center text-xs text-[#d4d4e2] group-hover:text-white transition">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 mr-2" />
                <span className="text-xs font-semibold">Verified Implementation</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Feature Bento Showcase Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="evo-card-glow p-8 sm:p-14 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 border-b border-white/[0.08] pb-6">
            <div>
              <span className="tracked-caps text-[#f24c27]">Integrated Feature Suite</span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-1.5">Complete Cinematic Intelligence</h2>
            </div>
            <Link
              to="/discover"
              className="evocuir-glass-pill px-5 py-2.5 text-sm font-bold text-[#f5f5f7] hover:border-[#f24c27] flex items-center gap-2 transition shrink-0"
            >
              <span>Explore Discover Studio</span>
              <ArrowRight className="w-4 h-4 text-[#f24c27]" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bento-box p-7 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-[#f24c27]">
                <Compass className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Mood Dial & Duration Fit</h4>
              <p className="text-sm text-[#b8b8cb] font-normal leading-relaxed">
                Tune continuous sliders from cozy chill to mind-bending intensity with exact minutes constraint satisfaction.
              </p>
              <Link to="/discover" className="text-sm font-bold text-[#f24c27] hover:underline inline-flex items-center gap-1.5 pt-1">
                Open Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bento-box p-7 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-amber-400">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Couch War Consensus</h4>
              <p className="text-sm text-[#b8b8cb] font-normal leading-relaxed">
                Solve viewing stalemates using adversarial Minimax game trees and collaborative Max-Min fairness.
              </p>
              <Link to="/watch-party" className="text-sm font-bold text-amber-400 hover:underline inline-flex items-center gap-1.5 pt-1">
                Start Session <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="bento-box p-7 space-y-4">
              <div className="w-12 h-12 rounded-full bg-white/[0.05] border border-white/[0.1] flex items-center justify-center text-emerald-400">
                <Calendar className="w-6 h-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Marathon Scheduler</h4>
              <p className="text-sm text-[#b8b8cb] font-normal leading-relaxed">
                Automatically generate weekend trilogies with intermissions, dinner breaks, and reactive replanning.
              </p>
              <Link to="/planner" className="text-sm font-bold text-emerald-400 hover:underline inline-flex items-center gap-1.5 pt-1">
                Plan Marathon <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};
