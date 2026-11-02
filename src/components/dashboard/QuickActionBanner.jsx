import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Flame,
  ArrowRight,
  ShieldCheck,
  Calendar
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import Modal from '../common/Modal';

export default function QuickActionBanner() {
  const { stats, currentChallengeDay, moveMissedTasksToDay, rescheduleScheduleFromDay } = usePlanner();
  const navigate = useNavigate();
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState(false);

  const missedDays = stats.missedDays || [];
  const hasMissedDays = missedDays.length > 0;

  const handleQuickRecoverAll = () => {
    // Move tasks from all missed days into currentChallengeDay
    missedDays.forEach(d => {
      moveMissedTasksToDay(d.day, currentChallengeDay);
    });
    setIsRecoveryModalOpen(false);
  };

  const handleRescheduleFuture = () => {
    // Reschedule from first missed day
    if (missedDays.length > 0) {
      rescheduleScheduleFromDay(missedDays[0].day);
    }
    setIsRecoveryModalOpen(false);
  };

  if (hasMissedDays) {
    return (
      <>
        <div className="p-4 sm:p-5 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-lg bg-amber-500/20 text-amber-400 flex-shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-200">
                  Missed-Day Recovery System Active
                </h4>
                <span className="px-2 py-0.5 text-[11px] font-bold rounded-full bg-amber-500/20 text-amber-400">
                  {missedDays.length} {missedDays.length === 1 ? 'day' : 'days'} pending
                </span>
              </div>
              <p className="text-xs text-amber-300/80 mt-1 max-w-2xl leading-relaxed">
                You have {missedDays.length} incomplete days (Day {missedDays.map(d => d.day).join(', ')}).
                Don't worry — your Winter Arc is not broken. Use intelligent recovery mode to redistribute tasks or move them forward smoothly.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0 w-full md:w-auto">
            <button
              onClick={() => setIsRecoveryModalOpen(true)}
              className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20 transition-colors w-full md:w-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Launch Recovery Mode</span>
            </button>
          </div>
        </div>

        {/* Recovery Modal */}
        <Modal
          isOpen={isRecoveryModalOpen}
          onClose={() => setIsRecoveryModalOpen(false)}
          title="Intelligent Missed-Day Recovery"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Winter Arc is designed for relentless discipline without burnout. Select how you would like to handle your {missedDays.length} missed days:
            </p>

            <div className="space-y-3">
              {/* Option 1: Move to Today */}
              <div
                onClick={handleQuickRecoverAll}
                className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-indigo-500/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Option 1: Merge Pending Tasks into Today (Day {currentChallengeDay})
                  </h5>
                  <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    Recommended
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Automatically extracts pending videos & exercises from missed days and places them as a prioritized backlog on your Day {currentChallengeDay} planner without losing your streak.
                </p>
              </div>

              {/* Option 2: Shift Schedule Forward */}
              <div
                onClick={handleRescheduleFuture}
                className="p-4 rounded-lg bg-slate-800/60 border border-slate-700 hover:border-indigo-500/60 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between mb-1">
                  <h5 className="text-sm font-bold text-slate-100 group-hover:text-indigo-400 transition-colors flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cyan-400" />
                    Option 2: Shift Schedule Forward (Recalculate Dates)
                  </h5>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Recalculates your calendar timeline so that Day {missedDays[0].day} becomes your new starting point today, preserving your 60-day curriculum sequence.
                </p>
              </div>

              {/* Option 3: Jump into specific missed day */}
              <div className="p-4 rounded-lg bg-slate-800/60 border border-slate-700">
                <h5 className="text-sm font-bold text-slate-100 mb-2">
                  Option 3: Work on a specific missed day right now
                </h5>
                <div className="flex flex-wrap gap-2">
                  {missedDays.map(d => (
                    <button
                      key={d.day}
                      onClick={() => {
                        setIsRecoveryModalOpen(false);
                        navigate(`/daily-planner?day=${d.day}`);
                      }}
                      className="px-3 py-1.5 rounded-md bg-slate-900 border border-slate-700 text-xs font-mono text-amber-300 hover:border-amber-400 transition-colors"
                    >
                      Go to Day {d.day} &rarr;
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  // Normal state: Motivational streak banner
  return (
    <div className="p-4 sm:p-5 rounded-xl bg-gradient-to-r from-indigo-950/40 via-slate-900/60 to-cyan-950/40 border border-indigo-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      <div className="flex items-center gap-3.5">
        <div className="p-2.5 rounded-lg bg-indigo-500/20 text-indigo-400">
          <Sparkles className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-sm font-bold text-slate-100 flex items-center gap-2">
            Winter Arc Momentum Active
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              On Track
            </span>
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Consistency Score: <strong className="text-cyan-400">{stats.consistencyScore}%</strong>. Every single video watched and exercise solved compounds into backend mastery.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => navigate('/daily-planner')}
          className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
        >
          <span>Continue Today's Arc</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

