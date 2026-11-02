import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Clock, Sparkles } from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';

export default function SixtyDayGrid() {
  const { days, currentChallengeDay, stats } = usePlanner();
  const navigate = useNavigate();

  const handleDayClick = (dayNumber) => {
    navigate(`/daily-planner?day=${dayNumber}`);
  };

  return (
    <div className="arc-card p-5 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-slate-100">60-Day Arc Grid</h2>
            <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Visual map of your backend mastery journey. Click any day to view or edit tasks.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
            <span className="text-slate-400">Completed ({stats.completedDaysCount})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-400 ring-2 ring-cyan-400/40 animate-pulse" />
            <span className="text-slate-400">Today (Day {currentChallengeDay})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-amber-500/80" />
            <span className="text-slate-400">Missed ({stats.missedDays?.length || 0})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700" />
            <span className="text-slate-500">Upcoming</span>
          </div>
        </div>
      </div>

      {/* Grid of 60 Days: Responsive 6 to 12 columns */}
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2 sm:gap-2.5">
        {days.map((d) => {
          const isToday = d.day === currentChallengeDay;
          const isCompleted = d.completed;
          const isMissed = d.day < currentChallengeDay && !d.completed && !d.recovered;

          let boxClass = 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-slate-600';
          if (isCompleted) {
            boxClass = 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)] hover:border-emerald-400';
          } else if (isToday) {
            boxClass = 'bg-cyan-500/20 border-cyan-400 text-cyan-200 ring-2 ring-cyan-400/50 shadow-[0_0_16px_rgba(6,182,212,0.3)] animate-pulse';
          } else if (isMissed) {
            boxClass = 'bg-amber-500/10 border-amber-500/40 text-amber-300 hover:border-amber-400';
          }

          // Phase divider indicators for Day 1, Day 26, Day 56
          const isPhaseStart = d.day === 1 || d.day === 26 || d.day === 56;

          return (
            <button
              key={d.day}
              onClick={() => handleDayClick(d.day)}
              title={`Day ${d.day}: ${d.title} (${isCompleted ? 'Completed' : isToday ? 'Today' : isMissed ? 'Missed' : 'Upcoming'})`}
              className={`relative aspect-square rounded-lg border text-center flex flex-col items-center justify-center p-1 font-mono transition-all duration-150 group cursor-pointer ${boxClass}`}
            >
              {isPhaseStart && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-indigo-400 ring-2 ring-slate-950" />
              )}

              <span className="text-xs sm:text-sm font-bold">
                {d.day}
              </span>

              {isCompleted ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400 mt-0.5" />
              ) : isToday ? (
                <span className="text-[9px] font-sans font-semibold text-cyan-300 uppercase tracking-tighter">
                  Now
                </span>
              ) : isMissed ? (
                <AlertCircle className="w-3 h-3 text-amber-400 mt-0.5" />
              ) : (
                <span className="text-[9px] text-slate-600 font-sans mt-0.5">
                  {d.phaseId === 'phase-1' ? 'Java' : d.phaseId === 'phase-2' ? 'Spring' : 'Rev'}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Phase Roadmap Footer Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-6 pt-5 border-t border-slate-800/80">
        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-300">Phase 1: Core Java</span>
            <span className="font-mono text-cyan-400">Days 1–25 ({stats.javaCompletionPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500">57 Deep-dive lectures: OOP, Collections, Concurrency</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-300">Phase 2: Spring Boot</span>
            <span className="font-mono text-indigo-400">Days 26–55 ({stats.springCompletionPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500">45 Lectures: IoC, JPA, Security, API Gateway project</p>
        </div>

        <div className="p-3 rounded-lg bg-slate-900/50 border border-slate-800">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="font-semibold text-slate-300">Phase 3: Revision & Projects</span>
            <span className="font-mono text-emerald-400">Days 56–60 ({stats.revCompletionPercent}%)</span>
          </div>
          <p className="text-[11px] text-slate-500">Capstone project, Top 50 Interview prep & Graduation</p>
        </div>
      </div>
    </div>
  );
}

