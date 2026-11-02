import React, { useState, useRef } from 'react';
import {
  Settings,
  Calendar,
  Clock,
  User,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  PauseCircle,
  PlayCircle,
  HelpCircle,
  History
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { useTheme } from '../context/ThemeContext';
import Modal from '../components/common/Modal';
import PauseModal from '../components/common/PauseModal';
import { formatDate } from '../utils/dateUtils';

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function SettingsPage() {
  const {
    settings,
    updateSettings,
    exportBackup,
    importBackup,
    resetAllProgress,
    journeyStatus,
    resumeJourney,
    pauseHistory,
    totalPausedDays,
    triggerCelebration
  } = usePlanner();

  const { theme, toggleTheme } = useTheme();

  // Local form state
  const [formData, setFormData] = useState({
    userName: settings.userName || 'Backend Engineer',
    startDate: settings.startDate || new Date().toISOString().slice(0, 10),
    challengeDuration: settings.challengeDuration || 60,
    dailyTargetMinutes: settings.dailyTargetMinutes || 120,
    preferredStudyDays: settings.preferredStudyDays || DAYS_OF_WEEK,
    recoveryModeEnabled: settings.recoveryModeEnabled !== false,
    isQuizMandatoryForDayCompletion: settings.isQuizMandatoryForDayCompletion || false
  });

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);
  const fileInputRef = useRef(null);

  const handleToggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.preferredStudyDays.includes(day);
      const nextDays = exists
        ? prev.preferredStudyDays.filter((d) => d !== day)
        : [...prev.preferredStudyDays, day];
      return { ...prev, preferredStudyDays: nextDays };
    });
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateSettings(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === 'string') {
        importBackup(content);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetAllProgress();
    setIsResetModalOpen(false);
    alert('All progress has been reset to Day 1.');
  };

  const handleResume = () => {
    resumeJourney();
    triggerCelebration('Resumed!', 'Winter Arc journey reactivated!');
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-16 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100 tracking-tight flex items-center gap-2.5">
          <Settings className="w-8 h-8 text-indigo-400" />
          Challenge Settings & Journey Control
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Customize your challenge timeline, pause/resume your Winter Arc, configure daily quiz requirements, and manage backups.
        </p>
      </div>

      {/* FEATURE 2: Journey Pause & Resume Control Panel */}
      <div className="arc-card p-5 sm:p-6 space-y-4 border-indigo-500/30 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`w-2.5 h-2.5 rounded-full ${journeyStatus === 'paused' ? 'bg-amber-400' : 'bg-emerald-400 animate-pulse'}`} />
              <h3 className="text-base font-bold text-slate-100">
                Winter Arc Journey Status: <span className={journeyStatus === 'paused' ? 'text-amber-400' : 'text-emerald-400'}>
                  {journeyStatus === 'paused' ? 'PAUSED' : 'ACTIVE'}
                </span>
              </h3>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              Pause your challenge anytime for work, exams, or personal commitments. All tasks, quiz answers, study hours, and active streaks are safely frozen.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            {journeyStatus === 'active' ? (
              <button
                type="button"
                onClick={() => setIsPauseModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-amber-500/40 text-amber-300 text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
              >
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>Pause Entire Journey</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResume}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-500/20 transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                <span>Resume Journey Now</span>
              </button>
            )}
          </div>
        </div>

        {/* Pause History Summary */}
        {pauseHistory && pauseHistory.length > 0 && (
          <div className="pt-3 border-t border-slate-800/80 space-y-2">
            <span className="text-[11px] font-mono font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" /> Pause History ({totalPausedDays} total days paused):
            </span>
            <div className="space-y-1.5 max-h-32 overflow-y-auto">
              {pauseHistory.map((item) => (
                <div key={item.id} className="flex justify-between items-center text-xs p-2 rounded bg-slate-950 border border-slate-800 text-slate-300 font-mono">
                  <span>
                    Paused: {formatDate(item.pauseDate)} &rarr; Resumed: {formatDate(item.resumeDate)} ({item.durationDays}d)
                  </span>
                  <span className="text-slate-500 text-[11px]">{item.reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-6">
        {/* Profile Card */}
        <div className="arc-card p-5 sm:p-6 space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <User className="w-4 h-4 text-cyan-400" />
            Learner Profile
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Your Name / Handle
            </label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              className="w-full sm:w-80 p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Schedule & Quiz Rules Card */}
        <div className="arc-card p-5 sm:p-6 space-y-5">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-indigo-400" />
            Roadmap Timeline & Quiz Settings
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenge Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Changing this recalculates scheduled dates for all 60 days.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Challenge Duration (Days)
              </label>
              <input
                type="number"
                min="30"
                max="120"
                value={formData.challengeDuration}
                onChange={(e) => setFormData({ ...formData, challengeDuration: Number(e.target.value) })}
                className="w-full p-2.5 bg-slate-900 border border-slate-800 rounded-lg text-sm text-slate-100 focus:outline-none focus:border-indigo-500"
              />
              <p className="text-[11px] text-slate-500 mt-1">
                Standard Winter Arc: 60 days.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Daily Study Target (Minutes)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="45"
                max="240"
                step="15"
                value={formData.dailyTargetMinutes}
                onChange={(e) => setFormData({ ...formData, dailyTargetMinutes: Number(e.target.value) })}
                className="flex-1 accent-indigo-500"
              />
              <span className="text-sm font-mono font-bold text-indigo-400 w-24 text-right">
                {formData.dailyTargetMinutes} mins ({(formData.dailyTargetMinutes / 60).toFixed(1)}h)
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Preferred Study Days
            </label>
            <div className="flex flex-wrap gap-2">
              {DAYS_OF_WEEK.map((day) => {
                const isSelected = formData.preferredStudyDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEATURE 1: Mandatory Quiz Toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
                Require Daily 25-Question Quiz for Day Completion
              </p>
              <p className="text-[11px] text-slate-400">
                When enabled, a day will only be marked 100% complete once all 25 daily questions are answered.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.isQuizMandatoryForDayCompletion}
              onChange={(e) => setFormData({ ...formData, isQuizMandatoryForDayCompletion: e.target.checked })}
              className="custom-checkbox"
            />
          </div>

          {/* Recovery mode toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-lg bg-slate-900/60 border border-slate-800">
            <div>
              <p className="text-xs font-bold text-slate-200">
                Intelligent Missed-Day Recovery Mode
              </p>
              <p className="text-[11px] text-slate-400">
                Detects missed days and provides seamless task transfers without breaking challenge morale.
              </p>
            </div>
            <input
              type="checkbox"
              checked={formData.recoveryModeEnabled}
              onChange={(e) => setFormData({ ...formData, recoveryModeEnabled: e.target.checked })}
              className="custom-checkbox"
            />
          </div>
        </div>

        {/* Save Settings Button */}
        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>

          {savedSuccess && (
            <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
              <CheckCircle className="w-4 h-4" /> Settings updated successfully!
            </span>
          )}
        </div>
      </form>

      {/* Data Persistence & Backups Card */}
      <div className="arc-card p-5 sm:p-6 space-y-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          Data Persistence & JSON Backups
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed">
          Your progress, quiz submissions, study hours, and pause history are stored persistently in browser LocalStorage. Export a full JSON backup to save or transfer to another device.
        </p>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={exportBackup}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Export JSON Backup</span>
          </button>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-400" />
            <span>Import JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Danger Zone: Reset Progress */}
      <div className="arc-card p-5 sm:p-6 border-rose-500/30 bg-rose-950/5">
        <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          Danger Zone
        </h3>
        <p className="text-xs text-slate-400 mt-1">
          Resetting will clear all completed checkboxes, quiz progress, notes, and study logs, returning to Day 1.
        </p>

        <div className="mt-4">
          <button
            type="button"
            onClick={() => setIsResetModalOpen(true)}
            className="px-4 py-2 rounded-lg bg-rose-600/20 border border-rose-500/40 text-rose-300 hover:bg-rose-600/30 text-xs font-bold transition-colors flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset All Challenge Progress</span>
          </button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        title="Confirm Challenge Reset"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-300 leading-relaxed">
            Are you sure you want to reset your 60-Day Winter Arc progress? This will reset your streaks, study logs, quiz submissions, completed tasks, and badges.
          </p>
          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              onClick={() => setIsResetModalOpen(false)}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReset}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold"
            >
              Yes, Reset Everything
            </button>
          </div>
        </div>
      </Modal>

      {/* Pause Confirmation Modal */}
      <PauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
      />
    </div>
  );
}
