import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import NoticeBoard from './components/NoticeBoard';
import { LogOut, Bell } from 'lucide-react';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center animate-pulse">
            <Bell size={22} className="text-white" />
          </div>
          <p className="text-slate-500 text-sm font-medium">Loading board…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Nav */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-sm ring-2 ring-blue-100">
              <Bell size={15} className="text-white" />
            </div>
            <div className="leading-tight">
              <span className="font-bold text-slate-900 text-base">Campus Notice Board</span>
              <span className="hidden sm:block text-[10px] text-slate-400 font-medium">Bahria University</span>
            </div>
          </div>

          {session ? (
            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 bg-slate-100 rounded-full pl-1.5 pr-3 py-1">
                <div className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[9px] font-bold uppercase">
                  {session.user.email[0]}
                </div>
                <span className="text-xs text-slate-600 font-medium max-w-[160px] truncate">
                  {session.user.email}
                </span>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-rose-600 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-rose-200 transition-all"
              >
                <LogOut size={12} /> Sign out
              </button>
            </div>
          ) : (
            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-medium">
              Guest
            </span>
          )}
        </div>
      </header>

      {/* Page body */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {session ? (
          <NoticeBoard session={session} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-start">
            {/* Auth panel */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-20">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 px-6 pt-6 pb-8">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center mb-3">
                    <Bell size={18} className="text-white" />
                  </div>
                  <h2 className="text-white font-bold text-lg leading-tight">Post notices</h2>
                  <p className="text-blue-100 text-xs mt-1">
                    Sign in to publish announcements to the board.
                  </p>
                </div>
                <div className="px-6 py-5 -mt-2">
                  <Auth />
                </div>
              </div>
            </div>
            {/* Board */}
            <div className="lg:col-span-3">
              <NoticeBoard session={null} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
