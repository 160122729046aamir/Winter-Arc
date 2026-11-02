import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  PlayCircle,
  ExternalLink,
  CheckCircle,
  ArrowRight,
  Code2,
  BookOpen,
  Sparkles,
  CheckSquare
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { formatDate, formatMinutesHuman } from '../../utils/dateUtils';
import ProgressBar from '../common/ProgressBar';

export default function TodayTaskCard() {
  const {
    days,
    currentChallengeDay,
    toggleVideoWatched,
    toggleExercise,
    toggleRevision,
    toggleCustomTask,
    markDayComplete,
    markDayIncomplete
  } = usePlanner();
  const navigate = useNavigate();

  const todayDay = days.find((d) => d.day === currentChallengeDay) || days[0];

  // Calculate today's completion stats
  const totalVideos = todayDay.videos?.length || 0;
  const watchedVideos = Object.keys(todayDay.checkedVideos || {}).filter(k => todayDay.checkedVideos[k]).length;
  const totalExercises = todayDay.exercises?.length || 0;
  const checkedExercises = Object.keys(todayDay.checkedExercises || {}).filter(k => todayDay.checkedExercises[k]).length;
  const totalRevision = todayDay.revision?.length || 0;
  const checkedRevision = Object.keys(todayDay.checkedRevision || {}).filter(k => todayDay.checkedRevision[k]).length;
  const totalCustom = todayDay.customTasks?.length || 0;
  const checkedCustom = (todayDay.customTasks || []).filter(t => t.completed).length;

  const totalTasks = totalVideos + totalExercises + totalRevision + totalCustom;
  const completedTasks = watchedVideos + checkedExercises + checkedRevision + checkedCustom;
  const percentComplete = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <div className="arc-card p-5 sm:p-6 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                DAY {todayDay.day} OF 60
              </span>
              <span className="text-xs text-slate-400">
                {formatDate(todayDay.date)}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-100">
              {todayDay.title}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Playlist: <span className="text-slate-300 font-medium">{todayDay.playlistName}</span>
            </p>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400" />
            <span>Target: {formatMinutesHuman(todayDay.targetMinutes)}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-5 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">Daily Target Completion</span>
            <span className="font-mono font-bold text-cyan-400">
              {completedTasks} / {totalTasks} tasks ({percentComplete}%)
            </span>
          </div>
          <ProgressBar value={percentComplete} size="sm" color="cyan" />
        </div>

        {/* Video Lectures Section */}
        {todayDay.videos && todayDay.videos.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <PlayCircle className="w-3.5 h-3.5 text-indigo-400" /> Assigned YouTube Videos
            </h4>
            <div className="space-y-2">
              {todayDay.videos.map((vid) => {
                const isWatched = todayDay.checkedVideos?.[vid.id];
                return (
                  <div
                    key={vid.id}
                    className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                      isWatched
                        ? 'bg-emerald-500/5 border-emerald-500/30'
                        : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <input
                        type="checkbox"
                        checked={!!isWatched}
                        onChange={() => toggleVideoWatched(todayDay.day, vid.id)}
                        className="custom-checkbox flex-shrink-0"
                        id={`vid-${vid.id}`}
                      />
                      <div className="min-w-0">
                        <label
                          htmlFor={`vid-${vid.id}`}
                          className={`text-xs font-medium cursor-pointer block truncate ${
                            isWatched ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {vid.title}
                        </label>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Duration: {vid.duration}
                        </span>
                      </div>
                    </div>

                    <a
                      href={vid.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Watch on YouTube"
                      className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition-colors flex-shrink-0 ml-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Practical Exercises Preview */}
        {todayDay.exercises && todayDay.exercises.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5 font-mono">
              <Code2 className="w-3.5 h-3.5 text-cyan-400" /> Practical Coding Exercises
            </h4>
            <div className="space-y-1.5">
              {todayDay.exercises.slice(0, 2).map((exercise, idx) => {
                const isDone = todayDay.checkedExercises?.[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleExercise(todayDay.day, idx)}
                    className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-900/30 border border-slate-800/60 hover:bg-slate-900/60 cursor-pointer transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={!!isDone}
                      onChange={() => {}}
                      className="custom-checkbox mt-0.5 flex-shrink-0 pointer-events-none"
                    />
                    <span
                      className={`text-xs leading-relaxed ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-300'
                      }`}
                    >
                      {exercise}
                    </span>
                  </div>
                );
              })}
              {todayDay.exercises.length > 2 && (
                <button
                  onClick={() => navigate(`/daily-planner?day=${todayDay.day}`)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium pl-1 flex items-center gap-1"
                >
                  +{todayDay.exercises.length - 2} more coding exercises in Daily Planner
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        {todayDay.completed ? (
          <button
            onClick={() => markDayIncomplete(todayDay.day)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 hover:bg-emerald-500/20 transition-colors"
          >
            <CheckCircle className="w-4 h-4" /> Day Completed! (Click to undo)
          </button>
        ) : (
          <button
            onClick={() => markDayComplete(todayDay.day)}
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 transition-colors"
          >
            <CheckSquare className="w-4 h-4" /> Complete All Tasks for Today
          </button>
        )}

        <button
          onClick={() => navigate(`/daily-planner?day=${todayDay.day}`)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
        >
          <span>Open Full Day Planner</span>
          <ArrowRight className="w-4 h-4 text-indigo-400" />
        </button>
      </div>
    </div>
  );
}

