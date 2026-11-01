import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/api';
import { Lock, Mail, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authApi.login({ email, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12 relative">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[350px] bg-[#f24c27]/8 rounded-full blur-[140px] pointer-events-none -z-10" />

      <div className="w-full max-w-md evo-card-glow p-8 space-y-6">
        <div className="text-center space-y-2.5">
          <div className="w-12 h-12 rounded-full bg-white/[0.04] border border-white/[0.08] text-[#f24c27] flex items-center justify-center mx-auto shadow-lg shadow-[#f24c27]/10">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Welcome Back</h1>
          <p className="text-xs text-[#888896] font-light">
            Sign in to access your Bayesian taste profile, saved watchlists, and planning sessions.
          </p>
        </div>

        {error && (
          <div className="flex items-center gap-2.5 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#666675] absolute left-4 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@university.edu"
                className="w-full evocuir-glass-pill pl-11 pr-4 py-3 text-xs text-white placeholder-[#555562] focus:outline-none focus:border-[#f24c27] bg-[#0c0c12] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#888896] uppercase tracking-wider mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#666675] absolute left-4 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full evocuir-glass-pill pl-11 pr-4 py-3 text-xs text-white placeholder-[#555562] focus:outline-none focus:border-[#f24c27] bg-[#0c0c12] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-evo-accent !text-xs !py-3.5 shadow-xl hover:scale-102 disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="text-center text-xs text-[#777785] border-t border-white/[0.06] pt-4 font-light">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-semibold text-white hover:text-[#f24c27] transition">
            Register now
          </Link>
        </div>
      </div>
    </div>
  );
};
