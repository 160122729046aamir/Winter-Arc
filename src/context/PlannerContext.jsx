import React, { createContext, useContext, useState, useEffect, useMemo, useCallback, useRef } from 'react';
import confetti from 'canvas-confetti';
import { showError, showSuccess, toast } from '../utils/alerts';
import { INITIAL_ROADMAP_DAYS } from '../data/roadmapData';
import { PLAYLISTS_DATA } from '../data/playlistsData';
import { BADGES_CATALOG } from '../data/badgesData';
import { getDayQuestionMeta } from '../data/questionBankData';
import {
  getTodayDateString,
  addDaysToDate,
  addStudyDays,
  getDaysDifference,
  getStudyDaysDifference,
  isStudyDate,
  setStudyWeekdays
} from '../utils/dateUtils';
import {
  calculateLevel,
  evaluateBadges,
  calculateConsistencyScore,
  computeXP
} from '../utils/gamificationUtils';
import {
  loadStoredState,
  saveStateToStorage,
  exportStateAsJSON,
  parseAndValidateImportJSON,
  hydrateState,
  FIXED_CHALLENGE_START_DATE,
  SCHEMA_VERSION
} from '../utils/storageUtils';

const PlannerContext = createContext();

const DEFAULT_STUDY_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------
const buildInitialState = () => {
  setStudyWeekdays(DEFAULT_STUDY_DAYS);
  const startDate = FIXED_CHALLENGE_START_DATE;
  return {
    schemaVersion: SCHEMA_VERSION,
    days: INITIAL_ROADMAP_DAYS.map((day, idx) => ({
      ...day,
      date: addStudyDays(startDate, idx, true),
      checkedVideos: {}, // { [videoId]: true }  (mirror of watchedVideosGlobal for this day's videos)
      checkedExercises: {}, // { [index]: true }
      checkedRevision: {}, // { [index]: true }
      customTasks: [], // [ { id, title, completed, originalVideoId? } ]
      completed: false,
      completedAt: null,
      loggedStudyMinutes: 0,
      notes: '',
      skipped: false, // passed over by "Move to Today" — shows up in Missed-Day Recovery
      recovered: false // pending tasks were transferred to another day
    })),
    playlists: PLAYLISTS_DATA,
    watchedVideosGlobal: {}, // { [videoId]: { watched, watchedAt } } — single source of truth
    studySessions: [], // [ { id, timestamp, date, durationMinutes, dayNumber, note, type } ]
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeDatesList: []
    },
    restDates: [], // dates that never break a streak (skipped days, paused days)
    completedProjects: {}, // { [projectId]: true }
    revisedDays: {}, // { [dayNumber]: true } (Notes & Revision)
    journeyStatus: 'active', // 'active' | 'paused'
    pausedAt: null,
    frozenChallengeDay: null,
    activePauseReason: null,
    totalPausedDays: 0, // study days spent paused
    pauseHistory: [],
    quizState: {},
    totalSkippedDays: 0,
    unlockedBadges: [],
    settings: {
      startDate,
      challengeDuration: INITIAL_ROADMAP_DAYS.length,
      dailyTargetMinutes: 120,
      preferredStudyDays: DEFAULT_STUDY_DAYS,
      autoRescheduleMissedDays: true,
      isQuizMandatoryForDayCompletion: false,
      userName: 'Backend Engineer'
    }
  };
};

// ---------------------------------------------------------------------------
// Pure helpers (operate on plain state; safe inside setState updaters)
// ---------------------------------------------------------------------------
const questionCountForDay = (dayNumber) => getDayQuestionMeta(dayNumber)?.total || 0;

export const getDayTaskProgress = (day) => {
  const videos = day.videos || [];
  const exercises = day.exercises || [];
  const revision = day.revision || [];
  const custom = day.customTasks || [];
  const total = videos.length + exercises.length + revision.length + custom.length;
  const done =
    videos.filter((v) => day.checkedVideos?.[v.id]).length +
    exercises.filter((_, i) => day.checkedExercises?.[i]).length +
    revision.filter((_, i) => day.checkedRevision?.[i]).length +
    custom.filter((t) => t.completed).length;
  return { total, done };
};

const isDayDone = (day, dayQuiz, quizMandatory) => {
  const { total, done } = getDayTaskProgress(day);
  const tasksDone = total > 0 && done >= total;
  // A day without a quiz can't be blocked by the "quiz required" setting
  if (!quizMandatory || questionCountForDay(day.day) === 0) return tasksDone;
  return tasksDone && dayQuiz?.status === 'completed';
};

const withCompletion = (day, state, today) => {
  const done = isDayDone(day, state.quizState?.[day.day], state.settings.isQuizMandatoryForDayCompletion);
  return {
    ...day,
    completed: done,
    completedAt: done ? (day.completedAt || today) : null,
    skipped: done ? false : day.skipped
  };
};

