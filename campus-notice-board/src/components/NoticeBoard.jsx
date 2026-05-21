import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import NoticeForm from './NoticeForm';
import NoticeCard from './NoticeCard';
import { LayoutGrid, List } from 'lucide-react';

const CATEGORIES = ['All', 'Academic', 'Urgent', 'Event', 'General'];

const CAT_META = {
  All:      { emoji: '🗂', active: 'bg-blue-600 text-white border-blue-600' },
  Academic: { emoji: '📚', active: 'bg-amber-500 text-white border-amber-500' },
  Urgent:   { emoji: '🔴', active: 'bg-rose-500 text-white border-rose-500' },
  Event:    { emoji: '🎉', active: 'bg-emerald-500 text-white border-emerald-500' },
  General:  { emoji: '📌', active: 'bg-slate-600 text-white border-slate-600' },
};

export default function NoticeBoard({ session }) {
  const [notices, setNotices] = useState([]);
  const [selected, setSelected] = useState('All');
  const [view, setView] = useState('grid');

  const fetchNotices = async () => {
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setNotices(data);
  };

  useEffect(() => {
    fetchNotices();
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'notices' }, fetchNotices)
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, []);

  const filtered = selected === 'All'
    ? notices
    : notices.filter(n => n.category?.toLowerCase() === selected.toLowerCase());

  return (
    <div className="space-y-5">
      {/* Post form */}
      {session && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <p className="text-sm font-bold text-slate-900 mb-4">New Notice</p>
          <NoticeForm session={session} />
        </div>
      )}

      {/* Stats + filter */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            <span className="text-slate-900 font-bold">{filtered.length}</span> {filtered.length === 1 ? 'notice' : 'notices'}
            {selected !== 'All' && <span className="text-slate-400"> in {selected}</span>}
          </p>
          <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
            <button
              onClick={() => setView('grid')}
              className={`p-1.5 rounded-md transition ${view === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <LayoutGrid size={13} />
            </button>
            <button
              onClick={() => setView('list')}
              className={`p-1.5 rounded-md transition ${view === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-slate-400 hover:text-slate-600'}`}
            >
              <List size={13} />
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map(cat => {
            const count = cat === 'All' ? notices.length : notices.filter(n => n.category?.toLowerCase() === cat.toLowerCase()).length;
            const isActive = selected === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelected(cat)}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-semibold rounded-full border transition-all ${
                  isActive
                    ? CAT_META[cat].active
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {CAT_META[cat].emoji} {cat}
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Notices */}
      {filtered.length > 0 ? (
        <div className={view === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' : 'space-y-3'}>
          {filtered.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              currentUserId={session?.user?.id}
              compact={view === 'list'}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 py-16 text-center">
          <p className="text-4xl mb-3">📭</p>
          <p className="text-slate-600 font-semibold text-sm">No notices here yet</p>
          <p className="text-slate-400 text-xs mt-1">
            {selected !== 'All' ? `No ${selected.toLowerCase()} notices posted.` : 'Be the first to post something.'}
          </p>
        </div>
      )}
    </div>
  );
}
