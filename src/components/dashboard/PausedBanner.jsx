import React from 'react';
import { PlayCircle, Shield, Pause, Clock, Calendar, Sparkles } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { formatDate, formatDurationDaysHuman, getTodayDateString, getDaysDifference } from '../../utils/dateUtils';

export default function PausedBanner() {
  const {
    journeyStatus,
    pausedAt,
    totalPausedDays,
    currentChallengeDay,
    stats,
    resumeJourney,
    triggerCelebration
  } = usePlanner();

  if (journeyStatus !== 'paused') return null;

  const today = getTodayDateString();
  const currentPauseDuration = pausedAt ? Math.max(0, getDaysDifference(pausedAt, today)) : 0;
  const cumulativePaused = totalPausedDays + currentPauseDuration;

  const handleResume = () => {
    resumeJourney();
    triggerCelebration('Welcome Back!', 'Winter Arc journey resumed!');
  };

  return (
    <div className="arc-card p-6 border-amber-500/40 bg-gradient-to-r from-amber-950/20 via-slate-900 to-amber-950/10 shadow-[0_0_30px_rgba(245,158,11,0.15)] relative overflow-hidden">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
            <span className="text-xs font-black uppercase tracking-widest text-amber-400 font-mono">
              WINTER ARC – PAUSED
            </span>
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Frozen at Day {currentChallengeDay}
            </span>
          </div>

          <h2 className="text-2xl font-black text-slate-100 tracking-tight">
            Your journey is on hold. Your progress is safe.
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1 text-xs font-mono">
            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Current Progress</span>
              <span className="font-bold text-slate-200">Day {currentChallengeDay} of 60</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Completed Days</span>
              <span className="font-bold text-emerald-400">{stats.completedDaysCount} days</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Remaining Days</span>
              <span className="font-bold text-cyan-400">{60 - stats.completedDaysCount} days</span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase">Pause Started</span>
              <span className="font-bold text-amber-300">{formatDate(pausedAt)}</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Current break duration: <strong className="text-slate-200">{formatDurationDaysHuman(currentPauseDuration)}</strong> (Cumulative paused: {formatDurationDaysHuman(cumulativePaused)}). No streak penalties are applied during pauses.
          </p>
        </div>

        {/* Big Action Button */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto flex-shrink-0">
          <button
            onClick={handleResume}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-sm shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 transition-all transform hover:scale-[1.02]"
          >
            <PlayCircle className="w-5 h-5 fill-slate-950 text-emerald-400" />
            <span>Resume Winter Arc Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

