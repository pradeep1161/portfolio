import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, KeyRound, User, Eye, EyeOff, Sparkles } from 'lucide-react';

export default function AdminLogin({ setCurrentView }) {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Redirect if already logged in
  if (isAuthenticated) {
    setTimeout(() => setCurrentView('admin'), 0);
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await login(username, password);
    setLoading(false);

    if (result.success) {
      setCurrentView('admin');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto px-4 py-32 relative z-10 animate-scale-up">
      {/* Background glow */}
      <div className="absolute inset-0 bg-indigo-500/5 rounded-full blur-3xl glow-indigo pointer-events-none" />

      <div className="glass-panel p-8 sm:p-10 border shadow-2xl relative overflow-hidden">
        {/* Decorative corner tag */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-bl-full pointer-events-none" />

        {/* Head */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex p-3 bg-indigo-500/10 text-indigo-500 rounded-2xl mb-1">
            <KeyRound size={26} />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Admin Login</h1>
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Access Portfolio CMS</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">User ID</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                <User size={16} />
              </span>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full glass-input pl-10"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-450 pointer-events-none">
                <KeyRound size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full glass-input pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-500"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-center space-x-2.5 p-3.5 bg-rose-500/10 text-rose-500 border border-rose-500/20 rounded-xl text-xs font-semibold animate-shake">
              <ShieldAlert size={16} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/25 transition-all hover:scale-102 active:scale-98 disabled:opacity-50"
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Credentials Reminder */}
        <div className="mt-8 border-t border-slate-100 dark:border-slate-800 pt-6 text-center">
          <div className="inline-block px-3 py-2 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-slate-500 dark:text-slate-400 text-[10px] font-semibold tracking-wide leading-relaxed">
            <p className="flex items-center justify-center gap-1 text-indigo-500 font-extrabold uppercase mb-0.5">
              <Sparkles size={10} /> Initial Credentials <Sparkles size={10} />
            </p>
            User ID: <span className="font-extrabold text-slate-700 dark:text-slate-200">pradeep_116</span><br />
            Password: <span className="font-extrabold text-slate-700 dark:text-slate-200">Pradeep@116</span>
          </div>
        </div>
      </div>
    </div>
  );
}
