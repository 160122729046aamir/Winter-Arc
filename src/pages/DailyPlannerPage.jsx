import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  PlayCircle,
  ExternalLink,
  Code2,
  BookOpen,
  Plus,
  Trash2,
  Save,
  CheckCircle,
  Clock,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Play,
  HelpCircle,
  PauseCircle,
  PlaySquare,
  ArrowRight
} from 'lucide-react';
import { usePlanner } from '../context/PlannerContext';
import { formatDate, formatMinutesHuman } from '../utils/dateUtils';
import ProgressBar from '../components/common/ProgressBar';
import Modal from '../components/common/Modal';
import PauseModal from '../components/common/PauseModal';
import DailyQuizWidget from '../components/quiz/DailyQuizWidget';

export default function DailyPlannerPage() {
  const {
    days,
    currentChallengeDay,
    journeyStatus,
    quizState,
    toggleVideoWatched,
    toggleExercise,
    toggleRevision,
    toggleCustomTask,
    addCustomTask,
    deleteCustomTask,
    updateDayNotes,
    markDayComplete,
    markDayIncomplete,
    moveMissedTasksToDay
  } = usePlanner();

  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Selected Day: URL query param ?day=X or currentChallengeDay
  const paramDay = parseInt(searchParams.get('day'), 10);
  const activeDayNumber = !isNaN(paramDay) && paramDay >= 1 && paramDay <= 60
    ? paramDay
    : currentChallengeDay;

  const currentDay = days.find((d) => d.day === activeDayNumber) || days[0];

  // Notes state
  const [notes, setNotes] = useState(currentDay.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);

  // Custom task input
  const [newCustomTaskTitle, setNewCustomTaskTitle] = useState('');

  // Video embed player modal
  const [embedVideo, setEmbedVideo] = useState(null);

  // Pause modal state
  const [isPauseModalOpen, setIsPauseModalOpen] = useState(false);

  // Active section view tab: 'tasks' vs 'quiz'
  const [activePlannerTab, setActivePlannerTab] = useState('tasks');

  useEffect(() => {
    setNotes(currentDay.notes || '');
    setIsSavedNotes(false);
  }, [currentDay.day, currentDay.notes]);

  const handlePrevDay = () => {
    if (activeDayNumber > 1) {
      setSearchParams({ day: (activeDayNumber - 1).toString() });
    }
  };

  const handleNextDay = () => {
    if (activeDayNumber < 60) {
      setSearchParams({ day: (activeDayNumber + 1).toString() });
    }
  };

  const handleSelectDay = (e) => {
    setSearchParams({ day: e.target.value });
  };

  const handleSaveNotes = () => {
    updateDayNotes(currentDay.day, notes);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handleAddCustomTask = (e) => {
    e.preventDefault();
    if (!newCustomTaskTitle.trim()) return;
    addCustomTask(currentDay.day, newCustomTaskTitle.trim());
    setNewCustomTaskTitle('');
  };

  // Task calculation
  const totalVideos = currentDay.videos?.length || 0;
  const watchedVideos = Object.keys(currentDay.checkedVideos || {}).filter(k => currentDay.checkedVideos[k]).length;
  const totalExercises = currentDay.exercises?.length || 0;
  const checkedExercises = Object.keys(currentDay.checkedExercises || {}).filter(k => currentDay.checkedExercises[k]).length;
  const totalRevision = currentDay.revision?.length || 0;
  const checkedRevision = Object.keys(currentDay.checkedRevision || {}).filter(k => currentDay.checkedRevision[k]).length;
  const totalCustom = currentDay.customTasks?.length || 0;
  const checkedCustom = (currentDay.customTasks || []).filter(t => t.completed).length;

  const totalTasks = totalVideos + totalExercises + totalRevision + totalCustom;
  const completedTasks = watchedVideos + checkedExercises + checkedRevision + checkedCustom;
  const completionPercent = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const isToday = currentDay.day === currentChallengeDay;
  const isMissed = currentDay.day < currentChallengeDay && !currentDay.completed && !currentDay.recovered && journeyStatus !== 'paused';

  // Day Quiz status
  const dayQuiz = quizState?.[currentDay.day] || { status: 'not_started', answers: {} };
  const quizAnswersCount = Object.keys(dayQuiz.answers || {}).length;

  return (
    <div className="space-y-6 animate-fadeIn pb-16">
      {/* Day Navigation & Title Header */}
      <div className="arc-card p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Day Selector and arrows */}
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrevDay}
              disabled={activeDayNumber <= 1}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <select
                  value={activeDayNumber}
                  onChange={handleSelectDay}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1 text-sm font-bold font-mono text-cyan-400 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {days.map((d) => (
                    <option key={d.day} value={d.day}>
                      Day {d.day}: {d.title.slice(0, 32)}...
                    </option>
                  ))}
                </select>

                {isToday && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse">
                    Today
                  </span>
                )}
                {currentDay.completed && (
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    Day Completed
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                {formatDate(currentDay.date)} • {currentDay.phase}
              </p>
            </div>

            <button
              onClick={handleNextDay}
              disabled={activeDayNumber >= 60}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Action Buttons: Pause Journey & Day Completion */}
          <div className="flex flex-wrap items-center gap-3 self-end md:self-auto">
            {/* Pause Journey Button */}
            {journeyStatus === 'active' ? (
              <button
                onClick={() => setIsPauseModalOpen(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                title="Pause your 60-day challenge safely"
              >
                <PauseCircle className="w-4 h-4 text-amber-400" />
                <span>Pause Arc</span>
              </button>
            ) : (
              <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold font-mono">
                Arc Paused
              </span>
            )}

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-slate-400 uppercase">Daily Target</span>
              <p className="text-xs font-semibold text-slate-200">
                {formatMinutesHuman(currentDay.targetMinutes)}
              </p>
            </div>

            {currentDay.completed ? (
              <button
                onClick={() => markDayIncomplete(currentDay.day)}
                className="px-4 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/20 transition-colors flex items-center gap-2"
              >
                <CheckCircle className="w-4 h-4" /> Finished (Undo)
              </button>
            ) : (
              <button
                onClick={() => markDayComplete(currentDay.day)}
                className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 transition-colors"
              >
                <CheckCircle className="w-4 h-4" /> Complete Day
              </button>
            )}
          </div>
        </div>

        {/* Navigation Tabs between Learning Tasks and 25-Question Daily Quiz */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setActivePlannerTab('tasks')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activePlannerTab === 'tasks'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Learning Tasks & Exercises ({completedTasks}/{totalTasks})</span>
          </button>

          <button
            onClick={() => setActivePlannerTab('quiz')}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activePlannerTab === 'quiz'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Daily Question Bank (25 Qs)</span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
              dayQuiz.status === 'completed'
                ? 'bg-emerald-500/20 text-emerald-300'
                : quizAnswersCount > 0
                ? 'bg-cyan-500/20 text-cyan-300'
                : 'bg-slate-800 text-slate-400'
            }`}>
              {dayQuiz.status === 'completed' ? 'Completed' : `${quizAnswersCount}/25`}
            </span>
          </button>
        </div>

        {/* Progress Bar Header */}
        <div className="mt-4 pt-3 border-t border-slate-800/60">
          <div className="flex justify-between items-center text-xs mb-1.5">
            <span className="text-slate-400 font-medium">
              Daily Target Completion: <strong className="text-slate-200 font-mono">{completedTasks} / {totalTasks} tasks</strong>
            </span>
            <span className="font-mono font-bold text-cyan-400">
              {completionPercent}%
            </span>
          </div>
          <ProgressBar value={completionPercent} size="sm" color="cyan" />
        </div>
      </div>

      {/* Missed Day Recovery Banner if this day was missed */}
      {isMissed && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-amber-200">
                This day was missed from your schedule.
              </p>
              <p className="text-[11px] text-amber-300/80">
                You can finish the tasks here, or transfer unfinished tasks forward to today (Day {currentChallengeDay}).
              </p>
            </div>
          </div>
          <button
            onClick={() => moveMissedTasksToDay(currentDay.day, currentChallengeDay)}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-slate-950 text-xs font-bold hover:bg-amber-400 transition-colors whitespace-nowrap"
          >
            Move Tasks to Day {currentChallengeDay}
          </button>
        </div>
      )}

      {/* VIEW 1: 25-Question Daily Question Bank */}
      {activePlannerTab === 'quiz' ? (
        <DailyQuizWidget
          dayNumber={currentDay.day}
          onGoToNotes={() => setActivePlannerTab('tasks')}
        />
      ) : (
        /* VIEW 2: Traditional Tasks, Exercises, Notes */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Assigned Videos, Exercises, Revision & Custom Tasks */}
          <div className="lg:col-span-2 space-y-6">
            {/* Section 1: Assigned YouTube Videos */}
            <div className="arc-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <PlayCircle className="w-4 h-4 text-indigo-400" />
                  Assigned Lectures ({watchedVideos}/{totalVideos})
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {currentDay.playlistName}
                </span>
              </div>

              {totalVideos > 0 ? (
                <div className="space-y-3">
                  {currentDay.videos.map((vid) => {
                    const isWatched = currentDay.checkedVideos?.[vid.id];
                    return (
                      <div
                        key={vid.id}
                        className={`p-3.5 rounded-xl border transition-all ${
                          isWatched
                            ? 'bg-emerald-500/5 border-emerald-500/30'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          {/* Checkbox and Title */}
                          <div className="flex items-start gap-3 min-w-0">
                            <input
                              type="checkbox"
                              checked={!!isWatched}
                              onChange={() => toggleVideoWatched(currentDay.day, vid.id)}
                              className="custom-checkbox mt-0.5 flex-shrink-0"
                              id={`planner-vid-${vid.id}`}
                            />
                            <div className="min-w-0">
                              <label
                                htmlFor={`planner-vid-${vid.id}`}
                                className={`text-sm font-semibold cursor-pointer block leading-snug ${
                                  isWatched ? 'line-through text-slate-500' : 'text-slate-100 hover:text-indigo-300'
                                }`}
                              >
                                {vid.title}
                              </label>
                              <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                                <span className="flex items-center gap-1 text-amber-400 font-medium">
                                  <Clock className="w-3 h-3" /> {vid.duration}
                                </span>
                                <span>•</span>
                                <span>Coder Army Authentic Lecture</span>
                              </div>
                            </div>
                          </div>

                          {/* Player Buttons */}
                          <div className="flex items-center gap-2 self-end sm:self-center flex-shrink-0">
                            <button
                              onClick={() => setEmbedVideo(vid)}
                              className="px-2.5 py-1.5 rounded-md bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 hover:bg-indigo-600/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                              title="Play embedded in planner"
                            >
                              <Play className="w-3.5 h-3.5 fill-indigo-300" />
                              <span>Watch In-App</span>
                            </button>

                            <a
                              href={vid.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-md bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
                              title="Open directly on YouTube"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 italic">
                  No formal video lecture assigned for this day (designated for full coding, project build, or review).
                </p>
              )}
            </div>

            {/* Quick Question Bank Banner Shortcut */}
            <div
              onClick={() => setActivePlannerTab('quiz')}
              className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/40 to-indigo-950/40 border border-cyan-500/30 flex items-center justify-between cursor-pointer hover:border-cyan-500/60 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                    Day {currentDay.day} Question Bank Ready
                  </h4>
                  <p className="text-xs text-slate-400">
                    25 Topic Questions: 10 Basic • 10 Medium • 5 Hard. Test your understanding!
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 text-xs font-bold text-cyan-400">
                <span>Start Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>

            {/* Section 2: Practical Coding Exercises */}
            <div className="arc-card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Code2 className="w-4 h-4 text-cyan-400" />
                  Practical Coding Exercises ({checkedExercises}/{totalExercises})
                </h3>
              </div>

              {totalExercises > 0 ? (
                <div className="space-y-2.5">
                  {currentDay.exercises.map((exercise, idx) => {
                    const isChecked = currentDay.checkedExercises?.[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleExercise(currentDay.day, idx)}
                        className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                          isChecked
                            ? 'bg-slate-900/20 border-slate-800/50'
                            : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={() => {}}
                          className="custom-checkbox mt-0.5 flex-shrink-0 pointer-events-none"
                        />
                        <span
                          className={`text-xs sm:text-sm leading-relaxed ${
                            isChecked ? 'line-through text-slate-500' : 'text-slate-200'
                          }`}
                        >
                          {exercise}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-2 italic">
                  No predefined exercises. Focus on your capstone or video project.
                </p>
              )}
            </div>

            {/* Section 3: Revision Checklist */}
            {currentDay.revision && currentDay.revision.length > 0 && (
              <div className="arc-card p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                    <BookOpen className="w-4 h-4 text-amber-400" />
                    Key Revision Concepts ({checkedRevision}/{totalRevision})
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {currentDay.revision.map((revItem, idx) => {
                    const isChecked = currentDay.checkedRevision?.[idx];
                    return (
                      <div
                        key={idx}
                        onClick={() => toggleRevision(currentDay.day, idx)}
                        className={`flex items-center gap-2.5 p-2.5 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-slate-900/20 border-slate-800/40 text-slate-500 line-through'
                            : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={!!isChecked}
                          onChange={() => {}}
                          className="custom-checkbox flex-shrink-0 pointer-events-none"
                        />
                        <span className="text-xs font-medium">{revItem}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Section 4: Custom Tasks Manager */}
            <div className="arc-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider flex items-center gap-2 font-mono">
                  <Plus className="w-4 h-4 text-emerald-400" />
                  Personal Custom Tasks ({checkedCustom}/{totalCustom})
                </h3>
              </div>

              {/* Input form */}
              <form onSubmit={handleAddCustomTask} className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={newCustomTaskTitle}
                  onChange={(e) => setNewCustomTaskTitle(e.target.value)}
                  placeholder="Add your own task (e.g. Solve LeetCode #1, Read Spring docs, Debug GateKeeper)..."
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
                <button
                  type="submit"
                  className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors flex-shrink-0"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              {/* List */}
              <div className="space-y-2">
                {(currentDay.customTasks || []).map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/40 border border-slate-800 hover:border-slate-700"
                  >
                    <div
                      onClick={() => toggleCustomTask(currentDay.day, task.id)}
                      className="flex items-center gap-2.5 flex-1 cursor-pointer min-w-0"
                    >
                      <input
                        type="checkbox"
                        checked={!!task.completed}
                        onChange={() => {}}
                        className="custom-checkbox flex-shrink-0 pointer-events-none"
                      />
                      <span
                        className={`text-xs truncate ${
                          task.completed ? 'line-through text-slate-500' : 'text-slate-200'
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteCustomTask(currentDay.day, task.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition-colors ml-2"
                      title="Delete task"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}

                {(!currentDay.customTasks || currentDay.customTasks.length === 0) && (
                  <p className="text-xs text-slate-500 italic py-1">
                    No custom tasks yet. Add any additional goals above.
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Daily Notes & Time Logger */}
          <div className="space-y-6">
            {/* Notes Section */}
            <div className="arc-card p-5 flex flex-col h-[480px]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2 font-mono uppercase tracking-wider">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Day {currentDay.day} Learning Notes
                </h3>
                {isSavedNotes && (
                  <span className="text-xs text-emerald-400 font-semibold animate-pulse">
                    Saved!
                  </span>
                )}
              </div>

              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Jot down key takeaways, code snippets, syntax gotchas, or interview notes for this topic..."
                className="flex-1 w-full p-3 bg-slate-900/80 border border-slate-800 rounded-lg text-xs sm:text-sm text-slate-100 placeholder-slate-500 resize-none font-mono focus:outline-none focus:border-indigo-500 leading-relaxed transition-colors"
              />

              <div className="pt-3 border-t border-slate-800/80 mt-3 flex justify-between items-center">
                <span className="text-[11px] text-slate-500 font-mono">
                  {notes.length} characters
                </span>
                <button
                  onClick={handleSaveNotes}
                  className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Quick Study Session Banner */}
            <div className="arc-card p-5">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono mb-2">
                Focus Study Timer
              </h4>
              <p className="text-xs text-slate-400 mb-4 leading-relaxed">
                Track your focus sessions against Day {currentDay.day}. Completed sessions persist into analytics and earn XP.
              </p>
              <button
                onClick={() => navigate(`/timer?day=${currentDay.day}`)}
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                <span>Launch Timer for Day {currentDay.day}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* In-App YouTube Embed Modal */}
      <Modal
        isOpen={!!embedVideo}
        onClose={() => setEmbedVideo(null)}
        title={embedVideo?.title || 'YouTube Player'}
        maxWidth="max-w-4xl"
      >
        {embedVideo && (
          <div className="space-y-4">
            <div className="relative aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-800 shadow-xl">
              <iframe
                src={`https://www.youtube.com/embed/${embedVideo.id}?autoplay=1&rel=0`}
                title={embedVideo.title}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400 font-mono">Duration: {embedVideo.duration}</p>
                <p className="text-xs text-slate-500">Coder Army • {embedVideo.playlistName}</p>
              </div>
              <a
                href={embedVideo.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 flex items-center gap-1.5 transition-colors"
              >
                <ExternalLink className="w-4 h-4" /> Watch on YouTube
              </a>
            </div>
          </div>
        )}
      </Modal>

      {/* Pause Confirmation Modal */}
      <PauseModal
        isOpen={isPauseModalOpen}
        onClose={() => setIsPauseModalOpen(false)}
      />
    </div>
  );
}
