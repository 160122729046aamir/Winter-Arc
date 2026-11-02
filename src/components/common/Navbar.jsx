import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Flame,
  Award,
  Sun,
  Moon,
  Timer,
  Menu,
  X,
  PauseCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { useTheme } from '../../context/ThemeContext';

export default function Navbar({ onMobileMenuToggle, isMobileMenuOpen }) {
  const { currentChallengeDay, stats, xp, journeyStatus } = usePlanner();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 w-full glass-ultra border-b border-white/[0.08] transition-colors duration-300">
      <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Left: Mobile Toggle & Apple-styled Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="p-2 -ml-2 text-slate-400 hover:text-white rounded-xl apple-press lg:hidden"
            aria-label="Toggle navigation"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Link to="/" className="flex items-center gap-2.5 group apple-press">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 shadow-[0_0_24px_rgba(99,102,241,0.45)] border border-white/20 group-hover:scale-105 transition-transform duration-200">
              <Code2 className="w-5 h-5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-wider bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent font-sans">
                  WINTER ARC
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider glass-ultra border border-indigo-400/30 text-indigo-300 rounded-md">
                  Java & Spring
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden md:block tracking-tight">
                60 Days of Backend Engineering
              </p>
            </div>
          </Link>
        </div>

        {/* Right: Apple Glass Pills & Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Pause Status Indicator */}
          {journeyStatus === 'paused' && (
            <Link
              to="/"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold font-mono animate-pulse shadow-sm"
            >
              <PauseCircle className="w-3.5 h-3.5" />
              <span>PAUSED</span>
            </Link>
          )}

          {/* Challenge Day Glass Pill */}
          <Link
            to="/daily-planner"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass-ultra hover:bg-white/[0.08] transition-colors apple-press border border-white/10"
          >
            <span className={`w-2 h-2 rounded-full ${journeyStatus === 'paused' ? 'bg-amber-400' : 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'}`} />
            <span className="text-xs font-semibold text-slate-200">
              Day <span className="text-cyan-400 font-bold">{currentChallengeDay}</span>
              <span className="text-slate-500 hidden sm:inline"> / 60</span>
            </span>
          </Link>

          {/* Daily Streak Glass Pill */}
          <div
            title="Daily Active Streak"
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl glass-ultra border border-amber-500/25 text-amber-300 text-xs font-semibold"
          >
            <Flame className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{stats.currentStreak} <span className="hidden sm:inline">Days</span></span>
          </div>

          {/* Level & XP Glass Pill */}
          <Link
            to="/achievements"
            title={`Level ${stats.levelInfo.currentLevel}: ${stats.levelInfo.title}`}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl glass-ultra border border-indigo-500/25 text-indigo-200 text-xs font-semibold hover:bg-white/[0.08] transition-colors apple-press"
          >
            <Award className="w-3.5 h-3.5 text-indigo-400" />
            <span>Lvl {stats.levelInfo.currentLevel}</span>
            <span className="text-[11px] text-indigo-400/90 font-mono">({xp} XP)</span>
          </Link>

          {/* Study Timer Glass Pill */}
          <button
            onClick={() => navigate('/timer')}
            title="Open Pomodoro Study Timer"
            className="p-2 rounded-xl glass-ultra text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors apple-press border border-white/10"
          >
            <Timer className="w-4 h-4" />
          </button>

          {/* Theme Toggle Glass Pill */}
          <button
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-2 rounded-xl glass-ultra text-slate-400 hover:text-slate-100 hover:bg-white/[0.08] transition-colors apple-press border border-white/10"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>
        </div>
      </div>
    </header>
  );
}
