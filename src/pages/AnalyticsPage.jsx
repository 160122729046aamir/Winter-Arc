import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  Clock,
  PlaySquare,
  CheckCircle2,
  Calendar,
  Layers,
  Flame,
  Award,
  HelpCircle,
  PauseCircle,
  AlertTriangle,
  RotateCcw,
  BookOpen
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import StatCard from '../components/dashboard/StatCard';
import ProgressBar from '../components/common/ProgressBar';
import { formatDate } from '../utils/dateUtils';

export default function AnalyticsPage() {
  const { days, currentChallengeDay, stats, studySessions, streak, quizState } = usePlanner();

  // 1. Daily Study Time & Planned vs Actual for last 14 days or current days
  const dailyStudyData = useMemo(() => {
    const start = Math.max(1, currentChallengeDay - 7);
    const end = Math.min(60, start + 13);
    const windowDays = days.filter((d) => d.day >= start && d.day <= end);

    return windowDays.map((d) => {
      const plannedHours = Number((d.targetMinutes / 60).toFixed(1));
      const actualHours = Number(((d.loggedStudyMinutes || (d.completed ? d.targetMinutes : 0)) / 60).toFixed(1));

      return {
        dayLabel: `Day ${d.day}`,
        day: d.day,
        planned: plannedHours,
        actual: actualHours,
        status: d.completed ? 'Completed' : 'Pending'
      };
    });
  }, [days, currentChallengeDay]);

  // 2. Weekly Study Time & Quiz Performance
  const weeklyData = useMemo(() => {
    const weeks = [];
    for (let w = 1; w <= 9; w++) {
      const wDays = days.filter((d) => d.week === w);
      const completed = wDays.filter((d) => d.completed).length;
      const total = wDays.length;

      // Quiz accuracy in this week
      let weekAttempted = 0;
      let weekCorrect = 0;
      wDays.forEach(d => {
        const qData = quizState?.[d.day];
        if (qData) {
          Object.values(qData.answers || {}).forEach(ans => {
            weekAttempted++;
            if (ans.isCorrect) weekCorrect++;
          });
        }
      });

      const weekQuizAccuracy = weekAttempted > 0 ? Math.round((weekCorrect / weekAttempted) * 100) : 0;

      weeks.push({
        name: `W${w}`,
        weekNumber: w,
        completionPercent: total > 0 ? Math.round((completed / total) * 100) : 0,
        quizAccuracy: weekQuizAccuracy,
        questionsAttempted: weekAttempted,
        completedDays: completed,
        totalDays: total
      });
    }
    return weeks;
  }, [days, quizState]);

  // 3. Java vs Spring Boot Completion Pie
  const courseComparisonData = useMemo(() => {
    return [
      { name: 'Core Java Completed', value: stats.javaCompletedDays, color: '#06b6d4' },
      { name: 'Core Java Remaining', value: Math.max(0, 25 - stats.javaCompletedDays), color: '#164e63' },
      { name: 'Spring Boot Completed', value: stats.springCompletedDays, color: '#6366f1' },
      { name: 'Spring Boot Remaining', value: Math.max(0, 30 - stats.springCompletedDays), color: '#312e81' },
    ];
  }, [stats]);

  // 4. Difficulty Accuracy Comparison Data
  const difficultyData = useMemo(() => {
    return [
      { name: 'Basic (10/day)', accuracy: stats.basicAccuracy, fill: '#06b6d4' },
      { name: 'Medium (10/day)', accuracy: stats.mediumAccuracy, fill: '#6366f1' },
      { name: 'Hard (5/day)', accuracy: stats.hardAccuracy, fill: '#f43f5e' }
    ];
  }, [stats]);

  // Average daily study time
  const avgDailyMinutes = stats.activeLearningDays > 0
    ? Math.round(stats.totalStudyMinutes / stats.activeLearningDays)
    : 0;

  // Custom Dark Tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900 border border-slate-800 p-3 rounded-lg shadow-xl text-xs font-mono">
          <p className="font-bold text-slate-200 mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color || entry.fill }} className="flex justify-between gap-4">
              <span>{entry.name}:</span>
              <span className="font-bold">{entry.value} {entry.unit || ''}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <BarChart3 className="w-8 h-8 text-indigo-400" />
          Analytics & Learning Metrics
        </h1>
        <p className="text-sm text-slate-400 mt-1 max-w-2xl">
          Visual insights into your learning velocity, daily quiz accuracy, topic mastery, and pause history.
        </p>
      </div>

      {/* Primary KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          title="Overall Arc Mastery"
          value={`${stats.overallCompletionPercent}%`}
          subtext={`${stats.completedDaysCount} of 60 days finished`}
          icon={TrendingUp}
          color="indigo"
        />
        <StatCard
          title="Quiz Accuracy"
          value={`${stats.overallQuizAccuracy}%`}
          subtext={`${stats.totalQuestionsCorrect} / ${stats.totalQuestionsAttempted} solved`}
          icon={HelpCircle}
          color="cyan"
        />
        <StatCard
          title="Total Focused Hours"
          value={`${stats.totalStudyHours}h`}
          subtext={`Avg ${avgDailyMinutes} mins / active day`}
          icon={Clock}
          color="emerald"
        />
        <StatCard
          title="Streak Records"
          value={`${stats.currentStreak}d`}
          subtext={`All-time best: ${stats.longestStreak} days`}
          icon={Flame}
          color="amber"
        />
      </div>

      {/* FEATURE 2 & 4: Journey Timeline & Pause/Resume Metrics Bar */}
      <div className="arc-card p-5 sm:p-6 bg-gradient-to-r from-slate-900/90 via-slate-900 to-indigo-950/20 border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              60-Day Journey Timeline & Schedule Control
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracks active learning days vs calendar days elapsed and pause cycles
            </p>
          </div>
          <span className={`px-2.5 py-1 rounded-md text-xs font-bold font-mono ${
            stats.isPaused ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300'
          }`}>
            Status: {stats.isPaused ? 'Paused' : 'Active Arc'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Active Learning Days</span>
            <span className="text-base font-bold text-cyan-400">{stats.activeLearningDays} Days</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Calendar Days Elapsed</span>
            <span className="text-base font-bold text-slate-200">{stats.totalCalendarDaysElapsed} Days</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Total Paused Days</span>
            <span className="text-base font-bold text-amber-400">{stats.totalPausedDays} Days</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase block">Pause/Resume Cycles</span>
            <span className="text-base font-bold text-indigo-400">{stats.pauseCyclesCount}</span>
          </div>

          <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 col-span-2 sm:col-span-1">
            <span className="text-[10px] text-slate-400 uppercase block">Avg Daily Study</span>
            <span className="text-base font-bold text-emerald-400">{avgDailyMinutes} mins</span>
          </div>
        </div>
      </div>

      {/* FEATURE 1 & 4: Daily Question Bank Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Difficulty Tier Accuracy Bar Chart */}
        <div className="arc-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Question Accuracy by Difficulty
              </h3>
              <p className="text-xs text-slate-400">
                10 Basic, 10 Medium, and 5 Hard questions per day
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-cyan-400">
              {stats.totalQuestionsAttempted} Total Attempted
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={difficultyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="accuracy" name="Accuracy Rate" radius={[6, 6, 0, 0]}>
                  {difficultyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Quiz Performance Trend */}
        <div className="arc-card p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100">
                Weekly Quiz Performance (%)
              </h3>
              <p className="text-xs text-slate-400">
                Average accuracy across each of the 9 weekly sprints
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-indigo-400">
              9 Sprints
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="%" domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="quizAccuracy" fill="#6366f1" name="Weekly Quiz Accuracy" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weak Topics Diagnostic Section */}
      <div className="arc-card p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Most Frequently Incorrect Topics
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {stats.weakTopics?.length || 0} Topics Identified
          </span>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Concepts where errors occurred during daily question bank quizzes. Focus your revision on these high-yield topics:
        </p>

        {stats.weakTopics && stats.weakTopics.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {stats.weakTopics.slice(0, 6).map((item) => (
              <div
                key={item.topic}
                className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800 flex items-center justify-between gap-3 font-mono text-xs"
              >
                <div>
                  <span className="font-bold text-slate-200 block truncate">{item.topic}</span>
                  <span className="text-[11px] text-slate-500">Day {item.dayNumber} • {item.incorrect} mistakes</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-rose-400">{item.accuracy}%</span>
                  <span className="text-[10px] text-slate-500 block">Accuracy</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-500 py-4 text-center italic">
            Complete daily quizzes to see topic-specific weakness analysis and recommendations.
          </p>
        )}
      </div>

      {/* Planned vs Actual Study Time (Daily) */}
      <div className="arc-card p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h3 className="text-base font-bold text-slate-100">
              Planned vs Actual Study Hours (Daily)
            </h3>
            <p className="text-xs text-slate-400">
              Comparing your daily study target against actual time logged
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-slate-400">
              <span className="w-3 h-3 rounded-sm bg-slate-600" /> Target Hours
            </span>
            <span className="flex items-center gap-1.5 text-indigo-400">
              <span className="w-3 h-3 rounded-sm bg-indigo-500" /> Actual Hours Logged
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyStudyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="dayLabel" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="h" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="planned" fill="#334155" name="Target (Hours)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="actual" fill="#6366f1" name="Actual (Hours)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
