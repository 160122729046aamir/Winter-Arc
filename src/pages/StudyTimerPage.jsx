import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle,
  Coffee,
  Brain,
  Clock,
  Sparkles,
  History,
  Trash2,
  Calendar
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { formatTimeSeconds, formatMinutesHuman, formatDate } from '../utils/dateUtils';

const PRESETS = [
  { name: 'Pomodoro', minutes: 25, mode: 'focus', icon: Brain },
  { name: 'Deep Work', minutes: 50, mode: 'focus', icon: Sparkles },
  { name: 'Short Break', minutes: 5, mode: 'break', icon: Coffee },
  { name: 'Long Break', minutes: 15, mode: 'break', icon: Coffee }
];

export default function StudyTimerPage() {
  const {
    days,
    currentChallengeDay,
    logStudyTime,
    studySessions,
    stats,
    triggerCelebration
  } = usePlanner();

  const [searchParams] = useSearchParams();
  const paramDay = parseInt(searchParams.get('day'), 10);
  const initialDay = !isNaN(paramDay) && paramDay >= 1 && paramDay <= 60
    ? paramDay
    : currentChallengeDay;

  const [selectedDayNumber, setSelectedDayNumber] = useState(initialDay);
  const [sessionNote, setSessionNote] = useState('');
  const [activePreset, setActivePreset] = useState(PRESETS[0]);
  const [timeLeft, setTimeLeft] = useState(PRESETS[0].minutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [initialDuration, setInitialDuration] = useState(PRESETS[0].minutes * 60);

  // Audio effect reference using Web Audio API for chime
  const playChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.15); // A5
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.2);
    } catch {
      // AudioContext unavailable
    }
  };

  // Timer interval
  useEffect(() => {
    let timer = null;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      setIsRunning(false);
      playChime();
      triggerCelebration();

      // Log study session if in focus mode
      if (activePreset.mode === 'focus') {
        const completedMins = Math.round(initialDuration / 60);
        logStudyTime(
          selectedDayNumber,
          completedMins,
          sessionNote.trim() || `Pomodoro focus on Day ${selectedDayNumber}`,
          'pomodoro'
        );
      }
    }
    return () => clearInterval(timer);
  }, [isRunning, timeLeft, activePreset, initialDuration, selectedDayNumber, sessionNote, logStudyTime, triggerCelebration]);

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(activePreset.minutes * 60);
  };

  const handleSelectPreset = (preset) => {
    setIsRunning(false);
    setActivePreset(preset);
    setInitialDuration(preset.minutes * 60);
    setTimeLeft(preset.minutes * 60);
  };

  const handleManualLog = () => {
    const mins = prompt('Enter completed study minutes to log manually:', '45');
    const parsed = parseInt(mins, 10);
    if (!isNaN(parsed) && parsed > 0) {
      logStudyTime(
        selectedDayNumber,
        parsed,
        sessionNote.trim() || `Manual study logged on Day ${selectedDayNumber}`,
        'manual'
      );
    }
  };

  // Progress percentage of the active timer
  const progressPercent = Math.round(
    ((initialDuration - timeLeft) / initialDuration) * 100
  );

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Clock className="w-8 h-8 text-amber-400" />
          Pomodoro & Focus Timer
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Deep-work time tracker. All logged focus intervals feed directly into your 60-day challenge analytics and streak.
        </p>
      </div>

      {/* Main Timer Display Card */}
      <div className="arc-card p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
        {/* Presets selector */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8 z-10">
          {PRESETS.map((p) => {
            const Icon = p.icon;
            const isSelected = activePreset.name === p.name;
            return (
              <button
                key={p.name}
                onClick={() => handleSelectPreset(p)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
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
          {/* SVG Ring */}
          <svg className="w-full h-full -rotate-90">
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-slate-800/80 fill-none"
              strokeWidth="6"
            />
            <circle
              cx="50%"
              cy="50%"
              r="44%"
              className="stroke-indigo-500 fill-none transition-all duration-300"
              strokeWidth="6"
              strokeDasharray="276%"
              strokeDashoffset={`${276 - (276 * progressPercent) / 100}%`}
              strokeLinecap="round"
            />
          </svg>

          {/* Time digits */}
          <div className="absolute flex flex-col items-center justify-center text-center">
            <span className="text-5xl sm:text-6xl font-extrabold font-mono text-slate-100 tracking-tight">
              {formatTimeSeconds(timeLeft)}
            </span>
            <span className="text-xs uppercase font-mono tracking-widest text-slate-400 mt-2">
              {activePreset.name} • {activePreset.mode === 'focus' ? 'Deep Work' : 'Rest'}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4 mt-6 z-10">
          <button
            onClick={handleReset}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Reset timer"
          >
            <RotateCcw className="w-5 h-5" />
          </button>

          <button
            onClick={handleStartPause}
            className={`px-8 py-3.5 rounded-full font-bold text-sm flex items-center gap-2 shadow-xl transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/30'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-600/40'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-5 h-5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-5 h-5 fill-white" /> Start Focus
              </>
            )}
          </button>

          <button
            onClick={handleManualLog}
            className="p-3 rounded-full bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Log study minutes manually"
          >
            <Clock className="w-5 h-5" />
          </button>
        </div>

        {/* Association selector: Day and task notes */}
        <div className="w-full max-w-md mt-8 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row gap-3">
          <div className="sm:w-1/3">
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Log against Day:
            </label>
            <select
              value={selectedDayNumber}
              onChange={(e) => setSelectedDayNumber(Number(e.target.value))}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-cyan-400 font-mono font-bold focus:outline-none"
            >
              {days.map((d) => (
                <option key={d.day} value={d.day}>
                  Day {d.day}: {d.title.slice(0, 20)}...
                </option>
              ))}
            </select>
          </div>

          <div className="sm:w-2/3">
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">
              Session Focus Note:
            </label>
            <input
              type="text"
              value={sessionNote}
              onChange={(e) => setSessionNote(e.target.value)}
              placeholder="e.g. Practicing HashMap Red-Black tree conversion"
              className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* History of Completed Sessions */}
      <div className="arc-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <History className="w-4 h-4 text-indigo-400" />
            Recent Focus Sessions Log
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Total Logged: <strong className="text-emerald-400">{stats.totalStudyHours} hours</strong>
          </span>
        </div>

        <div className="space-y-2.5">
          {(studySessions || []).slice(0, 6).map((session) => (
            <div
              key={session.id}
              className="flex items-center justify-between p-3 rounded-lg bg-slate-900/40 border border-slate-800 text-xs"
            >
              <div className="flex items-center gap-3">
                <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 font-mono font-bold">
                  Day {session.dayNumber}
                </span>
                <div>
                  <p className="font-semibold text-slate-200">{session.note || 'Focus Session'}</p>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {formatDate(session.date)} • {session.type === 'manual' ? 'Manual log' : 'Pomodoro'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 font-mono font-bold text-amber-400">
                <Clock className="w-3.5 h-3.5" />
                <span>+{session.durationMinutes} mins</span>
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

