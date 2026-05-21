import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Trash2, Clock, ChevronDown, ChevronUp } from 'lucide-react';

const CATEGORY_CONFIG = {
  urgent:   { label: 'Urgent',   emoji: '🔴', strip: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 border-rose-200'    },
  academic: { label: 'Academic', emoji: '📚', strip: 'bg-amber-400',   badge: 'bg-amber-50 text-amber-700 border-amber-200'  },
  event:    { label: 'Event',    emoji: '🎉', strip: 'bg-emerald-500', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  general:  { label: 'General',  emoji: '📌', strip: 'bg-slate-400',   badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

const AVATAR_COLORS = [
  'bg-blue-500', 'bg-violet-500', 'bg-rose-500',
  'bg-amber-500', 'bg-emerald-500', 'bg-cyan-500',
];

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function avatarColor(userId = '') {
  const idx = userId.charCodeAt(0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

export default function NoticeCard({ notice, currentUserId, compact }) {
  const [expanded, setExpanded] = useState(false);
  const isAuthor = currentUserId === notice.user_id;
  const cfg = CATEGORY_CONFIG[notice.category?.toLowerCase()] ?? CATEGORY_CONFIG.general;
  const isLong = notice.body?.length > 160;
  const displayBody = isLong && !expanded ? notice.body.slice(0, 160) + '…' : notice.body;

  const handleDelete = async () => {
    if (!window.confirm('Delete this notice?')) return;
    const { error } = await supabase.from('notices').delete().eq('id', notice.id);
    if (error) alert(error.message);
  };

  if (compact) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 flex items-start gap-3 hover:border-slate-300 hover:shadow-sm transition-all group">
        <div className={`w-1 self-stretch rounded-full ${cfg.strip} shrink-0`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${cfg.badge}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock size={9} /> {timeAgo(notice.created_at)}
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-900 mt-1 leading-snug">{notice.title}</p>
          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{notice.body}</p>
        </div>
        {isAuthor && (
          <button
            onClick={handleDelete}
            className="shrink-0 text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-rose-50"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-slate-100 hover:border-slate-300 transition-all group flex flex-col">
      {/* Accent strip */}
      <div className={`h-1.5 ${cfg.strip}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className={`w-7 h-7 rounded-full ${avatarColor(notice.user_id)} flex items-center justify-center text-white text-[10px] font-bold shrink-0`}>
              {(notice.user_id ?? '?')[0].toUpperCase()}
            </div>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${cfg.badge}`}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          {isAuthor && (
            <button
              onClick={handleDelete}
              className="text-slate-300 hover:text-rose-500 transition opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-rose-50"
              title="Delete notice"
            >
              <Trash2 size={13} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 text-sm leading-snug mb-2">{notice.title}</h3>

        {/* Body */}
        <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-wrap flex-1">
          {displayBody}
        </p>

        {isLong && (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700 font-semibold mt-2 self-start"
          >
            {expanded ? <><ChevronUp size={12} /> Show less</> : <><ChevronDown size={12} /> Read more</>}
          </button>
        )}

        {/* Footer */}
        <div className="flex items-center gap-1.5 mt-4 pt-3 border-t border-slate-100 text-[10px] text-slate-400">
          <Clock size={9} />
          {timeAgo(notice.created_at)}
        </div>
      </div>
    </div>
  );
}
