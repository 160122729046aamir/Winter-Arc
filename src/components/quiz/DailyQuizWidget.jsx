import React, { useState, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  XCircle,
  Bookmark,
  BookmarkCheck,
  Flag,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Code2,
  Sparkles,
  ArrowRight,
  Award,
  AlertTriangle,
  BookOpen
} from 'lucide-react';
import { usePlanner } from '../../context/PlannerContext';
import { QUESTION_BANK_BY_DAY } from '../../data/questionBankData';
import ProgressBar from '../common/ProgressBar';

export default function DailyQuizWidget({ dayNumber, onGoToNotes }) {
  const {
    quizState,
    submitQuizAnswer,
    toggleBookmarkQuestion,
    toggleReviewQuestion,
    resetDayQuiz,
    days
  } = usePlanner();

  const [activeTab, setActiveTab] = useState('basic'); // 'basic' | 'medium' | 'hard'
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [showCodeSolution, setShowCodeSolution] = useState(false);
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'incorrect' | 'bookmarked' | 'review'

  const dayQuestionsData = QUESTION_BANK_BY_DAY[dayNumber] || {
    basic: [],
    medium: [],
    hard: []
  };

  const dayQuizState = quizState?.[dayNumber] || {
    answers: {},
    bookmarked: [],
    markedForReview: [],
    status: 'not_started',
    score: 0
  };

  const dayMeta = days.find((d) => d.day === dayNumber) || {
    title: 'Backend Mastery',
    topic: 'Core Backend'
  };

  // Questions in active difficulty tab
  const rawQuestionsInTab = dayQuestionsData[activeTab] || [];

  // Filter questions based on filterMode
  const activeQuestions = useMemo(() => {
    return rawQuestionsInTab.filter((q) => {
      const ans = dayQuizState.answers?.[q.id];
      if (filterMode === 'incorrect') {
        return ans && !ans.isCorrect;
      }
      if (filterMode === 'bookmarked') {
        return (dayQuizState.bookmarked || []).includes(q.id);
      }
      if (filterMode === 'review') {
        return (dayQuizState.markedForReview || []).includes(q.id);
      }
      return true;
    });
  }, [rawQuestionsInTab, filterMode, dayQuizState]);

  // Safe active question pointer
  const safeIndex = Math.min(currentQuestionIndex, Math.max(0, activeQuestions.length - 1));
  const currentQ = activeQuestions[safeIndex];

  // Answer for current question if previously submitted
  const existingAnswer = currentQ ? dayQuizState.answers?.[currentQ.id] : null;

  // Sync selected option when navigating
  const effectiveSelectedOption = existingAnswer
    ? existingAnswer.selectedOption
    : selectedOption;

  const isCurrentSubmitted = Boolean(existingAnswer || isAnswerSubmitted);

  // Stats across all 25 questions of the day
  const allDayQuestions = [
    ...(dayQuestionsData.basic || []),
    ...(dayQuestionsData.medium || []),
    ...(dayQuestionsData.hard || [])
  ];

  const totalQuestions = allDayQuestions.length || 25;
  const attemptedCount = Object.keys(dayQuizState.answers || {}).length;
  const correctCount = Object.values(dayQuizState.answers || {}).filter((a) => a.isCorrect).length;
  const incorrectCount = attemptedCount - correctCount;
  const remainingCount = Math.max(0, totalQuestions - attemptedCount);
  const overallAccuracy = attemptedCount > 0 ? Math.round((correctCount / attemptedCount) * 100) : 0;

  // Breakdown by tab
  const basicAttempted = (dayQuestionsData.basic || []).filter((q) => dayQuizState.answers?.[q.id]).length;
  const basicCorrect = (dayQuestionsData.basic || []).filter((q) => dayQuizState.answers?.[q.id]?.isCorrect).length;

  const mediumAttempted = (dayQuestionsData.medium || []).filter((q) => dayQuizState.answers?.[q.id]).length;
  const mediumCorrect = (dayQuestionsData.medium || []).filter((q) => dayQuizState.answers?.[q.id]?.isCorrect).length;

  const hardAttempted = (dayQuestionsData.hard || []).filter((q) => dayQuizState.answers?.[q.id]).length;
  const hardCorrect = (dayQuestionsData.hard || []).filter((q) => dayQuizState.answers?.[q.id]?.isCorrect).length;

  // Handling answer submission
  const handleSubmitAnswer = () => {
    if (selectedOption === null || !currentQ) return;
    const isCorrect = selectedOption === currentQ.correctAnswer;
    submitQuizAnswer(dayNumber, activeTab, currentQ.id, selectedOption, isCorrect, currentQ.topic);
    setIsAnswerSubmitted(true);
  };

  const handleNext = () => {
    if (safeIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(safeIndex + 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowCodeSolution(false);
    }
  };

  const handlePrev = () => {
    if (safeIndex > 0) {
      setCurrentQuestionIndex(safeIndex - 1);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setShowCodeSolution(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setShowCodeSolution(false);
    setFilterMode('all');
  };

  const handleReset = () => {
    if (confirm(`Reset all quiz answers for Day ${dayNumber}?`)) {
      resetDayQuiz(dayNumber);
      setSelectedOption(null);
      setIsAnswerSubmitted(false);
      setCurrentQuestionIndex(0);
    }
  };

  // Identify weak questions for this day's report
  const incorrectQuestionsForDay = allDayQuestions.filter(
    (q) => dayQuizState.answers?.[q.id] && !dayQuizState.answers[q.id].isCorrect
  );

  const isBookmarked = currentQ && (dayQuizState.bookmarked || []).includes(currentQ.id);
  const isMarkedReview = currentQ && (dayQuizState.markedForReview || []).includes(currentQ.id);

  return (
    <div className="arc-card p-5 sm:p-6 space-y-6">
      {/* Top Header: Quiz Info & Overall Metrics */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-bold rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
              DAY {dayNumber} QUESTION BANK
            </span>
            <span className="text-xs text-slate-400 font-mono">
              25 Curated Questions
            </span>
            {dayQuizState.status === 'completed' && (
              <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                Quiz Completed
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-100">
            {dayMeta.title}
          </h3>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-end md:self-center">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Reset Quiz Progress for this Day"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Quiz</span>
          </button>
        </div>
      </div>

      {/* Score and Stats Pill Row */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-center font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Attempted</span>
          <span className="text-sm font-bold text-cyan-400">{attemptedCount} / {totalQuestions}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Correct</span>
          <span className="text-sm font-bold text-emerald-400">{correctCount}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Incorrect</span>
          <span className="text-sm font-bold text-rose-400">{incorrectCount}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="text-[10px] text-slate-400 uppercase block">Remaining</span>
          <span className="text-sm font-bold text-amber-400">{remainingCount}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800 col-span-2 sm:col-span-1">
          <span className="text-[10px] text-slate-400 uppercase block">Current Score</span>
          <span className="text-sm font-bold text-indigo-400">{overallAccuracy}%</span>
        </div>
      </div>

      {/* Difficulty Tabs: Basic (10), Medium (10), Hard (5) */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('basic')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'basic'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Basic (10)</span>
            <span className="text-[10px] opacity-80 font-mono">
              {basicCorrect}/{basicAttempted}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('medium')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'medium'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Medium (10)</span>
            <span className="text-[10px] opacity-80 font-mono">
              {mediumCorrect}/{mediumAttempted}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('hard')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
              activeTab === 'hard'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            <span>Hard (5)</span>
            <span className="text-[10px] opacity-80 font-mono">
              {hardCorrect}/{hardAttempted}
            </span>
          </button>
        </div>

        {/* Filter within difficulty tab */}
        <div className="flex items-center gap-1.5 text-xs font-mono">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-2 py-1 rounded ${filterMode === 'all' ? 'bg-slate-800 text-white' : 'text-slate-500'}`}
          >
            All
          </button>
          <button
            onClick={() => setFilterMode('incorrect')}
            className={`px-2 py-1 rounded ${filterMode === 'incorrect' ? 'bg-rose-950 text-rose-300' : 'text-slate-500'}`}
          >
            Incorrect ({rawQuestionsInTab.filter(q => dayQuizState.answers?.[q.id] && !dayQuizState.answers[q.id].isCorrect).length})
          </button>
          <button
            onClick={() => setFilterMode('bookmarked')}
            className={`px-2 py-1 rounded ${filterMode === 'bookmarked' ? 'bg-indigo-950 text-indigo-300' : 'text-slate-500'}`}
          >
            Saved
          </button>
        </div>
      </div>

      {/* Main Single Question Display */}
      {currentQ ? (
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-5 animate-fadeIn">
          {/* Question Meta Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                Question {safeIndex + 1} of {activeQuestions.length}
              </span>
              <span className="text-cyan-400 font-medium">{currentQ.topic}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                currentQ.difficulty === 'basic' ? 'text-cyan-400 bg-cyan-950/40' : currentQ.difficulty === 'medium' ? 'text-indigo-400 bg-indigo-950/40' : 'text-rose-400 bg-rose-950/40'
              }`}>
                {currentQ.difficulty}
              </span>
            </div>

            {/* Bookmark & Review Toggles */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => toggleReviewQuestion(dayNumber, currentQ.id)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  isMarkedReview
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Mark for Review"
              >
                <Flag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Review</span>
              </button>

              <button
                onClick={() => toggleBookmarkQuestion(dayNumber, currentQ.id)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  isBookmarked
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Bookmark Question"
              >
                {isBookmarked ? <BookmarkCheck className="w-3.5 h-3.5" /> : <Bookmark className="w-3.5 h-3.5" />}
                <span className="hidden sm:inline">Bookmark</span>
              </button>
            </div>
          </div>

          {/* Question Text */}
          <div className="space-y-3">
            <h4 className="text-base font-semibold text-slate-100 leading-relaxed">
              {currentQ.question}
            </h4>

            {/* Code Snippet (if present) */}
            {currentQ.codeSnippet && (
              <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-300 overflow-x-auto leading-relaxed">
                <code>{currentQ.codeSnippet}</code>
              </pre>
            )}

            {/* Coding Challenge Starter (if code type) */}
            {currentQ.type === 'code' && currentQ.starterCode && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase block">Java Code Solution:</span>
                <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-cyan-300 overflow-x-auto leading-relaxed">
                  <code>{showCodeSolution ? currentQ.solutionCode : currentQ.starterCode}</code>
                </pre>
                <button
                  type="button"
                  onClick={() => setShowCodeSolution(!showCodeSolution)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-mono"
                >
                  {showCodeSolution ? 'Hide Model Solution' : 'Reveal Model Solution'}
                </button>
              </div>
            )}
          </div>

          {/* Options List */}
          <div className="space-y-2.5 pt-2">
            {currentQ.options.map((opt, idx) => {
              const isSelected = effectiveSelectedOption === idx;
              const isCorrectAnswer = currentQ.correctAnswer === idx;

              let optionStyle = 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200';

              if (isCurrentSubmitted) {
                if (isCorrectAnswer) {
                  optionStyle = 'bg-emerald-500/15 border-emerald-500/60 text-emerald-200 font-medium';
                } else if (isSelected && !isCorrectAnswer) {
                  optionStyle = 'bg-rose-500/15 border-rose-500/60 text-rose-200 line-through';
                } else {
                  optionStyle = 'bg-slate-900/30 border-slate-800/60 text-slate-500';
                }
              } else if (isSelected) {
                optionStyle = 'bg-indigo-600/20 border-indigo-500/70 text-indigo-200 ring-1 ring-indigo-500';
              }

              return (
                <div
                  key={idx}
                  onClick={() => {
                    if (!isCurrentSubmitted) setSelectedOption(idx);
                  }}
                  className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${optionStyle}`}
                >
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 bg-slate-800/80 text-slate-300">
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-xs sm:text-sm leading-relaxed flex-1">
                    {opt}
                  </span>
                  {isCurrentSubmitted && isCorrectAnswer && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  )}
                  {isCurrentSubmitted && isSelected && !isCorrectAnswer && (
                    <XCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Submit Answer Button */}
          {!isCurrentSubmitted && (
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={selectedOption === null}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                Submit Answer
              </button>
            </div>
          )}

          {/* Detailed Explanation & Feedback Box (Revealed after submission) */}
          {isCurrentSubmitted && (
            <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-3 animate-fadeIn">
              <div className="flex items-center gap-2">
                {effectiveSelectedOption === currentQ.correctAnswer ? (
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 font-mono">
                    <CheckCircle2 className="w-4 h-4" /> Correct Answer! (+XP Earned)
                  </span>
                ) : (
                  <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 font-mono">
                    <XCircle className="w-4 h-4" /> Incorrect
                  </span>
                )}
                <span className="text-xs text-slate-500 font-mono">• Concept: {currentQ.concept}</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-mono">
                {currentQ.explanation}
              </p>

              {currentQ.reference && (
                <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">Technical Reference:</span>
                  <a
                    href={currentQ.reference}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    <span>Official Guide / Baeldung</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Navigation Prev / Next */}
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={safeIndex <= 0}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>

            <span className="text-xs text-slate-500 font-mono">
              {safeIndex + 1} / {activeQuestions.length}
            </span>

            <button
              onClick={handleNext}
              disabled={safeIndex >= activeQuestions.length - 1}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 disabled:cursor-not-allowed text-xs font-semibold flex items-center gap-1 transition-colors"
            >
              Next <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <div className="arc-card p-12 text-center">
          <p className="text-slate-400 text-sm">No questions match your current filter.</p>
          <button
            onClick={() => setFilterMode('all')}
            className="mt-2 text-xs text-indigo-400 hover:underline"
          >
            Show all questions
          </button>
        </div>
      )}

      {/* Daily Performance & Weak Topic Analysis Report */}
      {attemptedCount > 0 && (
        <div className="p-5 rounded-xl bg-slate-900/40 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400" />
              Day {dayNumber} Quiz Performance Breakdown
            </h4>
            <span className="text-xs font-mono font-bold text-indigo-400">
              {correctCount} / {attemptedCount} Correct ({overallAccuracy}%)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-cyan-400 font-bold">Basic</span>
                <span>{basicCorrect} / 10 ({Math.round((basicCorrect / 10) * 100)}%)</span>
              </div>
              <ProgressBar value={(basicCorrect / 10) * 100} size="xs" color="cyan" />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-indigo-400 font-bold">Medium</span>
                <span>{mediumCorrect} / 10 ({Math.round((mediumCorrect / 10) * 100)}%)</span>
              </div>
              <ProgressBar value={(mediumCorrect / 10) * 100} size="xs" color="indigo" />
            </div>

            <div className="p-3 rounded-lg bg-slate-950 border border-slate-800">
              <div className="flex justify-between items-center mb-1">
                <span className="text-rose-400 font-bold">Hard</span>
                <span>{hardCorrect} / 5 ({Math.round((hardCorrect / 5) * 100)}%)</span>
              </div>
              <ProgressBar value={(hardCorrect / 5) * 100} size="xs" color="rose" />
            </div>
          </div>

          {/* List of Incorrect questions for targeted revision */}
          {incorrectQuestionsForDay.length > 0 && (
            <div className="pt-3 border-t border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-rose-400 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Questions Requiring Revision ({incorrectQuestionsForDay.length}):</span>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {incorrectQuestionsForDay.map((q) => (
                  <div key={q.id} className="p-2 rounded bg-slate-950 border border-slate-800 text-xs">
                    <p className="font-medium text-slate-200 truncate">{q.question}</p>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Correct Answer: <span className="text-emerald-400">{q.options[q.correctAnswer]}</span> • Topic: {q.topic}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-slate-400">
                  Recommended: Revisit Day {dayNumber} lecture & notes for weak topics.
                </span>
                {onGoToNotes && (
                  <button
                    onClick={onGoToNotes}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1 font-mono"
                  >
                    <BookOpen className="w-3.5 h-3.5" /> Open Day Notes &rarr;
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

