import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  Coffee,
  Brain,
  Clock,
  Sparkles,
  History,
  Trash2,
  Target,
  CheckCircle
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useTimer, TIMER_PRESETS, formatClock } from '../context/TimerContext';
import { formatMinutesHuman, formatDate } from '../utils/dateUtils';
import { promptNumber, confirmAction, toast } from '../utils/alerts';

const PRESET_ICONS = { Pomodoro: Brain, 'Deep Work': Sparkles, 'Short Break': Coffee, 'Long Break': Coffee };

export default function StudyTimerPage() {
  const { days, logStudyTime, deleteStudySession, studySessions, stats } = usePlanner();
  const timer = useTimer();
  const [searchParams] = useSearchParams();

  // ?day=N preselects which day the session is logged against
  useEffect(() => {
    const paramDay = parseInt(searchParams.get('day'), 10);
    if (!Number.isNaN(paramDay) && paramDay >= 1 && paramDay <= days.length) {
      timer.setDayNumber(paramDay);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, days.length]);

  const handleManualLog = async () => {
    const minutes = await promptNumber({
      title: 'Log study time',
      text: `How many minutes did you study for Day ${timer.effectiveDay}?`,
      defaultValue: '45',
      placeholder: 'Minutes',
      confirmText: 'Log Minutes'
    });
    if (minutes) {
      logStudyTime(
        timer.effectiveDay,
        minutes,
        timer.note.trim() || `Manual study logged on Day ${timer.effectiveDay}`,
        'manual'
      );
      toast(`Logged ${minutes} minutes`);
    }
  };

  const handleReset = async () => {
    const minutes = Math.floor(timer.elapsedSec / 60);
    if (timer.mode === 'focus' && minutes >= 1) {
      const ok = await confirmAction({
        title: `Log ${minutes} min before resetting?`,
        text: 'You stopped early. Keep the time you already focused, or discard it.',
        confirmText: `Log ${minutes} min`,
        cancelText: 'Discard',
        icon: 'question'
      });
      if (ok) {
        timer.logPartialAndReset();
        return;
      }
    }
    timer.reset();
  };

  const handleDeleteSession = async (session) => {
    const ok = await confirmAction({
      title: 'Delete this session?',
      text: `${session.durationMinutes} min on Day ${session.dayNumber} will be removed from your totals.`,
      confirmText: 'Delete',
      icon: 'warning',
      danger: true
    });
    if (ok) {
      deleteStudySession(session.id);
      toast('Session deleted');
    }
  };

  const progressPercent = Math.round(timer.progress * 100);
  const goal = stats.dailyTargetMinutes || 120;
  const todayMins = stats.todayStudyMinutes || 0;
  const goalPercent = Math.min(100, Math.round((todayMins / goal) * 100));

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Clock className="w-8 h-8 text-amber-400" />
          Pomodoro & Focus Timer
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          The timer keeps running while you use other pages. Completed focus sessions are logged automatically and count toward your streak.
        </p>
      </div>

      {/* Main Timer Display Card */}
      <div className="arc-card p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Presets selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 z-10">
          {TIMER_PRESETS.map((p) => {
            const Icon = PRESET_ICONS[p.name] || Brain;
            const isSelected = timer.presetName === p.name;
            return (
              <button
                key={p.name}
                onClick={() => timer.selectPreset(p)}
                disabled={timer.running}
                title={timer.running ? 'Pause the timer to switch presets' : undefined}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all disabled:cursor-not-allowed ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 disabled:opacity-40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{p.name} ({p.minutes}m)</span>
              </button>
            );
          })}
        </div>

        {/* Circular Progress & Digital Display */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 flex flex-col items-center justify-center my-2">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" className="stroke-slate-800/80 fill-none" strokeWidth="3" />
            <circle
              cx="50"
              cy="50"
              r="44"
              className={`fill-none transition-[stroke-dashoffset] duration-500 ${timer.mode === 'focus' ? 'stroke-indigo-500' : 'stroke-emerald-500'}`}
              strokeWidth="3"
              pathLength="100"
              strokeDasharray="100"
              strokeDashoffset={100 - progressPercent}
              strokeLinecap="round"
            />
          </svg>

          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-slate-100 tracking-tight tabular-nums">
              {formatClock(timer.remainingSec)}
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 mt-2">
              {timer.presetName} • {timer.mode === 'focus' ? 'Deep Work' : 'Rest'}
            </span>
            {timer.running && (
              <span className="mt-2 text-[11px] font-mono text-cyan-400 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" /> Running
              </span>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6 z-10">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors apple-press"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={timer.running ? timer.pause : timer.start}
            className={`px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl transition-all apple-press ${
              timer.running
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
            }`}
          >
            {timer.running ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" />
                {timer.elapsedSec > 0 ? 'Resume' : timer.mode === 'focus' ? 'Start Focus' : 'Start Break'}
              </>
            )}
          </button>

          <button
            onClick={handleManualLog}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors apple-press"
            title="Log study minutes manually"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>

        {/* Association selector: Day and task notes */}
        <div className="w-full max-w-md mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/3">
            <label htmlFor="timer-day" className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Log against Day:
            </label>
            <select
              id="timer-day"
              value={timer.effectiveDay}
              onChange={(e) => timer.setDayNumber(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono font-bold focus:outline-none"
            >
              {days.map((d) => (
                <option key={d.day} value={d.day}>
                  Day {d.day}: {d.title.length > 22 ? `${d.title.slice(0, 22)}…` : d.title}
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-2/3">
            <label htmlFor="timer-note" className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Session Focus Note:
            </label>
            <input
              id="timer-note"
              type="text"
              value={timer.note}
              onChange={(e) => timer.setNote(e.target.value)}
              placeholder="e.g. Practicing HashMap Red-Black tree conversion"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Daily goal */}
      <div className="arc-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-400" />
            Today's study goal
          </h3>
          <span className="text-xs font-mono text-slate-400">
            <strong className="text-emerald-400">{formatMinutesHuman(todayMins)}</strong> / {formatMinutesHuman(goal)}
          </span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-400 transition-all duration-700"
            style={{ width: `${goalPercent}%` }}
          />
        </div>
        <p className="text-[11px] text-slate-500 mt-2 flex items-center gap-1.5">
          {goalPercent >= 100 ? (
            <><CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> Goal reached for today.</>
          ) : (
            <>Change the daily goal in Settings.</>
          )}
        </p>
      </div>

      {/* History of Completed Sessions */}
      <div className="arc-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Recent Focus Sessions
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Logged: <strong className="text-emerald-400">{stats.totalStudyHours} hours</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {(studySessions || []).slice(0, 10).map((session) => (
            <div
              key={session.id}
              className="group flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold flex-shrink-0">
                  Day {session.dayNumber}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-200 truncate">{session.note || 'Focus Session'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatDate(session.date)} • {session.type === 'manual' ? 'Manual log' : 'Pomodoro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="flex items-center gap-1.5 font-mono font-bold text-amber-400">
                  <Clock className="w-3.5 h-3.5" />
                  +{session.durationMinutes} mins
                </span>
                <button
                  onClick={() => handleDeleteSession(session)}
                  className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete session"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}

          {(!studySessions || studySessions.length === 0) && (
            <p className="text-xs text-slate-500 text-center py-6 italic">
              No sessions logged yet. Complete your first 25-minute Pomodoro session above!
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