/** Set a video's watched flag everywhere it appears (global map + every day that lists it). */
const applyVideoWatched = (state, videoId, watched, today) => {
  const watchedVideosGlobal = {
    ...state.watchedVideosGlobal,
    [videoId]: { watched, watchedAt: watched ? today : null }
  };
  const next = { ...state, watchedVideosGlobal };
  next.days = state.days.map((d) => {
    const hasVideo = (d.videos || []).some((v) => v.id === videoId);
    const hasMovedTask = (d.customTasks || []).some((t) => t.originalVideoId === videoId);
    if (!hasVideo && !hasMovedTask) return d;
    const updated = {
      ...d,
      checkedVideos: hasVideo ? { ...(d.checkedVideos || {}), [videoId]: watched } : d.checkedVideos,
      customTasks: hasMovedTask
        ? d.customTasks.map((t) => (t.originalVideoId === videoId ? { ...t, completed: watched } : t))
        : d.customTasks
    };
    return withCompletion(updated, next, today);
  });
  return next;
};

const updateDay = (state, dayNumber, fn, today) => ({
  ...state,
  days: state.days.map((d) => (d.day === dayNumber ? withCompletion(fn(d), state, today) : d))
});

/** Is every date strictly between `fromDate` and `toDate` a rest/skip/pause day? */
const isGapNeutral = (fromDate, toDate, restSet, pausedAt) => {
  let cur = addDaysToDate(fromDate, 1);
  let guard = 0;
  while (cur < toDate && guard++ < 400) {
    const neutral = !isStudyDate(cur) || restSet.has(cur) || (pausedAt && cur >= pausedAt);
    if (!neutral) return false;
    cur = addDaysToDate(cur, 1);
  }
  return true;
};

const recordActivity = (state, today) => {
  if (state.journeyStatus === 'paused') return state.streak;
  const s = state.streak || {};
  if (s.lastActiveDate === today) return s;
  const restSet = new Set(state.restDates || []);
  const continues = s.lastActiveDate && isGapNeutral(s.lastActiveDate, today, restSet, null);
  const currentStreak = continues ? (s.currentStreak || 0) + 1 : 1;
  const activeDates = new Set(s.activeDatesList || []);
  activeDates.add(today);
  return {
    currentStreak,
    longestStreak: Math.max(currentStreak, s.longestStreak || 0),
    lastActiveDate: today,
    activeDatesList: Array.from(activeDates)
  };
};

/** Lay out days >= fromDayNumber consecutively on study days starting at anchorDate. */
const layOutFrom = (days, fromDayNumber, anchorDate) =>
  days.map((d) =>
    d.day >= fromDayNumber
      ? { ...d, date: addStudyDays(anchorDate, d.day - fromDayNumber, true) }
      : d
  );

/** Today's challenge day: the first day scheduled today or later. */
const deriveCurrentDay = (state, today) => {
  if (state.journeyStatus === 'paused' && state.frozenChallengeDay) return state.frozenChallengeDay;
  const days = state.days || [];
  const upcoming = days.find((d) => d.date && d.date >= today);
  return upcoming ? upcoming.day : (days[days.length - 1]?.day || 1);
};

