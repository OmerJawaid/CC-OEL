import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [tab, setTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErr('');
    setSuccess('');
    setLoading(true);
    try {
      if (tab === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Check your email to confirm.');
        setEmail('');
        setPassword('');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  const switchTab = (t) => { setTab(t); setErr(''); setSuccess(''); };

  return (
    <div>
      {/* Tab switcher */}
      <div className="flex bg-slate-100 rounded-xl p-1 mb-5">
        {[['signin', 'Sign In'], ['signup', 'Create Account']].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchTab(key)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
              tab === key
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {err && (
          <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2.5 font-medium">
            {err}
          </div>
        )}
        {success && (
          <div className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-3 py-2.5 font-medium">
            {success}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Email address</label>
          <input
            type="email"
            required
            autoComplete="email"
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
            placeholder="you@bahria.edu.pk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-600 mb-1.5">Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              required
              autoComplete={tab === 'signup' ? 'new-password' : 'current-password'}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-3.5 pr-10 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPw(!showPw)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
              tabIndex={-1}
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition-all shadow-sm mt-1"
        >
          {loading ? 'Please wait…' : tab === 'signup' ? 'Create Account' : 'Sign In'}
        </button>
      </form>
    </div>
  );
}
