import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Award,
  Clock,
  PlaySquare,
  CheckCircle2,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Target,
  HelpCircle,
  PauseCircle,
  PlayCircle,
  AlertTriangle,
  Code2,
  BookOpen
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import StatCard from '../components/dashboard/StatCard';
import SixtyDayGrid from '../components/dashboard/SixtyDayGrid';
import TodayTaskCard from '../components/dashboard/TodayTaskCard';
import QuickActionBanner from '../components/dashboard/QuickActionBanner';
import PausedBanner from '../components/dashboard/PausedBanner';
import PauseModal from '../components/common/PauseModal';
import ProgressBar from '../components/common/ProgressBar';
import { formatDate } from '../utils/dateUtils';

export default function Dashboard() {
  const {
    stats,
    currentChallengeDay,
    days,
    settings,
    journeyStatus,
    resumeJourney,
    triggerCelebration
  } = usePlanner();

  const navigate = useNavigate();
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  // Next 3 upcoming days
  const upcomingDays = days.filter(
    (d) => d.day > currentChallengeDay && d.day <= currentChallengeDay + 3
  );

  const handleResumeClick = () => {
    resumeJourney();
    triggerCelebration('Welcome Back!', 'Journey resumed successfully!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Welcome & Challenge Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            {/* Journey Status Pill */}
            <span
              className={`px-2.5 py-0.5 text-[11px] font-bold rounded uppercase tracking-wider flex items-center gap-1.5 font-mono ${
                journeyStatus === 'paused'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : journeyStatus === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  journeyStatus === 'paused' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'
                }`}
              />
              Status: {journeyStatus === 'paused' ? 'Paused' : journeyStatus === 'completed' ? 'Graduated' : 'Active Arc'}
            </span>

            <span className="text-xs text-slate-400">
              {formatDate(new Date().toISOString())}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight">
            Welcome back, <span className="bg-gradient-to-r from-indigo-400 via-cyan-400 to-emerald-400 bg-clip-text text-transparent">{settings.userName || 'Backend Engineer'}</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            You are on <strong className="text-slate-200">Day {currentChallengeDay} of 60</strong>. Complete your lectures, coding problems, and 25 daily quiz questions.
          </p>
        </div>

        {/* Controls: Pause / Resume & Phase Indicator */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {journeyStatus === 'active' ? (
            <button
              onClick={() => setIsPauseModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
              title="Pause Challenge countdown and preserve all progress"
            >
              <PauseCircle className="w-4 h-4 text-amber-400" />
              <span>Pause Journey</span>
            </button>
          ) : (
            <button
              onClick={handleResumeClick}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Journey</span>
            </button>
          )}

          <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-900/80 border border-slate-800">
            <div className="flex flex-col items-end px-2">
              <span className="text-[10px] uppercase font-semibold text-slate-400">Current Phase</span>
              <span className="text-xs font-bold text-cyan-400">
                {currentChallengeDay <= 25 ? 'Phase 1: Core Java' : currentChallengeDay <= 55 ? 'Phase 2: Spring Boot' : 'Phase 3: Revision'}
              </span>
            </div>
            <button
              onClick={() => navigate('/plan')}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition-colors"
              title="View full 60-day roadmap"
            >
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Paused Banner (Shown prominently if journey is paused) */}
      <PausedBanner />

      {/* Missed-Day Recovery or Momentum Banner (Shown when active) */}
      {journeyStatus !== 'paused' && <QuickActionBanner />}

      {/* Primary KPI Stats Grid (10 Core Metrics as requested) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <StatCard
          title="Overall Arc Progress"
          value={`${stats.overallCompletionPercent}%`}
          subtext={`${stats.completedDaysCount} of 60 days completed`}
          icon={TrendingUp}
          color="indigo"
          badge={`Day ${currentChallengeDay}`}
        />

        <StatCard
          title="Daily Study Streak"
          value={`${stats.currentStreak} Days`}
          subtext={`Longest streak: ${stats.longestStreak} days`}
          icon={Flame}
          color="amber"
          badge="Unbroken"
        />

        <StatCard
          title="Lectures Watched"
          value={`${stats.completedVideosCount}`}
          subtext={`${stats.remainingVideosCount} remaining (${stats.totalVideos} total)`}
          icon={PlaySquare}
          color="cyan"
          badge="Coder Army"
        />

        <StatCard
          title="Questions Solved"
          value={`${stats.totalQuestionsCorrect}`}
          subtext={`${stats.totalQuestionsAttempted} attempted (${stats.overallQuizAccuracy}% acc)`}
          icon={HelpCircle}
          color="emerald"
          badge="25 Qs / Day"
        />

        <StatCard
          title="Study Time Logged"
          value={`${stats.totalStudyHours}h`}
          subtext={`Paused: ${stats.totalPausedDays} days total`}
          icon={Clock}
          color="rose"
          badge="Focused"
        />
      </div>

      {/* Question Bank Accuracy & Weak Topics Dashboard Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Difficulty Accuracy Breakdown */}
        <div className="arc-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wider">
                <HelpCircle className="w-4 h-4 text-indigo-400" />
                Question Accuracy
              </h3>
              <span className="text-xs font-mono font-bold text-cyan-400">
                {stats.completedQuizzesCount} / 60 Quizzes Done
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Real-time accuracy across all 1,500 questions categorized by difficulty:
            </p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-cyan-400 font-bold">Basic Tier (10 / day)</span>
                  <span>{stats.basicAccuracy}% Accuracy</span>
                </div>
                <ProgressBar value={stats.basicAccuracy} size="sm" color="cyan" />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-indigo-400 font-bold">Medium Tier (10 / day)</span>
                  <span>{stats.mediumAccuracy}% Accuracy</span>
                </div>
                <ProgressBar value={stats.mediumAccuracy} size="sm" color="indigo" />
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="text-rose-400 font-bold">Hard Tier (5 / day)</span>
                  <span>{stats.hardAccuracy}% Accuracy</span>
                </div>
                <ProgressBar value={stats.hardAccuracy} size="sm" color="rose" />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400 font-mono">
            <span>Total Questions Solved: <strong className="text-slate-200">{stats.totalQuestionsCorrect}</strong></span>
            <button
              onClick={() => navigate(`/daily-planner?day=${currentChallengeDay}`)}
              className="text-cyan-400 hover:underline"
            >
              Start Day {currentChallengeDay} Quiz &rarr;
            </button>
          </div>
        </div>

        {/* Weak Topics Diagnostic Card */}
        <div className="arc-card p-5 sm:p-6 lg:col-span-2 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wider">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                Weak Topics & Improvement Recommendations
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                Diagnostic Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Topics where accuracy dropped below 70% or questions were missed. Revisit corresponding Coder Army lectures and notes:
            </p>

            <div className="space-y-2.5">
              {stats.weakTopics && stats.weakTopics.length > 0 ? (
                stats.weakTopics.slice(0, 4).map((item) => (
                  <div
                    key={item.topic}
                    onClick={() => navigate(`/daily-planner?day=${item.dayNumber}`)}
                    className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 cursor-pointer transition-colors"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="w-2 h-2 rounded-full bg-rose-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <span className="text-xs font-semibold text-slate-200 block truncate">
                          {item.topic}
                        </span>
                        <span className="text-[11px] text-slate-500 font-mono">
                          Day {item.dayNumber} • {item.incorrect} incorrect of {item.attempted} attempts
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0 font-mono">
                      <span className="text-xs font-bold text-rose-400">
                        {item.accuracy}% Accuracy
                      </span>
                      <button className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1">
                        <span>Revise</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-6 rounded-lg bg-slate-900/40 border border-slate-800/80 text-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-200">No weak topics detected yet!</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    As you solve daily quizzes, any concepts requiring review will be automatically catalogued here.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between text-xs text-slate-400">
            <span>Coding Exercises Completed: <strong className="text-indigo-300 font-mono">{days.reduce((acc, d) => acc + Object.keys(d.checkedExercises || {}).filter(k => d.checkedExercises[k]).length, 0)}</strong></span>
            <button
              onClick={() => navigate('/notes')}
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Open Revision Center &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Main Two-Column Row: Today's Tasks & Upcoming Tasks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {journeyStatus === 'paused' ? (
            <div className="arc-card p-8 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
                <PauseCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-100">Daily Learning Actions are Paused</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Your Winter Arc is on hold. When you are ready to resume, click the button below to reactivate daily targets and quizzes.
              </p>
              <button
                onClick={handleResumeClick}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all hover:scale-105"
              >
                Resume Learning Journey Now
              </button>
            </div>
          ) : (
            <TodayTaskCard />
          )}
        </div>

        {/* Upcoming Tasks Preview Card */}
        <div className="arc-card p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-400" /> Upcoming Tasks
              </h3>
              <button
                onClick={() => navigate('/plan')}
                className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
              >
                View all &rarr;
              </button>
            </div>

            <div className="space-y-3">
              {upcomingDays.map((upDay) => (
                <div
                  key={upDay.day}
                  onClick={() => navigate(`/daily-planner?day=${upDay.day}`)}
                  className="p-3 rounded-lg bg-slate-900/50 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-300 font-mono">
                      Day {upDay.day}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {formatDate(upDay.date)}
                    </span>
                  </div>
                  <h4 className="text-xs font-semibold text-slate-200 truncate">
                    {upDay.title}
                  </h4>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-2 font-mono">
                    <span>{upDay.videos?.length || 0} videos</span>
                    <span>•</span>
                    <span>25 questions quiz</span>
                  </div>
                </div>
              ))}

              {upcomingDays.length === 0 && (
                <p className="text-xs text-slate-500 py-4 text-center">
                  You are approaching the end of your 60-Day Arc! Check Day 60 for graduation.
                </p>
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/80 mt-4">
            <button
              onClick={() => navigate('/timer')}
              className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 flex items-center justify-center gap-2 transition-colors"
            >
              <Clock className="w-4 h-4 text-amber-400" />
              <span>Start 25-Min Focus Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Large 60-Day Progress Grid */}
      <SixtyDayGrid />

      {/* Pause Confirmation Modal */}
      <PauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
      />
    </div>
  );
}
