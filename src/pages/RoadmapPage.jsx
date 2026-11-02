import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  CheckCircle2,
  Clock,
  PlayCircle,
  Code2,
  Calendar,
  ArrowRight,
  Sparkles,
  Layers,
  CheckSquare
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { formatDate, formatMinutesHuman } from '../utils/dateUtils';
import ProgressBar from '../components/common/ProgressBar';

export default function RoadmapPage() {
  const { days, currentChallengeDay, markDayComplete, markDayIncomplete } = usePlanner();
  const navigate = useNavigate();

  const [phaseFilter, setPhaseFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDays = useMemo(() => {
    return days.filter((d) => {
      // Phase filter
      if (phaseFilter !== 'all' && d.phaseId !== phaseFilter) {
        return false;
      }
      // Status filter
      if (statusFilter === 'completed' && !d.completed) return false;
      if (statusFilter === 'pending' && d.completed) return false;
      if (statusFilter === 'missed' && !(d.day < currentChallengeDay && !d.completed && !d.recovered)) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesDay = String(d.day).includes(query);
        const matchesTitle = d.title.toLowerCase().includes(query);
        const matchesTopic = d.topic.toLowerCase().includes(query);
        const matchesVideo = (d.videos || []).some((v) =>
          v.title.toLowerCase().includes(query)
        );
        const matchesExercise = (d.exercises || []).some((ex) =>
          ex.toLowerCase().includes(query)
        );
        if (!matchesDay && !matchesTitle && !matchesTopic && !matchesVideo && !matchesExercise) {
          return false;
        }
      }

      return true;
    });
  }, [days, phaseFilter, statusFilter, searchQuery, currentChallengeDay]);

  const completedCount = filteredDays.filter((d) => d.completed).length;
  const filteredPercent =
    filteredDays.length > 0 ? Math.round((completedCount / filteredDays.length) * 100) : 0;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            My 60-Day Backend Roadmap
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            Structured daily curriculum mapped directly to Coder Army's 57 Core Java and 45 Spring Boot master lectures.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-mono text-slate-300">
            Showing <strong className="text-cyan-400">{filteredDays.length}</strong> of 60 Days ({filteredPercent}% Done)
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="arc-card p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search topics (e.g. HashMap, Generics, JWT, Docker, IoC, Day 14)..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/80 border border-slate-800 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Phase Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
            <button
              onClick={() => setPhaseFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                phaseFilter === 'all'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              All Phases
            </button>
            <button
              onClick={() => setPhaseFilter('phase-1')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                phaseFilter === 'phase-1'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Phase 1: Core Java (Days 1–25)
            </button>
            <button
              onClick={() => setPhaseFilter('phase-2')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                phaseFilter === 'phase-2'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Phase 2: Spring Boot (Days 26–55)
            </button>
            <button
              onClick={() => setPhaseFilter('phase-3')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                phaseFilter === 'phase-3'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              Phase 3: Revision & Capstone (56–60)
            </button>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-500 font-medium font-mono text-[11px] uppercase">Status:</span>
          {['all', 'pending', 'completed', 'missed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors ${
                statusFilter === status
                  ? 'bg-slate-800 text-white border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Days Roadmap List */}
      <div className="space-y-3">
        {filteredDays.map((dayItem) => {
          const isToday = dayItem.day === currentChallengeDay;
          const isCompleted = dayItem.completed;
          const isMissed = dayItem.day < currentChallengeDay && !dayItem.completed && !dayItem.recovered;

          // Video count and duration
          const videoCount = dayItem.videos?.length || 0;
          const exercisesCount = dayItem.exercises?.length || 0;
          const totalTasks =
            videoCount +
            exercisesCount +
            (dayItem.revision?.length || 0) +
            (dayItem.customTasks?.length || 0);

          let borderClass = 'border-slate-800 hover:border-slate-700';
          if (isToday) borderClass = 'border-cyan-400/80 shadow-[0_0_15px_rgba(6,182,212,0.15)] ring-1 ring-cyan-400/40';
          if (isCompleted) borderClass = 'border-emerald-500/40 bg-emerald-950/5';
          if (isMissed) borderClass = 'border-amber-500/40 bg-amber-950/5';

          return (
            <div
              key={dayItem.day}
              className={`arc-card p-4 sm:p-5 transition-all ${borderClass}`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left side: Day info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-xl flex flex-col items-center justify-center font-mono font-bold flex-shrink-0 ${
                      isCompleted
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                        : isToday
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400 ring-2 ring-cyan-400/40'
                        : isMissed
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        : 'bg-slate-900 text-slate-300 border border-slate-800'
                    }`}
                  >
                    <span className="text-[10px] uppercase text-slate-500 font-normal">Day</span>
                    <span className="text-sm -mt-0.5">{dayItem.day}</span>
                  </div>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                        {dayItem.phaseId === 'phase-1' ? 'Core Java' : dayItem.phaseId === 'phase-2' ? 'Spring Boot' : 'Capstone'}
                      </span>
                      <span className="text-xs text-slate-500 font-mono">
                        {formatDate(dayItem.date)}
                      </span>
                      {isToday && (
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                          Active Today
                        </span>
                      )}
                      {isCompleted && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Completed
                        </span>
                      )}
                      {isMissed && (
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          Missed (Needs Recovery)
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-100 truncate">
                      {dayItem.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400 mt-2 font-mono">
                      <span className="flex items-center gap-1">
                        <PlayCircle className="w-3.5 h-3.5 text-indigo-400" />
                        {videoCount} {videoCount === 1 ? 'Video' : 'Videos'}
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                        {exercisesCount} Exercises
                      </span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-amber-400" />
                        {formatMinutesHuman(dayItem.targetMinutes)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right side: Actions */}
                <div className="flex items-center gap-2.5 self-end md:self-center flex-shrink-0">
                  {isCompleted ? (
                    <button
                      onClick={() => markDayIncomplete(dayItem.day)}
                      title="Mark as Incomplete"
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Done
                    </button>
                  ) : (
                    <button
                      onClick={() => markDayComplete(dayItem.day)}
                      title="Quick complete day"
                      className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-medium hover:border-slate-700 hover:text-white transition-colors flex items-center gap-1.5"
                    >
                      <CheckSquare className="w-4 h-4 text-slate-500" /> Mark Done
                    </button>
                  )}

                  <button
                    onClick={() => navigate(`/daily-planner?day=${dayItem.day}`)}
                    className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-colors"
                  >
                    <span>Open Day</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}

        {filteredDays.length === 0 && (
          <div className="arc-card p-12 text-center">
            <p className="text-slate-400 text-sm">No days match your current search and filters.</p>
            <button
              onClick={() => {
                setPhaseFilter('all');
                setStatusFilter('all');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-indigo-400 hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