const fireConfetti = () => {
  try {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
    });
  } catch {
    // canvas unavailable
  }
};

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------
export function PlannerProvider({ children }) {
  const [state, setState] = useState(() => loadStoredState(buildInitialState()));
  const [today, setToday] = useState(getTodayDateString);

  const stateRef = useRef(state);
  stateRef.current = state;
  const bulkReplaceRef = useRef(false);

  // Keep the study-day calendar in sync with settings
  setStudyWeekdays(state.settings.preferredStudyDays || DEFAULT_STUDY_DAYS);

  // Persist
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Notice midnight / returning to an open tab on a new day
  useEffect(() => {
    const check = () => {
      const t = getTodayDateString();
      setToday((prev) => (prev === t ? prev : t));
    };
    const id = setInterval(check, 60 * 1000);
    document.addEventListener('visibilitychange', check);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', check);
    };
  }, []);

  // Auto-reschedule: if the earliest unfinished day is scheduled in the past,
  // move it (and everything after it) so it starts today. Runs at most once per day.
  useEffect(() => {
    if (state.journeyStatus === 'paused') return;
    if (state.settings.autoRescheduleMissedDays === false) return;
    const firstOverdue = state.days.find((d) => !d.completed && !d.skipped && !d.recovered);
    if (!firstOverdue || !firstOverdue.date || firstOverdue.date >= today) return;
    const behind = getStudyDaysDifference(firstOverdue.date, today, true);
    setState((prev) => ({
      ...prev,
      days: layOutFrom(prev.days, firstOverdue.day, today),
      totalSkippedDays: (prev.totalSkippedDays || 0) + Math.max(0, behind)
    }));
  }, [state.days, state.journeyStatus, state.settings.autoRescheduleMissedDays, today]);

  const currentChallengeDay = useMemo(() => deriveCurrentDay(state, today), [state, today]);

  const triggerCelebration = useCallback((title, message) => {
    if (title) toast(title, { text: message || '', icon: 'success' });
    fireConfetti();
  }, []);

  // ---------------- Journey: pause / resume ----------------
  const pauseJourney = useCallback((reason = 'Personal commitments') => {
    setState((prev) => {
      if (prev.journeyStatus === 'paused') return prev;
      const t = getTodayDateString();
      return {
        ...prev,
        journeyStatus: 'paused',
        pausedAt: t,
        frozenChallengeDay: deriveCurrentDay(prev, t),
        activePauseReason: reason
      };
    });
  }, []);

  const resumeJourney = useCallback(() => {
    setState((prev) => {
      if (prev.journeyStatus !== 'paused') return prev;
      const t = getTodayDateString();
      const pauseStart = prev.pausedAt || t;
      const calendarDays = Math.max(0, getDaysDifference(pauseStart, t));
      const studyDaysPaused = Math.max(0, getStudyDaysDifference(pauseStart, t, true));

      // Every date from the pause start up to yesterday is neutral for the streak
      const rest = new Set(prev.restDates || []);
      for (let i = 0; i < calendarDays; i++) rest.add(addDaysToDate(pauseStart, i));

      // Shift the remaining curriculum so the first unfinished day (from where we froze) is today
      let days = prev.days;
      if (calendarDays > 0) {
        const fromDay = prev.frozenChallengeDay || 1;
        const firstOpen = prev.days.find((d) => d.day >= fromDay && !d.completed);
        if (firstOpen && firstOpen.date < t) days = layOutFrom(prev.days, firstOpen.day, t);
      }

      return {
        ...prev,
        journeyStatus: 'active',
        pausedAt: null,
        frozenChallengeDay: null,
        activePauseReason: null,
        totalPausedDays: (prev.totalPausedDays || 0) + studyDaysPaused,
        restDates: Array.from(rest),
        pauseHistory: [
          {
            id: 'pause_' + Date.now(),
            pauseDate: pauseStart,
            resumeDate: t,
            durationDays: calendarDays,
            reason: prev.activePauseReason || 'Personal break'
          },
          ...(prev.pauseHistory || [])
        ],
        days
      };
    });
  }, []);

  // ---------------- Tasks ----------------
  const toggleVideoWatched = useCallback((_dayNumber, videoId) => {
    const willWatch = !stateRef.current.watchedVideosGlobal?.[videoId]?.watched;
    setState((prev) => {
      const t = getTodayDateString();
      const watched = !prev.watchedVideosGlobal?.[videoId]?.watched;
      const next = applyVideoWatched(prev, videoId, watched, t);
      return watched ? { ...next, streak: recordActivity(prev, t) } : next;
    });
    if (willWatch) fireConfetti();
  }, []);

  const toggleExercise = useCallback((dayNumber, exerciseIdx) => {
    setState((prev) => {
      const t = getTodayDateString();
      let checking = false;
      const next = updateDay(prev, dayNumber, (d) => {
        checking = !d.checkedExercises?.[exerciseIdx];
        return { ...d, checkedExercises: { ...(d.checkedExercises || {}), [exerciseIdx]: checking } };
      }, t);
      return checking ? { ...next, streak: recordActivity(prev, t) } : next;
    });
  }, []);

  const toggleRevision = useCallback((dayNumber, revisionIdx) => {
    setState((prev) => {
      const t = getTodayDateString();
      let checking = false;
      const next = updateDay(prev, dayNumber, (d) => {
        checking = !d.checkedRevision?.[revisionIdx];
        return { ...d, checkedRevision: { ...(d.checkedRevision || {}), [revisionIdx]: checking } };
      }, t);
      return checking ? { ...next, streak: recordActivity(prev, t) } : next;
    });
  }, []);

  const addCustomTask = useCallback((dayNumber, title) => {
    if (!title || !title.trim()) return;
    setState((prev) => {
      const t = getTodayDateString();
      return updateDay(prev, dayNumber, (d) => ({
        ...d,
        customTasks: [
          ...(d.customTasks || []),
          {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            title: title.trim(),
            completed: false,
            createdAt: new Date().toISOString()
          }
        ]
      }), t);
    });
  }, []);

  const toggleCustomTask = useCallback((dayNumber, taskId) => {
    setState((prev) => {
      const t = getTodayDateString();
      const day = prev.days.find((d) => d.day === dayNumber);
      const task = day?.customTasks?.find((x) => x.id === taskId);
      if (!task) return prev;
      const checking = !task.completed;
      // A task moved from a missed day that represents a video keeps the video in sync
      const next = task.originalVideoId
        ? applyVideoWatched(prev, task.originalVideoId, checking, t)
        : updateDay(prev, dayNumber, (d) => ({
          ...d,
          customTasks: d.customTasks.map((x) => (x.id === taskId ? { ...x, completed: checking } : x))
        }), t);
      return checking ? { ...next, streak: recordActivity(prev, t) } : next;
    });
  }, []);

  const deleteCustomTask = useCallback((dayNumber, taskId) => {
    setState((prev) => updateDay(prev, dayNumber, (d) => ({
      ...d,
      customTasks: (d.customTasks || []).filter((x) => x.id !== taskId)
    }), getTodayDateString()));
  }, []);

  const updateDayNotes = useCallback((dayNumber, notesText) => {
    setState((prev) => ({
      ...prev,
      days: prev.days.map((d) => (d.day === dayNumber ? { ...d, notes: notesText } : d))
    }));
  }, []);

  const markDayComplete = useCallback((dayNumber) => {
    const snapshot = stateRef.current;
    const target = snapshot.days.find((d) => d.day === dayNumber);
    if (!target || target.completed) return;
    const quizBlocks = snapshot.settings.isQuizMandatoryForDayCompletion &&
      questionCountForDay(dayNumber) > 0 &&
      snapshot.quizState?.[dayNumber]?.status !== 'completed';
    if (quizBlocks) {
      toast('Finish the quiz to complete this day', {
        icon: 'info',
        text: 'All tasks are ticked. "Require quiz" is on in Settings.',
        timer: 4500
      });
    }
    setState((prev) => {
      const t = getTodayDateString();
      let next = prev;
      const day = prev.days.find((d) => d.day === dayNumber);
      if (!day || day.completed) return prev;
      (day.videos || []).forEach((v) => { next = applyVideoWatched(next, v.id, true, t); });
      next = {
        ...next,
        days: next.days.map((d) => {
          if (d.day !== dayNumber) return d;
          const checkedEx = {};
          (d.exercises || []).forEach((_, i) => { checkedEx[i] = true; });
          const checkedRev = {};
          (d.revision || []).forEach((_, i) => { checkedRev[i] = true; });
          return withCompletion({
            ...d,
            checkedExercises: checkedEx,
            checkedRevision: checkedRev,
            customTasks: (d.customTasks || []).map((x) => ({ ...x, completed: true }))
          }, next, t);
        })
      };
      return { ...next, streak: recordActivity(prev, t) };
    });
  }, []);

  /** Re-opens a day: clears its checklist so the day genuinely reads as not done. */
  const markDayIncomplete = useCallback((dayNumber) => {
    setState((prev) => {
      const t = getTodayDateString();
      const day = prev.days.find((d) => d.day === dayNumber);
      if (!day) return prev;
      let next = prev;
      (day.videos || []).forEach((v) => { next = applyVideoWatched(next, v.id, false, t); });
      return {
        ...next,
        days: next.days.map((d) => (d.day === dayNumber
          ? {
            ...d,
            checkedExercises: {},
            checkedRevision: {},
            customTasks: (d.customTasks || []).map((x) => ({ ...x, completed: false })),
            completed: false,
            completedAt: null
          }
          : d))
      };
    });
  }, []);

  // ---------------- Quiz ----------------
  const submitQuizAnswer = useCallback((dayNumber, difficulty, questionId, selectedOption, isCorrect, topic) => {
    setState((prev) => {
      const current = prev.quizState?.[dayNumber] || {
        answers: {}, bookmarked: [], markedForReview: [], status: 'not_started', score: 0, completedAt: null
      };
      if (current.answers?.[questionId]) return prev; // already answered

      const t = getTodayDateString();
      const answers = {
        ...current.answers,
        [questionId]: { selectedOption, isCorrect, difficulty, topic, submittedAt: new Date().toISOString() }
      };
      const total = questionCountForDay(dayNumber);
      const complete = total > 0 && Object.keys(answers).length >= total;
      const quizState = {
        ...prev.quizState,
        [dayNumber]: {
          ...current,
          answers,
          status: complete ? 'completed' : 'in_progress',
          score: Object.values(answers).filter((a) => a.isCorrect).length,
          completedAt: complete ? (current.completedAt || t) : null
        }
      };
      const withQuiz = { ...prev, quizState };
      const days = prev.days.map((d) => (d.day === dayNumber ? withCompletion(d, withQuiz, t) : d));
      return { ...withQuiz, days, streak: recordActivity(prev, t) };
    });
  }, []);

  const toggleQuizList = (key) => (dayNumber, questionId) => {
    setState((prev) => {
      const current = prev.quizState?.[dayNumber] || {
        answers: {}, bookmarked: [], markedForReview: [], status: 'not_started', score: 0
      };
      const set = new Set(current[key] || []);
      if (set.has(questionId)) set.delete(questionId); else set.add(questionId);
      return {
        ...prev,
        quizState: { ...prev.quizState, [dayNumber]: { ...current, [key]: Array.from(set) } }
      };
    });
  };
  const toggleBookmarkQuestion = useCallback(toggleQuizList('bookmarked'), []);
  const toggleReviewQuestion = useCallback(toggleQuizList('markedForReview'), []);

  const resetDayQuiz = useCallback((dayNumber) => {
    setState((prev) => {
      const t = getTodayDateString();
      const quizState = { ...prev.quizState };
      delete quizState[dayNumber];
      const next = { ...prev, quizState };
      // If the quiz was required for completion, the day re-opens
      if (prev.settings.isQuizMandatoryForDayCompletion) {
        next.days = prev.days.map((d) => (d.day === dayNumber ? withCompletion(d, next, t) : d));
      }
      return next;
    });
  }, []);

  // ---------------- Study time ----------------
  const logStudyTime = useCallback((dayNumber, durationMinutes, sessionNote = '', type = 'pomodoro') => {
    const mins = Math.round(Number(durationMinutes));
    if (!mins || mins <= 0) return;
    setState((prev) => {
      const t = getTodayDateString();
      const dNum = dayNumber || deriveCurrentDay(prev, t);
      return {
        ...prev,
        days: prev.days.map((d) => (d.day === dNum
          ? { ...d, loggedStudyMinutes: (d.loggedStudyMinutes || 0) + mins }
          : d)),
        studySessions: [
          {
            id: 'session_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
            timestamp: new Date().toISOString(),
            date: t,
            durationMinutes: mins,
            dayNumber: dNum,
            note: sessionNote,
            type
          },
          ...(prev.studySessions || [])
        ],
        streak: recordActivity(prev, t)
      };
    });
  }, []);

  const deleteStudySession = useCallback((sessionId) => {
    setState((prev) => {
      const session = (prev.studySessions || []).find((s) => s.id === sessionId);
      if (!session) return prev;
      return {
        ...prev,
        studySessions: prev.studySessions.filter((s) => s.id !== sessionId),
        days: prev.days.map((d) => (d.day === session.dayNumber
          ? { ...d, loggedStudyMinutes: Math.max(0, (d.loggedStudyMinutes || 0) - (session.durationMinutes || 0)) }
          : d))
      };
    });
  }, []);

  // ---------------- Scheduling & recovery ----------------
  const moveMissedTasksToDay = useCallback((fromDayNumber, toDayNumber) => {
    setState((prev) => {
      const fromDay = prev.days.find((d) => d.day === fromDayNumber);
      const toDay = prev.days.find((d) => d.day === toDayNumber);
      if (!fromDay || !toDay || fromDayNumber === toDayNumber) return prev;
      const t = getTodayDateString();
      const stamp = Date.now();
      const rid = () => Math.random().toString(36).slice(2, 6);

      const moved = [
        ...(fromDay.videos || [])
          .filter((v) => !prev.watchedVideosGlobal?.[v.id]?.watched)
          .map((v) => ({
            id: `moved_vid_${v.id}_${stamp}_${rid()}`,
            title: `[From Day ${fromDayNumber}] Watch: ${v.title}`,
            completed: false,
            originalVideoId: v.id,
            createdAt: new Date().toISOString()
          })),
        ...(fromDay.exercises || [])
          .filter((_, i) => !fromDay.checkedExercises?.[i])
          .map((ex) => ({
            id: `moved_ex_${stamp}_${rid()}`,
            title: `[From Day ${fromDayNumber}] ${ex}`,
            completed: false,
            createdAt: new Date().toISOString()
          })),
        ...(fromDay.customTasks || [])
          .filter((c) => !c.completed)
          .map((c) => ({ ...c, id: `moved_cust_${stamp}_${rid()}`, title: `[From Day ${fromDayNumber}] ${c.title}` }))
      ];

      const days = prev.days.map((d) => {
        if (d.day === fromDayNumber) {
          return {
            ...d,
            recovered: true,
            // keep only completed custom tasks on the original day; the rest moved
            customTasks: (d.customTasks || []).filter((c) => c.completed)
          };
        }
        if (d.day === toDayNumber) {
          const extra = moved.length > 0 ? 30 : 0;
          return withCompletion({
            ...d,
            customTasks: [...(d.customTasks || []), ...moved],
            extraMinutes: (d.extraMinutes || 0) + extra,
            targetMinutes: (d.targetMinutes || 90) + extra
          }, prev, t);
        }
        return d;
      });
      return { ...prev, days };
    });
  }, []);

  const rescheduleScheduleFromDay = useCallback((startDayNumber) => {
    setState((prev) => {
      const t = getTodayDateString();
      const days = layOutFrom(prev.days, startDayNumber, t).map((d) =>
        d.day >= startDayNumber ? { ...d, skipped: false, recovered: false } : d
      );
      return { ...prev, days };
    });
  }, []);

  /** Push a day (and everything after it) to the next study day. The skipped date never breaks the streak. */
  const skipAndMoveToNextDay = useCallback((dayNumber) => {
    setState((prev) => {
      const target = prev.days.find((d) => d.day === dayNumber);
      if (!target) return prev;
      const t = getTodayDateString();
      const anchor = target.date && target.date > t ? target.date : t;
      const nextDate = addStudyDays(anchor, 1, true);
      const rest = new Set(prev.restDates || []);
      if (anchor <= t) rest.add(anchor);
      return {
        ...prev,
        days: layOutFrom(prev.days, dayNumber, nextDate),
        totalSkippedDays: (prev.totalSkippedDays || 0) + 1,
        restDates: Array.from(rest)
      };
    });
  }, []);

  /**
   * Make `targetDayNumber` today's lecture. Later days follow line-wise.
   * Earlier unfinished days are flagged `skipped` so they appear in Missed-Day
   * Recovery instead of being auto-rescheduled back over the chosen day.
   */
  const moveDayToToday = useCallback((targetDayNumber) => {
    setState((prev) => {
      if (!prev.days.some((d) => d.day === targetDayNumber)) return prev;
      const t = getTodayDateString();
      const days = prev.days.map((d) => {
        const date = addStudyDays(t, d.day - targetDayNumber, true);
        if (d.day < targetDayNumber) return { ...d, date, skipped: !d.completed };
        return { ...d, date, skipped: false, recovered: false };
      });
      return {
        ...prev,
        days,
        journeyStatus: 'active',
        pausedAt: null,
        frozenChallengeDay: null,
        activePauseReason: null
      };
    });
  }, []);

  // ---------------- Projects ----------------
  const toggleProjectComplete = useCallback((projectId) => {
    const willComplete = !stateRef.current.completedProjects?.[projectId];
    setState((prev) => ({
      ...prev,
      completedProjects: { ...(prev.completedProjects || {}), [projectId]: !prev.completedProjects?.[projectId] }
    }));
    if (willComplete) triggerCelebration('Project completed!', '+250 XP');
  }, [triggerCelebration]);

  const toggleDayRevised = useCallback((dayNumber) => {
    setState((prev) => ({
      ...prev,
      revisedDays: { ...(prev.revisedDays || {}), [dayNumber]: !prev.revisedDays?.[dayNumber] }
    }));
  }, []);

  // ---------------- Playlists ----------------
  const addCustomVideoToPlaylist = useCallback((playlistKey, videoObj) => {
    setState((prev) => {
      const pl = prev.playlists?.[playlistKey];
      if (!pl) return prev;
      const id = videoObj.id || 'vid_' + Date.now();
      const videos = [
        ...(pl.videos || []),
        {
          id,
          title: videoObj.title,
          duration: videoObj.duration || '45:00',
          durationSeconds: videoObj.durationSeconds || 2700,
          thumbnail: videoObj.thumbnail || `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
          url: videoObj.url || `https://www.youtube.com/watch?v=${id}`,
          index: (pl.videos?.length || 0) + 1,
          playlistId: pl.id,
          playlistName: pl.title,
          isCustom: true
        }
      ];
      return { ...prev, playlists: { ...prev.playlists, [playlistKey]: { ...pl, totalVideos: videos.length, videos } } };
    });
  }, []);

  const editVideoInPlaylist = useCallback((playlistKey, videoId, fields) => {
    setState((prev) => {
      const pl = prev.playlists?.[playlistKey];
      if (!pl) return prev;
      const videos = (pl.videos || []).map((v) => (v.id === videoId ? { ...v, ...fields } : v));
      return { ...prev, playlists: { ...prev.playlists, [playlistKey]: { ...pl, videos } } };
    });
  }, []);

  const deleteVideoFromPlaylist = useCallback((playlistKey, videoId) => {
    setState((prev) => {
      const pl = prev.playlists?.[playlistKey];
      if (!pl) return prev;
      const videos = (pl.videos || []).filter((v) => v.id !== videoId);
      const watchedVideosGlobal = { ...prev.watchedVideosGlobal };
      delete watchedVideosGlobal[videoId];
      return {
        ...prev,
        watchedVideosGlobal,
        playlists: { ...prev.playlists, [playlistKey]: { ...pl, totalVideos: videos.length, videos } }
      };
    });
  }, []);

  // ---------------- Settings & data ----------------
  const updateSettings = useCallback((newSettings) => {
    setState((prev) => {
      const t = getTodayDateString();
      const settings = { ...prev.settings, ...newSettings };
      setStudyWeekdays(settings.preferredStudyDays || DEFAULT_STUDY_DAYS);
      let days = prev.days;

      const startChanged = newSettings.startDate && newSettings.startDate !== prev.settings.startDate;
      const studyDaysChanged = newSettings.preferredStudyDays &&
        [...newSettings.preferredStudyDays].sort().join() !== [...(prev.settings.preferredStudyDays || [])].sort().join();

      if (startChanged) {
        // Explicit new start date: lay the whole curriculum out from it
        days = days.map((d, idx) => ({ ...d, date: addStudyDays(settings.startDate, idx, true), skipped: false }));
      } else if (studyDaysChanged) {
        // New weekly pattern: re-lay the remaining (unfinished) part of the plan from today onwards
        const firstOpen = days.find((d) => !d.completed);
        if (firstOpen) days = layOutFrom(days, firstOpen.day, firstOpen.date > t ? firstOpen.date : t);
      }

      const next = { ...prev, settings, days };
      if (newSettings.isQuizMandatoryForDayCompletion !== undefined &&
        newSettings.isQuizMandatoryForDayCompletion !== prev.settings.isQuizMandatoryForDayCompletion) {
        next.days = next.days.map((d) => withCompletion(d, next, t));
      }
      return next;
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = buildInitialState();
    bulkReplaceRef.current = true;
    setState(fresh);
    saveStateToStorage(fresh);
  }, []);

  const exportBackup = useCallback(() => {
    exportStateAsJSON(stateRef.current);
  }, []);

  const importBackup = useCallback((jsonString) => {
    const res = parseAndValidateImportJSON(jsonString);
    if (!res.success) {
      showError('Import failed', res.error);
      return false;
    }
    const restored = hydrateState(res.state, buildInitialState());
    bulkReplaceRef.current = true;
    setState(restored);
    saveStateToStorage(restored);
    showSuccess('Backup restored', 'Your progress was restored from the backup file.');
    return true;
  }, []);

  // ---------------- Derived stats ----------------
  const xp = useMemo(() => computeXP(state), [state]);

  const stats = useMemo(() => {
    const days = state.days;
    const totalDays = days.length;
    const completedDaysCount = days.filter((d) => d.completed).length;
    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);

    const phase = (id) => {
      const list = days.filter((d) => d.phaseId === id);
      const done = list.filter((d) => d.completed).length;
      return { count: list.length, done, percent: pct(done, list.length) };
    };
    const p1 = phase('phase-1');
    const p2 = phase('phase-2');
    const p3 = phase('phase-3');

    const totalVideos = (state.playlists?.java?.videos?.length || 0) + (state.playlists?.spring?.videos?.length || 0);
    const completedVideosCount = Object.values(state.watchedVideosGlobal || {}).filter((v) => v?.watched).length;

    const totalStudyMinutes = (state.studySessions || []).reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);
    const todayStudyMinutes = (state.studySessions || [])
      .filter((s) => s.date === today)
      .reduce((acc, s) => acc + (Number(s.durationMinutes) || 0), 0);

    let totalCompletedTasksCount = completedVideosCount;
    days.forEach((d) => {
      totalCompletedTasksCount += Object.values(d.checkedExercises || {}).filter(Boolean).length;
      totalCompletedTasksCount += Object.values(d.checkedRevision || {}).filter(Boolean).length;
      totalCompletedTasksCount += (d.customTasks || []).filter((x) => x.completed && !x.originalVideoId).length;
    });

    // Missed days: scheduled in the past, not done, not already recovered.
    // With auto-reschedule on, only days deliberately passed over (Move to Today) qualify.
    const autoReschedule = state.settings.autoRescheduleMissedDays !== false;
    const missedDays = state.journeyStatus === 'paused'
      ? []
      : days.filter((d) => d.date < today && !d.completed && !d.recovered && (d.skipped || !autoReschedule));

    // Streak shown is live: it drops to 0 once a non-rest study day passes with no activity
    const s = state.streak || {};
    const restSet = new Set(state.restDates || []);
    const streakAlive = s.lastActiveDate && (
      s.lastActiveDate === today ||
      isGapNeutral(s.lastActiveDate, today, restSet, state.journeyStatus === 'paused' ? state.pausedAt : null)
    );
    const currentStreak = streakAlive ? (s.currentStreak || 0) : 0;

    const studyDaysElapsed = Math.max(1, getStudyDaysDifference(state.settings.startDate, today, true) + 1);
    // Consistency = days done on time vs days that have actually come due.
    // Today only counts once it's done, so the score never drops just because the day isn't over.
    const dueDays = days.filter((d) => (d.date && d.date < today) || d.completed).length;
    const consistencyScore = dueDays === 0 ? 100 : calculateConsistencyScore(completedDaysCount, dueDays);
    const levelInfo = calculateLevel(xp);

    // Quiz analytics
    let totalQuestionsAttempted = 0;
    let totalQuestionsCorrect = 0;
    const byDiff = { basic: [0, 0], medium: [0, 0], hard: [0, 0] };
    let completedQuizzesCount = 0;
    const topicStats = {};
    Object.entries(state.quizState || {}).forEach(([dayStr, q]) => {
      if (q?.status === 'completed') completedQuizzesCount++;
      Object.values(q?.answers || {}).forEach((a) => {
        totalQuestionsAttempted++;
        if (a.isCorrect) totalQuestionsCorrect++;
        if (byDiff[a.difficulty]) {
          byDiff[a.difficulty][0]++;
          if (a.isCorrect) byDiff[a.difficulty][1]++;
        }
        const topic = a.topic || 'General';
        if (!topicStats[topic]) topicStats[topic] = { topic, attempted: 0, correct: 0, dayNumber: parseInt(dayStr, 10) };
        topicStats[topic].attempted++;
        if (a.isCorrect) topicStats[topic].correct++;
      });
    });
    const weakTopics = Object.values(topicStats)
      .map((x) => ({
        ...x,
        accuracy: x.attempted > 0 ? Math.round((x.correct / x.attempted) * 100) : 100,
        incorrect: x.attempted - x.correct
      }))
      .filter((x) => x.incorrect > 0 || x.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect);

    const totalCalendarDaysElapsed = Math.max(1, getDaysDifference(state.settings.startDate, today) + 1);
    const activeLearningDays = Math.max(1, studyDaysElapsed - (state.totalPausedDays || 0));

    return {
      totalDays,
      completedDaysCount,
      overallCompletionPercent: pct(completedDaysCount, totalDays),
      javaDaysCount: p1.count,
      javaCompletedDays: p1.done,
      javaCompletionPercent: p1.percent,
      springDaysCount: p2.count,
      springCompletedDays: p2.done,
      springCompletionPercent: p2.percent,
      revDaysCount: p3.count,
      revCompletedDays: p3.done,
      revCompletionPercent: p3.percent,
      totalVideos,
      completedVideosCount,
      remainingVideosCount: Math.max(0, totalVideos - completedVideosCount),
      totalStudyMinutes,
      todayStudyMinutes,
      dailyTargetMinutes: state.settings.dailyTargetMinutes || 120,
      totalStudyHours: (totalStudyMinutes / 60).toFixed(1),
      totalCompletedTasksCount,
      currentStreak,
      longestStreak: s.longestStreak || 0,
      missedDays,
      consistencyScore,
      levelInfo,
      isPhase1Completed: p1.count > 0 && p1.done >= p1.count,
      isPhase2Completed: p2.count > 0 && p2.done >= p2.count,
      isPhase3Completed: p3.count > 0 && p3.done >= p3.count,
      totalQuestionsAttempted,
      totalQuestionsCorrect,
      totalQuestionsIncorrect: totalQuestionsAttempted - totalQuestionsCorrect,
      overallQuizAccuracy: pct(totalQuestionsCorrect, totalQuestionsAttempted),
      basicAccuracy: pct(byDiff.basic[1], byDiff.basic[0]),
      mediumAccuracy: pct(byDiff.medium[1], byDiff.medium[0]),
      hardAccuracy: pct(byDiff.hard[1], byDiff.hard[0]),
      completedQuizzesCount,
      weakTopics,
      topicStats,
      journeyStatus: state.journeyStatus,
      isPaused: state.journeyStatus === 'paused',
      pausedAt: state.pausedAt,
      totalPausedDays: state.totalPausedDays || 0,
      totalSkippedDays: state.totalSkippedDays || 0,
      pauseCyclesCount: (state.pauseHistory || []).length,
      pauseHistory: state.pauseHistory || [],
      totalCalendarDaysElapsed,
      activeLearningDays
    };
  }, [state, currentChallengeDay, today, xp]);

  // ---------------- Badges & celebrations (side effects live here, not in updaters) ----------------
  useEffect(() => {
    const earned = evaluateBadges(stats);
    const already = new Set(state.unlockedBadges || []);
    const fresh = earned.filter((id) => !already.has(id));
    if (fresh.length === 0) return;
    setState((prev) => ({
      ...prev,
      unlockedBadges: Array.from(new Set([...(prev.unlockedBadges || []), ...fresh]))
    }));
    const names = fresh.map((id) => BADGES_CATALOG.find((b) => b.id === id)?.name).filter(Boolean);
    triggerCelebration(
      names.length === 1 ? `Badge unlocked: ${names[0]}` : `${names.length} badges unlocked`,
      names.length > 1 ? names.join(', ') : ''
    );
  }, [stats, state.unlockedBadges, triggerCelebration]);

  const prevCounts = useRef({ days: stats.completedDaysCount, quizzes: stats.completedQuizzesCount });
  useEffect(() => {
    const prev = prevCounts.current;
    if (bulkReplaceRef.current) {
      // Import / reset replaced the whole state: resync counters without celebrating
      bulkReplaceRef.current = false;
    } else if (stats.completedDaysCount > prev.days) {
      triggerCelebration('Day complete!', 'Great work. Keep the streak alive.');
    } else if (stats.completedQuizzesCount > prev.quizzes) {
      triggerCelebration('Quiz complete!', 'All questions for the day answered.');
    }
    prevCounts.current = { days: stats.completedDaysCount, quizzes: stats.completedQuizzesCount };
  }, [stats.completedDaysCount, stats.completedQuizzesCount, triggerCelebration]);

  const value = {
    days: state.days,
    playlists: state.playlists,
    watchedVideosGlobal: state.watchedVideosGlobal,
    studySessions: state.studySessions,
    streak: { ...state.streak, currentStreak: stats.currentStreak },
    xp,
    unlockedBadges: state.unlockedBadges,
    completedProjects: state.completedProjects || {},
    revisedDays: state.revisedDays || {},
    settings: state.settings,
    quizState: state.quizState,
    journeyStatus: state.journeyStatus,
    pausedAt: state.pausedAt,
    totalPausedDays: state.totalPausedDays || 0,
    pauseHistory: state.pauseHistory || [],
    today,
    currentChallengeDay,
    stats,
    pauseJourney,
    resumeJourney,
    submitQuizAnswer,
    toggleBookmarkQuestion,
    toggleReviewQuestion,
    resetDayQuiz,
    toggleVideoWatched,
    toggleExercise,
    toggleRevision,
    toggleCustomTask,
    addCustomTask,
    deleteCustomTask,
    updateDayNotes,
    markDayComplete,
    markDayIncomplete,
    logStudyTime,
    deleteStudySession,
    moveMissedTasksToDay,
    rescheduleScheduleFromDay,
    skipAndMoveToNextDay,
    moveDayToToday,
    addCustomVideoToPlaylist,
    editVideoInPlaylist,
    deleteVideoFromPlaylist,
    toggleProjectComplete,
    toggleDayRevised,
    updateSettings,
    resetAllProgress,
    exportBackup,
    importBackup,
    triggerCelebration
  };

  return <PlannerContext.Provider value={value}>{children}</PlannerContext.Provider>;
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}
