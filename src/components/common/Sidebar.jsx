import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  CalendarCheck,
  Target,
  PlaySquare,
  BarChart3,
  Timer,
  BookOpen,
  Trophy,
  Settings,
  Flame,
  ArrowRight,
  Server,
  Zap,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import ProgressBar from './ProgressBar';

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'My 60-Day Plan', path: '/plan', icon: Map },
  { name: 'Daily Planner', path: '/daily-planner', icon: CalendarCheck, highlight: true },
  { name: 'Weekly Sprints', path: '/sprints', icon: Target },
  { name: 'System Projects', path: '/projects', icon: Server, badge: 'Full Code' },
  { name: 'Playlists', path: '/playlists', icon: PlaySquare },
  { name: 'Analytics', path: '/analytics', icon: BarChart3 },
  { name: 'Study Timer', path: '/timer', icon: Timer },
  { name: 'Notes & Revision', path: '/notes', icon: BookOpen },
  { name: 'Achievements', path: '/achievements', icon: Trophy },
  { name: 'Settings', path: '/settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }) {
  const { stats, currentChallengeDay } = usePlanner();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden animate-fadeIn"
        />
      )}

      {/* Floating Apple Liquid Glass Sidebar */}
      <aside
        className={`fixed top-20 bottom-4 left-4 z-40 w-64 glass-thin rounded-2xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-[110%]'
        } flex flex-col justify-between overflow-hidden`}
      >
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {/* Challenge Progress Glass Widget */}
          <div className="p-3.5 mb-3 rounded-xl glass-ultra border border-white/10 shadow-sm">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-semibold text-slate-300 tracking-tight">Challenge Progress</span>
              <span className="font-bold text-cyan-400 font-mono">
                {stats.overallCompletionPercent}%
              </span>
            </div>
            <ProgressBar value={stats.overallCompletionPercent} size="sm" color="cyan" />
            <div className="flex justify-between items-center text-[11px] text-slate-400 mt-2 font-mono">
              <span>{stats.completedDaysCount} / 60 days</span>
              <span className="text-indigo-400 font-medium">Day {currentChallengeDay}</span>
            </div>
          </div>

          <div className="px-3 pt-2 pb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono">
              Navigation
            </span>
          </div>

          <nav className="space-y-1">
            {NAVIGATION_ITEMS.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold apple-press transition-all ${
                      isActive
                        ? 'bg-white/[0.12] text-white border border-white/20 shadow-sm shadow-black/20 font-bold backdrop-blur-md'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-white/[0.06] border border-transparent'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {item.badge && (
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                        {item.badge}
                      </span>
                    )}
                    {item.highlight && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
                    )}
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Floating Sidebar Footer: Apple Liquid Motto */}
        <div className="p-3.5 m-2.5 rounded-xl glass-ultra border border-white/10">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-xs font-bold text-slate-200 tracking-tight">Winter Arc Principle</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
            "Relentless daily discipline. Unbroken streaks. Master Java & Spring Boot."
          </p>
        </div>
      </aside>
    </>
  );
}
