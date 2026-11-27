import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Trash2,
  Youtube,
  Play,
  X,
  CalendarDays,
  Sparkles,
  Check
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import Modal from '../components/common/Modal';
import { formatShortDate, formatMinutesHuman } from '../utils/dateUtils';
import { toast } from '../utils/alerts';

const PLAYLIST_META = {
  java: {
    label: 'Core Java',
    eyebrow: 'Playlist 1 · Core Java',
    title: 'Java Beginner to Advanced',
    blurb: 'JDK internals, OOP, collections, streams, JVM memory and concurrency',
    accent: 'cyan',
    bar: 'from-cyan-400 to-sky-500',
    ring: 'ring-cyan-400/40 border-cyan-400/50',
    text: 'text-cyan-300'
  },
  spring: {
    label: 'Spring Boot',
    eyebrow: 'Playlist 2 · Spring Boot',
    title: 'Spring Framework Full Course',
    blurb: 'IoC, REST, Hibernate/JPA, transactions, security and the GateKeeper project',
    accent: 'indigo',
    bar: 'from-indigo-400 to-violet-500',
    ring: 'ring-indigo-400/40 border-indigo-400/50',
    text: 'text-indigo-300'
  }
};

// "1:06:43" / "59:07" → seconds
function durationToSeconds(d) {
  if (!d) return 0;
  const parts = String(d).split(':').map((n) => parseInt(n, 10) || 0);
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

// YouTube titles repeat the series name ("| Java Full Course #3"). Keep the lecture's own words:
// main title = first meaningful part, subtitle = the rest.
function splitTitle(title) {
  const parts = String(title).split('|').map((p) => p.trim()).filter(Boolean);
  const meaningful = parts.filter((p) => !/full course/i.test(p));
  const use = meaningful.length ? meaningful : parts;
  return { main: use[0] || title, sub: use.slice(1).join(' · ') };
}

// Accepts an 11-char id or any common YouTube URL
function parseYouTubeId(input) {
  const s = String(input || '').trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const m = s.match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : null;
}

export default function PlaylistsPage() {
  const {
    playlists,
    watchedVideosGlobal,
    toggleVideoWatched,
    addCustomVideoToPlaylist,
    deleteVideoFromPlaylist,
    days,
    currentChallengeDay
  } = usePlanner();

  const [activeTab, setActiveTab] = useState('java');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWatched, setFilterWatched] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState({ title: '', link: '', duration: '' });
  const [formError, setFormError] = useState('');
  const [embedVideo, setEmbedVideo] = useState(null);

  const isWatched = (id) => Boolean(watchedVideosGlobal?.[id]?.watched);

  // video id → plan day (for "Day 12 · Feb 3" labels)
  const dayByVideo = useMemo(() => {
    const map = new Map();
    days.forEach((d) => (d.videos || []).forEach((v) => map.set(v.id, d)));
    return map;
  }, [days]);

  const summarise = (key) => {
    const videos = playlists?.[key]?.videos || [];
    const watched = videos.filter((v) => isWatched(v.id));
    const totalSec = videos.reduce((s, v) => s + (v.durationSeconds || durationToSeconds(v.duration)), 0);
    const watchedSec = watched.reduce((s, v) => s + (v.durationSeconds || durationToSeconds(v.duration)), 0);
    return {
      total: videos.length,
      watched: watched.length,
      percent: videos.length ? Math.round((watched.length / videos.length) * 100) : 0,
      watchedMin: Math.round(watchedSec / 60),
      leftMin: Math.round((totalSec - watchedSec) / 60)
    };
  };

  const summaries = { java: summarise('java'), spring: summarise('spring') };
  const meta = PLAYLIST_META[activeTab];
  const allVideos = playlists?.[activeTab]?.videos || [];
  const nextUp = allVideos.find((v) => !isWatched(v.id));

  const counts = {
    all: allVideos.length,
    unwatched: allVideos.filter((v) => !isWatched(v.id)).length,
    watched: allVideos.filter((v) => isWatched(v.id)).length
  };

  const filteredVideos = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return allVideos.filter((v) => {
      const w = Boolean(watchedVideosGlobal?.[v.id]?.watched);
      if (filterWatched === 'watched' && !w) return false;
      if (filterWatched === 'unwatched' && w) return false;
      if (q && !v.title.toLowerCase().includes(q) && !String(v.index).includes(q)) return false;
      return true;
    });
  }, [allVideos, watchedVideosGlobal, filterWatched, searchQuery]);

  const toggleWatched = (video) => {
    const day = dayByVideo.get(video.id);
    const wasWatched = isWatched(video.id);
    toggleVideoWatched(day ? day.day : null, video.id);
    if (!wasWatched) toast(`Marked #${video.index} as watched`);
  };

  const openAddModal = () => {
    setForm({ title: '', link: '', duration: '' });
    setFormError('');
    setIsAddModalOpen(true);
  };

  const handleAddVideoSubmit = (e) => {
    e.preventDefault();
    const id = parseYouTubeId(form.link);
    if (!form.title.trim()) return setFormError('Give the video a title.');
    if (!id) return setFormError('Paste a YouTube link or an 11-character video ID.');
    if (allVideos.some((v) => v.id === id)) return setFormError('That video is already in this playlist.');
    const duration = form.duration.trim() || '45:00';
    if (!/^\d{1,2}(:\d{2}){1,2}$/.test(duration)) return setFormError('Duration should look like 45:00 or 1:15:30.');
    addCustomVideoToPlaylist(activeTab, {
      id,
      title: form.title.trim(),
      duration,
      durationSeconds: durationToSeconds(duration),
      url: `https://www.youtube.com/watch?v=${id}`
    });
    setIsAddModalOpen(false);
    toast('Video added');
  };

  const DayChip = ({ day }) => {
    if (!day) return null;
    const isToday = day.day === currentChallengeDay;
    return (
      <Link
        to={`/daily-planner?day=${day.day}`}
        onClick={(e) => e.stopPropagation()}
        className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-md border transition-colors ${
          isToday
            ? 'bg-cyan-500/15 text-cyan-300 border-cyan-400/40'
            : 'bg-white/[0.03] text-slate-400 border-white/10 hover:text-slate-200'
        }`}
        title="Open this day in the planner"
      >
        <CalendarDays className="w-3 h-3" />
        {isToday ? 'Today' : `Day ${day.day}`}
        {day.date && <span className="opacity-70">· {formatShortDate(day.date)}</span>}
      </Link>
    );
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Youtube className="w-8 h-8 text-rose-500" />
            Playlists
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Every Coder Army lecture in its original order. Ticking a video here also ticks it on its plan day.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="apple-press px-3.5 py-2 rounded-xl glass-ultra border border-white/10 hover:bg-white/[0.08] text-xs font-semibold text-slate-200 flex items-center gap-2 self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          Add custom video
        </button>
      </div>

      {/* Playlist selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" role="tablist" aria-label="Playlists">
        {Object.entries(PLAYLIST_META).map(([key, m]) => {
          const s = summaries[key];
          const active = activeTab === key;
          return (
            <button
              key={key}
              role="tab"
              aria-selected={active}
              onClick={() => {
                setActiveTab(key);
                setSearchQuery('');
              }}
              className={`text-left glass-card p-5 transition-all apple-press ${active ? `ring-2 ${m.ring}` : 'opacity-75 hover:opacity-100'}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold font-mono uppercase tracking-wider ${m.text}`}>{m.eyebrow}</span>
                {active && (
                  <span className={`flex items-center gap-1 text-[10px] font-mono font-bold ${m.text}`}>
                    <Check className="w-3 h-3" /> Selected
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-slate-100">{m.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{s.total} lectures · {m.blurb}</p>

              <div className="mt-4 flex items-end justify-between gap-3">
                <div className="text-2xl font-extrabold text-slate-100 tabular-nums">
                  {s.percent}%
                  <span className="text-xs font-medium text-slate-400 ml-1.5">{s.watched}/{s.total} watched</span>
                </div>
                <div className="text-right text-[11px] font-mono text-slate-400 leading-tight">
                  <div>{formatMinutesHuman(s.watchedMin)} watched</div>
                  <div className="text-slate-500">{formatMinutesHuman(s.leftMin)} left</div>
                </div>
              </div>
              <div className="mt-2 h-2 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${m.bar} transition-all duration-700`}
                  style={{ width: `${Math.max(s.percent, s.watched > 0 ? 2 : 0)}%` }}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* Up next */}
      {nextUp ? (
        (() => {
          const t = splitTitle(nextUp.title);
          const day = dayByVideo.get(nextUp.id);
          return (
            <div className="glass-panel rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:gap-6 items-stretch">
              <button
                onClick={() => setEmbedVideo(nextUp)}
                className="group relative w-full sm:w-72 aspect-video rounded-2xl overflow-hidden bg-slate-900 flex-shrink-0"
                aria-label={`Play ${t.main}`}
              >
                <img src={nextUp.thumbnail} alt="" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <span className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors" />
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-14 h-14 rounded-full bg-white/90 text-slate-900 flex items-center justify-center shadow-xl transition-transform group-hover:scale-110">
                    <Play className="w-6 h-6 fill-slate-900 ml-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-black/80 text-white">
                  {nextUp.duration}
                </span>
              </button>
              <div className="flex flex-col justify-center min-w-0 flex-1">
                <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${meta.text} flex items-center gap-1.5`}>
                  <Sparkles className="w-3.5 h-3.5" /> Up next in {meta.label}
                </span>
                <h2 className="text-lg sm:text-xl font-bold text-slate-100 mt-1 leading-snug">
                  #{nextUp.index} · {t.main}
                </h2>
                {t.sub && <p className="text-sm text-slate-400 mt-1 line-clamp-2">{t.sub}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <DayChip day={day} />
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono text-slate-400">
                    <Clock className="w-3 h-3" /> {nextUp.duration}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mt-4">
                  <button
                    onClick={() => setEmbedVideo(nextUp)}
                    className="apple-press px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <Play className="w-4 h-4 fill-white" /> Watch now
                  </button>
                  <button
                    onClick={() => toggleWatched(nextUp)}
                    className="apple-press px-4 py-2 rounded-xl glass-ultra border border-white/10 hover:bg-white/[0.08] text-slate-200 text-xs font-semibold flex items-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Mark as watched
                  </button>
                </div>
              </div>
            </div>
          );
        })()
      ) : (
        allVideos.length > 0 && (
          <div className="glass-panel rounded-3xl p-6 text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-base font-bold text-slate-100 mt-2">Every {meta.label} lecture watched</p>
            <p className="text-xs text-slate-400 mt-1">Great work. Switch playlists or revisit anything below.</p>
          </div>
        )
      )}

      {/* Sticky toolbar */}
      <div className="sticky top-[4.5rem] z-20 glass-thin rounded-2xl p-3 flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Search ${meta.label} lectures by title or number…`}
            aria-label="Search lectures"
            className="w-full pl-10 pr-9 py-2 bg-black/25 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/70 focus:ring-2 focus:ring-indigo-500/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-100"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <div className="segmented-control flex items-center gap-1 self-start sm:self-auto" role="group" aria-label="Filter">
          {['all', 'unwatched', 'watched'].map((f) => (
            <button
              key={f}
              onClick={() => setFilterWatched(f)}
              aria-pressed={filterWatched === f}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors whitespace-nowrap ${
                filterWatched === f ? 'bg-white/15 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {f} <span className="opacity-60 font-mono">{counts[f]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Video list */}
      <div className="space-y-2.5">
        {filteredVideos.map((video) => {
          const watched = isWatched(video.id);
          const day = dayByVideo.get(video.id);
          const t = splitTitle(video.title);
          const isNext = nextUp?.id === video.id;
          return (
            <div
              key={video.id}
              className={`group glass-card !rounded-2xl p-3 sm:p-3.5 flex items-center gap-3 sm:gap-4 ${
                isNext ? 'ring-1 ring-indigo-400/40' : ''
              } ${watched ? 'opacity-70 hover:opacity-100' : ''}`}
            >
              {/* Watched toggle */}
              <button
                onClick={() => toggleWatched(video)}
                aria-label={watched ? `Mark #${video.index} as not watched` : `Mark #${video.index} as watched`}
                aria-pressed={watched}
                className={`flex-shrink-0 w-9 h-9 rounded-full border flex items-center justify-center font-mono text-xs font-bold transition-all apple-press ${
                  watched
                    ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-300'
                    : 'border-white/15 text-slate-400 hover:border-emerald-400/50 hover:text-emerald-300'
                }`}
              >
                {watched ? <Check className="w-4 h-4" /> : video.index}
              </button>

              {/* Thumbnail (plays the video) */}
              <button
                onClick={() => setEmbedVideo(video)}
                className="relative w-28 sm:w-36 aspect-video rounded-xl overflow-hidden bg-slate-900 flex-shrink-0"
                aria-label={`Play ${t.main}`}
              >
                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" loading="lazy" />
                <span className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/35 transition-colors">
                  <Play className="w-7 h-7 text-white fill-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </span>
                <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/80 text-white">
                  {video.duration}
                </span>
              </button>

              {/* Text */}
              <div className="min-w-0 flex-1">
                <p className={`text-sm font-semibold leading-snug line-clamp-2 break-words ${watched ? 'text-slate-400' : 'text-slate-100'}`}>
                  {t.main}
                </p>
                {t.sub && <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{t.sub}</p>}
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <DayChip day={day} />
                  {isNext && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-400/30">
                      Up next
                    </span>
                  )}
                  {watched && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-400/25">
                      Watched
                    </span>
                  )}
                  {video.isCustom && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-400/25">
                      Custom
                    </span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="hidden sm:flex items-center gap-1.5 flex-shrink-0">
                <a
                  href={video.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/[0.06] transition-colors"
                  title="Open on YouTube"
                  aria-label="Open on YouTube"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
                {video.isCustom && (
                  <button
                    onClick={() => deleteVideoFromPlaylist(activeTab, video.id)}
                    className="p-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors"
                    title="Delete custom video"
                    aria-label="Delete custom video"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className="glass-panel rounded-2xl p-10 text-center space-y-2">
            <p className="text-sm text-slate-300 font-semibold">No lectures match.</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setFilterWatched('all');
              }}
              className="text-xs text-cyan-400 hover:underline"
            >
              Clear search and filter
            </button>
          </div>
        )}
      </div>

      {/* Add custom video */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title={`Add a video to ${meta.label}`}>
        <form onSubmit={handleAddVideoSubmit} className="space-y-4" noValidate>
          {[
            { key: 'title', label: 'Title', placeholder: 'e.g. Kafka basics for Spring developers' },
            { key: 'link', label: 'YouTube link or video ID', placeholder: 'https://www.youtube.com/watch?v=…' },
            { key: 'duration', label: 'Duration (optional)', placeholder: '45:00 or 1:15:30' }
          ].map((f) => (
            <div key={f.key}>
              <label htmlFor={`add-${f.key}`} className="block text-xs font-semibold text-slate-300 mb-1">
                {f.label}
              </label>
              <input
                id={`add-${f.key}`}
                type="text"
                value={form[f.key]}
                onChange={(e) => {
                  setForm({ ...form, [f.key]: e.target.value });
                  setFormError('');
                }}
                placeholder={f.placeholder}
                className="w-full p-2.5 bg-black/30 border border-white/10 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-400/70"
              />
            </div>
          ))}
          {formError && <p className="text-xs text-rose-300">{formError}</p>}
          <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded-lg glass-ultra border border-white/10 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button type="submit" className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold">
              Add video
            </button>
          </div>
        </form>
      </Modal>

      {/* Player */}
      <Modal
        isOpen={!!embedVideo}
        onClose={() => setEmbedVideo(null)}
        title={embedVideo ? `#${embedVideo.index} · ${splitTitle(embedVideo.title).main}` : 'Player'}
        maxWidth="max-w-4xl"
      >
        {embedVideo && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-white/10">
              <iframe
                src={`https://www.youtube.com/embed/${embedVideo.id}?autoplay=1&rel=0`}
                title={embedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                <Clock className="w-3.5 h-3.5" /> {embedVideo.duration}
                <DayChip day={dayByVideo.get(embedVideo.id)} />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => toggleWatched(embedVideo)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                    isWatched(embedVideo.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/40'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isWatched(embedVideo.id) ? 'Watched' : 'Mark as watched'}
                </button>
                <a
                  href={embedVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg glass-ultra border border-white/10 text-xs font-semibold text-slate-200 flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" /> YouTube
                </a>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
