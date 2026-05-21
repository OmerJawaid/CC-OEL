import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Send } from 'lucide-react';

const CATEGORIES = [
  { value: 'Academic', emoji: '📚', idle: 'border-amber-200 text-amber-700 bg-amber-50',   on: 'border-amber-500 bg-amber-500 text-white' },
  { value: 'Urgent',   emoji: '🔴', idle: 'border-rose-200 text-rose-700 bg-rose-50',      on: 'border-rose-500 bg-rose-500 text-white'   },
  { value: 'Event',    emoji: '🎉', idle: 'border-emerald-200 text-emerald-700 bg-emerald-50', on: 'border-emerald-500 bg-emerald-500 text-white' },
  { value: 'General',  emoji: '📌', idle: 'border-slate-200 text-slate-600 bg-slate-50',   on: 'border-slate-600 bg-slate-600 text-white' },
];

const MAX_BODY = 500;

export default function NoticeForm({ session }) {
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [category, setCategory] = useState('General');
  const [submitting, setSubmitting] = useState(false);
  const [posted, setPosted] = useState(false);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;
    setSubmitting(true);
    const { error } = await supabase.from('notices').insert([
      { title: title.trim(), body: body.trim(), category, user_id: session.user.id }
    ]);
    setSubmitting(false);
    if (!error) {
      setTitle('');
      setBody('');
      setCategory('General');
      setPosted(true);
      setTimeout(() => setPosted(false), 3000);
    } else {
      alert(error.message);
    }
  };

  return (
    <form onSubmit={handlePost} className="space-y-4">
      {/* Category pills */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, emoji, idle, on }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-full border transition-all ${category === value ? on : idle}`}
            >
              {emoji} {value}
            </button>
          ))}
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 mb-1.5">Title</label>
        <input
          type="text"
          required
          maxLength={120}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition"
          placeholder="e.g., Midterm Schedule Updated"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      {/* Body */}
      <div>
        <div className="flex justify-between items-center mb-1.5">
          <label className="text-xs font-semibold text-slate-500">Message</label>
          <span className={`text-[10px] font-medium ${body.length > MAX_BODY * 0.9 ? 'text-rose-500' : 'text-slate-400'}`}>
            {body.length}/{MAX_BODY}
          </span>
        </div>
        <textarea
          required
          rows={4}
          maxLength={MAX_BODY}
          className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent focus:bg-white transition resize-none"
          placeholder="Write your announcement here…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      {/* Submit */}
      <div className="flex items-center justify-between">
        {posted && (
          <span className="text-xs text-emerald-600 font-medium flex items-center gap-1">
            ✓ Notice published!
          </span>
        )}
        <button
          type="submit"
          disabled={submitting || !title.trim() || !body.trim()}
          className="ml-auto flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl text-sm transition-all shadow-sm"
        >
          <Send size={13} />
          {submitting ? 'Publishing…' : 'Publish'}
        </button>
      </div>
    </form>
  );
}
