import React, { useState, useMemo } from 'react';
import {
  PlaySquare,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Edit2,
  Trash2,
  Youtube,
  Play
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';

export default function PlaylistsPage() {
  const {
    playlists,
    watchedVideosGlobal,
    toggleVideoWatched,
    addCustomVideoToPlaylist,
    editVideoInPlaylist,
    deleteVideoFromPlaylist,
    days
  } = usePlanner();

  const [activeTab, setActiveTab] = useState('java'); // 'java' or 'spring'
  const [searchQuery, setSearchQuery] = useState('');
  const [filterWatched, setFilterWatched] = useState('all'); // 'all', 'watched', 'unwatched'

  // Modal for adding custom video
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [newVideoDuration, setNewVideoDuration] = useState('');
  const [newVideoId, setNewVideoId] = useState('');

  // Embed player modal
  const [embedVideo, setEmbedVideo] = useState(null);

  const currentPlaylist = playlists?.[activeTab] || { videos: [] };
  const allVideos = currentPlaylist.videos || [];

  // Filtered video list
  const filteredVideos = useMemo(() => {
    return allVideos.filter((v) => {
      const isWatched = watchedVideosGlobal?.[v.id]?.watched;
      if (filterWatched === 'watched' && !isWatched) return false;
      if (filterWatched === 'unwatched' && isWatched) return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = v.title.toLowerCase().includes(query);
        const matchIndex = String(v.index).includes(query);
        if (!matchTitle && !matchIndex) return false;
      }
      return true;
    });
  }, [allVideos, watchedVideosGlobal, filterWatched, searchQuery]);

  // Playlist completion stats
  const totalInPlaylist = allVideos.length;
  const watchedInPlaylist = allVideos.filter(
    (v) => watchedVideosGlobal?.[v.id]?.watched
  ).length;
  const completionPercent =
    totalInPlaylist > 0 ? Math.round((watchedInPlaylist / totalInPlaylist) * 100) : 0;

  // Handle Add custom video
  const handleAddVideoSubmit = (e) => {
    e.preventDefault();
    if (!newVideoTitle.trim()) return;

    addCustomVideoToPlaylist(activeTab, {
      id: newVideoId.trim() || 'custom_' + Date.now(),
      title: newVideoTitle.trim(),
      duration: newVideoDuration.trim() || '45:00',
      durationSeconds: 2700,
      url: newVideoId.trim() ? `https://www.youtube.com/watch?v=${newVideoId.trim()}` : '#'
    });

    setNewVideoTitle('');
    setNewVideoDuration('');
    setNewVideoId('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Youtube className="w-8 h-8 text-rose-500" />
            Curated YouTube Playlists
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            100% authentic Coder Army lectures preserved in their original sequence with full progress tracking.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Add Custom Video</span>
        </button>
      </div>

      {/* Playlist Selector Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Java Playlist Tab Card */}
        <div
          onClick={() => setActiveTab('java')}
          className={`arc-card p-5 cursor-pointer transition-all ${
            activeTab === 'java'
              ? 'border-cyan-500/60 ring-2 ring-cyan-500/20 shadow-[0_0_20px_rgba(6,182,212,0.15)] bg-slate-900/90'
              : 'border-slate-800 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-cyan-400 font-mono uppercase">
              Playlist 1 • Core Java
            </span>
            <span className="text-xs font-bold font-mono text-slate-300">
              {playlists?.java?.videos?.filter(v => watchedVideosGlobal?.[v.id]?.watched).length || 0} / {playlists?.java?.videos?.length || 57}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Java Beginner to Advanced – Coder Army
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            57 Lectures • JDK internals, OOP, Collections, Concurrency & Loom
          </p>
          <div className="mt-3">
            <ProgressBar
              value={
                playlists?.java?.videos?.length
                  ? Math.round(
                      (playlists.java.videos.filter(v => watchedVideosGlobal?.[v.id]?.watched).length /
                        playlists.java.videos.length) *
                        100
                    )
                  : 0
              }
              size="xs"
              color="cyan"
            />
          </div>
        </div>

        {/* Spring Playlist Tab Card */}
        <div
          onClick={() => setActiveTab('spring')}
          className={`arc-card p-5 cursor-pointer transition-all ${
            activeTab === 'spring'
              ? 'border-indigo-500/60 ring-2 ring-indigo-500/20 shadow-[0_0_20px_rgba(99,102,241,0.15)] bg-slate-900/90'
              : 'border-slate-800 hover:border-slate-700 opacity-80'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-indigo-400 font-mono uppercase">
              Playlist 2 • Spring Boot
            </span>
            <span className="text-xs font-bold font-mono text-slate-300">
              {playlists?.spring?.videos?.filter(v => watchedVideosGlobal?.[v.id]?.watched).length || 0} / {playlists?.spring?.videos?.length || 45}
            </span>
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Spring Framework Full Course – Coder Army
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            45 Lectures • IoC, REST APIs, Hibernate, JPA, Security & GateKeeper
          </p>
          <div className="mt-3">
            <ProgressBar
              value={
                playlists?.spring?.videos?.length
                  ? Math.round(
                      (playlists.spring.videos.filter(v => watchedVideosGlobal?.[v.id]?.watched).length /
                        playlists.spring.videos.length) *
                        100
                    )
                  : 0
              }
              size="xs"
              color="indigo"
            />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="arc-card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search in ${activeTab === 'java' ? 'Core Java' : 'Spring Boot'} playlist (e.g. JVM, AOP, Kafka)...`}
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1.5 self-end sm:self-center">
            {['all', 'unwatched', 'watched'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterWatched(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterWatched === f
                    ? 'bg-slate-800 text-white border border-slate-700'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center text-xs text-slate-500 pt-2 border-t border-slate-800/80 font-mono">
          <span>
            Showing {filteredVideos.length} of {totalInPlaylist} lectures
          </span>
          <span className="text-cyan-400 font-bold">
            {completionPercent}% Watched
          </span>
        </div>
      </div>

      {/* Videos List */}
      <div className="space-y-3">
        {filteredVideos.map((video) => {
          const isWatched = watchedVideosGlobal?.[video.id]?.watched;

          // Find which day of roadmap this video belongs to
          const assignedDay = days.find((d) =>
            (d.videos || []).some((v) => v.id === video.id)
          );

          return (
            <div
              key={video.id}
              className={`arc-card p-3.5 sm:p-4 transition-all ${
                isWatched
                  ? 'border-emerald-500/30 bg-emerald-950/5'
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5 min-w-0">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={!!isWatched}
                    onChange={() => {
                      if (assignedDay) {
                        toggleVideoWatched(assignedDay.day, video.id);
                      } else {
                        toggleVideoWatched(1, video.id);
                      }
                    }}
                    className="custom-checkbox mt-1 flex-shrink-0"
                    id={`pl-vid-${video.id}`}
                  />

                  {/* Thumbnail */}
                  <div className="relative w-24 h-14 sm:w-28 sm:h-16 rounded-lg overflow-hidden bg-slate-900 border border-slate-800 flex-shrink-0">
                    <img
                      src={video.thumbnail}
                      alt={video.title}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                    <span className="absolute bottom-1 right-1 px-1 py-0.5 rounded text-[10px] font-mono font-semibold bg-black/80 text-white">
                      {video.duration}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold text-slate-400">
                        #{video.index}
                      </span>
                      {assignedDay && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-indigo-400 border border-indigo-500/20">
                          Assigned to Day {assignedDay.day}
                        </span>
                      )}
                      {video.isCustom && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Custom Added
                        </span>
                      )}
                    </div>

                    <label
                      htmlFor={`pl-vid-${video.id}`}
                      className={`text-sm font-semibold cursor-pointer block leading-snug truncate ${
                        isWatched ? 'line-through text-slate-500' : 'text-slate-100 hover:text-indigo-300'
                      }`}
                    >
                      {video.title}
                    </label>

                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Duration: {video.duration} • Coder Army
                    </p>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                  <button
                    onClick={() => setEmbedVideo(video)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-indigo-300" />
                    <span>Watch In-App</span>
                  </button>

                  <a
                    href={video.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                    title="Watch directly on YouTube"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>

                  {video.isCustom && (
                    <button
                      onClick={() => deleteVideoFromPlaylist(activeTab, video.id)}
                      className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete custom video"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredVideos.length === 0 && (
          <div className="arc-card p-12 text-center">
            <p className="text-slate-400 text-sm">No videos match your search/filter.</p>
          </div>
        )}
      </div>

      {/* Modal for Adding Custom Video */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={`Add Custom Video to ${activeTab === 'java' ? 'Core Java' : 'Spring Boot'} Playlist`}
      >
        <form onSubmit={handleAddVideoSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video Title *
            </label>
            <input
              type="text"
              required
              value={newVideoTitle}
              onChange={(e) => setNewVideoTitle(e.target.value)}
              placeholder="e.g. Master Kafka Event Driven Architecture in Java"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              YouTube Video ID (11 characters) or leave blank
            </label>
            <input
              type="text"
              value={newVideoId}
              onChange={(e) => setNewVideoId(e.target.value)}
              placeholder="e.g. dQw4w9WgXcQ"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Video Duration (e.g. 45:00 or 1:15:30)
            </label>
            <input
              type="text"
              value={newVideoDuration}
              onChange={(e) => setNewVideoDuration(e.target.value)}
              placeholder="45:00"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              Add Video
            </button>
          </div>
        </form>
      </Modal>

      {/* In-App YouTube Embed Modal */}
      <Modal
        isOpen={!!embedVideo}
        onClose={() => setEmbedVideo(null)}
        title={embedVideo?.title || 'YouTube Player'}
        maxWidth="max-w-4xl"
      >
        {embedVideo && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800 shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${embedVideo.id}?autoplay=1&rel=0`}
                title={embedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">Duration: {embedVideo.duration}</p>
                <p className="text-xs text-slate-500">Coder Army • #{embedVideo.index}</p>
              </div>
              <a
                href={embedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Watch on YouTube
              </a>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

