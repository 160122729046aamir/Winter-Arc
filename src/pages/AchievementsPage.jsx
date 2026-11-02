import React from 'react';
import {
  Trophy,
  Flame,
  Award,
  Zap,
  Sparkles,
  Lock,
  CheckCircle2,
  Footprints,
  Coffee,
  Shield,
  Cpu,
  Leaf,
  Crown,
  Activity,
  Timer,
  Target,
  PlayCircle
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { BADGES_CATALOG } from '../data/badgesData';
import ProgressBar from '../components/common/ProgressBar';

// Icon mapping
const ICON_MAP = {
  Footprints,
  Flame,
  Award,
  Coffee,
  Shield,
  Cpu,
  Leaf,
  Crown,
  Zap,
  Activity,
  Sparkles,
  Timer,
  Target,
  PlayCircle
};

export default function AchievementsPage() {
  const { stats, xp, unlockedBadges, triggerCelebration } = usePlanner();

  const unlockedSet = new Set(unlockedBadges || []);

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
            <Trophy className="w-8 h-8 text-amber-400" />
            Achievements & Gamification
          </h1>
          <p className="text-sm text-slate-400 mt-1 max-w-2xl">
            XP and badges are earned strictly through completed lectures, coding practices, and uninterrupted streaks.
          </p>
        </div>

        <button
          onClick={() => triggerCelebration('Winter Arc Blast', 'Keep pushing!')}
          className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <Sparkles className="w-4 h-4" />
          <span>Trigger Celebration ⚡</span>
        </button>
      </div>

      {/* Level & XP Banner */}
      <div className="arc-card p-6 relative overflow-hidden bg-gradient-to-r from-indigo-950/50 via-slate-900/80 to-purple-950/40 border-indigo-500/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30 flex-shrink-0">
              <Crown className="w-8 h-8" />
            </div>

            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  Level {stats.levelInfo.currentLevel}
                </span>
                <span className="text-xs text-slate-500">•</span>
                <span className="text-xs font-mono text-slate-400">
                  Total XP: <strong className="text-indigo-300">{xp}</strong>
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-100 tracking-tight">
                {stats.levelInfo.title}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Next Rank: <strong className="text-slate-300">{stats.levelInfo.nextTitle}</strong> ({stats.levelInfo.xpToNext} XP needed)
              </p>
            </div>
          </div>

          <div className="w-full md:w-64">
            <div className="flex justify-between items-center text-xs mb-1.5 font-mono">
              <span className="text-slate-400 font-medium">Rank Progression</span>
              <span className="font-bold text-cyan-400">{stats.levelInfo.progress}%</span>
            </div>
            <ProgressBar value={stats.levelInfo.progress} size="md" color="indigo" />
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="arc-card p-4">
          <div className="flex items-center gap-2 text-amber-400 mb-1">
            <Flame className="w-4 h-4 fill-amber-400" />
            <span className="text-xs font-mono font-semibold uppercase">Daily Streak</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {stats.currentStreak} Days
          </div>
          <span className="text-[11px] text-slate-400">Best: {stats.longestStreak} days</span>
        </div>

        <div className="arc-card p-4">
          <div className="flex items-center gap-2 text-cyan-400 mb-1">
            <Zap className="w-4 h-4 fill-cyan-400" />
            <span className="text-xs font-mono font-semibold uppercase">Badges Earned</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {unlockedSet.size} / {BADGES_CATALOG.length}
          </div>
          <span className="text-[11px] text-slate-400">
            {Math.round((unlockedSet.size / BADGES_CATALOG.length) * 100)}% Unlocked
          </span>
        </div>

        <div className="arc-card p-4">
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span className="text-xs font-mono font-semibold uppercase">Days Conquered</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {stats.completedDaysCount} / 60
          </div>
          <span className="text-[11px] text-slate-400">Winter Arc Days</span>
        </div>

        <div className="arc-card p-4">
          <div className="flex items-center gap-2 text-indigo-400 mb-1">
            <Award className="w-4 h-4" />
            <span className="text-xs font-mono font-semibold uppercase">Consistency</span>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-100">
            {stats.consistencyScore}%
          </div>
          <span className="text-[11px] text-slate-400">Daily velocity</span>
        </div>
      </div>

      {/* Badges Catalog Grid */}
      <div>
        <h3 className="text-base font-bold text-slate-100 mb-4 font-mono uppercase tracking-wider">
          Achievement Badges Catalog
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {BADGES_CATALOG.map((badge) => {
            const isUnlocked = unlockedSet.has(badge.id);
            const Icon = ICON_MAP[badge.icon] || Trophy;

            return (
              <div
                key={badge.id}
                className={`arc-card p-5 transition-all relative overflow-hidden ${
                  isUnlocked
                    ? 'border-indigo-500/40 bg-indigo-950/10 shadow-[0_0_15px_rgba(99,102,241,0.1)]'
                    : 'border-slate-800 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isUnlocked
                        ? 'bg-gradient-to-tr from-indigo-600 to-cyan-400 text-white shadow-md shadow-indigo-500/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-500'
                    }`}
                  >
                    {isUnlocked ? <Icon className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                        {badge.category}
                      </span>
                      <span className="text-xs font-mono font-bold text-amber-400">
                        +{badge.xpReward} XP
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-slate-100 truncate">
                      {badge.name}
                    </h4>

                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {badge.description}
                    </p>

                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono">
                      <span className={isUnlocked ? 'text-emerald-400 font-bold' : 'text-slate-500'}>
                        {isUnlocked ? '✓ Unlocked' : 'Locked'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

