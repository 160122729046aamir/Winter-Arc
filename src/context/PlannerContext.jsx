import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { INITIAL_ROADMAP_DAYS } from '../data/roadmapData';
import { PLAYLISTS_DATA } from '../data/playlistsData';
import { BADGES_CATALOG } from '../data/badgesData';
import { QUESTION_BANK_BY_DAY } from '../data/questionBankData';
import {
  calculateCurrentChallengeDay,
  getTodayDateString,
  addDaysToDate,
  getDaysDifference
} from '../utils/dateUtils';
import {
  XP_VALUES,
  calculateLevel,
  evaluateBadges,
  calculateConsistencyScore
} from '../utils/gamificationUtils';
import {
  loadStoredState,
  saveStateToStorage,
  exportStateAsJSON,
  parseAndValidateImportJSON
} from '../utils/storageUtils';

const PlannerContext = createContext();

// Default initial state
const buildInitialState = () => {
  const today = getTodayDateString();
  return {
    days: INITIAL_ROADMAP_DAYS.map((day, idx) => ({
      ...day,
      date: addDaysToDate(today, idx),
      checkedVideos: {}, // { [videoId]: true }
      checkedExercises: {}, // { [index]: true }
      checkedRevision: {}, // { [index]: true }
      customTasks: [], // [ { id, title, completed } ]
      completed: false,
      completedAt: null,
      loggedStudyMinutes: 0,
      notes: ''
    })),
    playlists: PLAYLISTS_DATA,
    watchedVideosGlobal: {}, // { [videoId]: { watched: boolean, watchedAt: date } }
    studySessions: [], // [ { id, timestamp, durationMinutes, dayNumber, note, type } ]
    streak: {
      currentStreak: 0,
      longestStreak: 0,
      lastActiveDate: null,
      activeDatesList: []
    },
    // Journey Pause / Resume State
    journeyStatus: 'active', // 'active' | 'paused' | 'completed'
    pausedAt: null, // ISO string when paused
    frozenChallengeDay: null, // Current day frozen when paused
    totalPausedDays: 0, // Cumulative count of paused days
    pauseHistory: [], // [ { id, pauseDate, resumeDate, durationDays, reason } ]
    // Daily Question Bank Quiz State
    quizState: {}, // { [dayNumber]: { answers: { [qId]: { selectedOption, isCorrect, submittedAt } }, bookmarked: [qId], markedForReview: [qId], status: 'not_started' | 'in_progress' | 'completed', score: 0, completedAt: null } }
    xp: 0,
    unlockedBadges: [],
    recentCelebration: null,
    settings: {
      startDate: today,
      challengeDuration: 60,
      dailyTargetMinutes: 120,
      preferredStudyDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      recoveryModeEnabled: true,
      isQuizMandatoryForDayCompletion: false,
      userName: 'Backend Engineer'
    }
  };
};

export function PlannerProvider({ children }) {
  const [state, setState] = useState(() => {
    const defaultState = buildInitialState();
    return loadStoredState(defaultState);
  });

  // Save state on changes
  useEffect(() => {
    saveStateToStorage(state);
  }, [state]);

  // Current challenge day based on start date, paused days, and paused status
  const currentChallengeDay = useMemo(() => {
    return calculateCurrentChallengeDay(
      state.settings.startDate,
      state.settings.challengeDuration || 60,
      state.totalPausedDays || 0,
      state.journeyStatus === 'paused',
      state.frozenChallengeDay
    );
  }, [
    state.settings.startDate,
    state.settings.challengeDuration,
    state.totalPausedDays,
    state.journeyStatus,
    state.frozenChallengeDay
  ]);

  // Streak update helper (only updates when journey is active)
  const updateStreakOnActivity = useCallback((currentStreakState) => {
    if (state.journeyStatus === 'paused') {
      return currentStreakState; // Do not alter streak while journey is paused
    }

    const today = getTodayDateString();
    const lastActive = currentStreakState.lastActiveDate;
    const activeDates = new Set(currentStreakState.activeDatesList || []);

    if (lastActive === today) {
      return currentStreakState; // already logged activity today
    }

    activeDates.add(today);
    let newStreak = 1;

    if (lastActive) {
      const diff = getDaysDifference(lastActive, today);
      if (diff === 1) {
        newStreak = (currentStreakState.currentStreak || 0) + 1;
      } else if (diff === 0) {
        newStreak = currentStreakState.currentStreak || 1;
      } else {
        newStreak = 1; // broken streak
      }
    }

    const longestStreak = Math.max(newStreak, currentStreakState.longestStreak || 0);

    return {
      currentStreak: newStreak,
      longestStreak,
      lastActiveDate: today,
      activeDatesList: Array.from(activeDates)
    };
  }, [state.journeyStatus]);

  // Trigger confetti burst
  const triggerCelebration = useCallback((title, message) => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899']
      });
    } catch {
      // ignore in environments without canvas
    }
  }, []);

  // Check if day qualifies as completed
  const checkDayCompletion = useCallback((day, dayQuizState, isQuizMandatory) => {
    const totalVideos = day.videos?.length || 0;
    const watchedVideos = Object.keys(day.checkedVideos || {}).filter(k => day.checkedVideos[k]).length;
    const totalExercises = day.exercises?.length || 0;
    const checkedExercises = Object.keys(day.checkedExercises || {}).filter(k => day.checkedExercises[k]).length;
    const totalRevision = day.revision?.length || 0;
    const checkedRevision = Object.keys(day.checkedRevision || {}).filter(k => day.checkedRevision[k]).length;
    const totalCustom = day.customTasks?.length || 0;
    const checkedCustom = (day.customTasks || []).filter(t => t.completed).length;

    const totalTasks = totalVideos + totalExercises + totalRevision + totalCustom;
    const completedTasks = watchedVideos + checkedExercises + checkedRevision + checkedCustom;

    const areTasksDone = totalTasks > 0 && completedTasks >= totalTasks;

    if (isQuizMandatory) {
      const isQuizDone = dayQuizState?.status === 'completed';
      return areTasksDone && isQuizDone;
    }

    return areTasksDone;
  }, []);

  // PAUSE JOURNEY
  const pauseJourney = useCallback((reason = 'Personal commitments') => {
    setState(prev => {
      if (prev.journeyStatus === 'paused') return prev;
      const today = getTodayDateString();
      const currentDay = calculateCurrentChallengeDay(
        prev.settings.startDate,
        prev.settings.challengeDuration || 60,
        prev.totalPausedDays || 0,
        false
      );

      return {
        ...prev,
        journeyStatus: 'paused',
        pausedAt: today,
        frozenChallengeDay: currentDay,
        activePauseReason: reason
      };
    });
  }, []);

  // RESUME JOURNEY
  const resumeJourney = useCallback(() => {
    setState(prev => {
      if (prev.journeyStatus !== 'paused') return prev;
      const today = getTodayDateString();
      const pauseStart = prev.pausedAt || today;
      const daysInPause = Math.max(0, getDaysDifference(pauseStart, today));

      const newTotalPaused = (prev.totalPausedDays || 0) + daysInPause;
      const newHistoryItem = {
        id: 'pause_' + Date.now(),
        pauseDate: pauseStart,
        resumeDate: today,
        durationDays: daysInPause,
        reason: prev.activePauseReason || 'Personal break'
      };

      // Shift remaining scheduled day dates forward by daysInPause if paused >= 1 day
      let updatedDays = prev.days;
      if (daysInPause > 0 && prev.frozenChallengeDay) {
        updatedDays = prev.days.map(d => {
          if (d.day >= prev.frozenChallengeDay) {
            return {
              ...d,
              date: addDaysToDate(d.date, daysInPause)
            };
          }
          return d;
        });
      }

      // Preserve streak by setting lastActiveDate to yesterday so resuming today continues streak without penalty
      const preservedStreak = {
        ...prev.streak,
        lastActiveDate: addDaysToDate(today, -1)
      };

      return {
        ...prev,
        journeyStatus: 'active',
        pausedAt: null,
        frozenChallengeDay: null,
        activePauseReason: null,
        totalPausedDays: newTotalPaused,
        pauseHistory: [newHistoryItem, ...(prev.pauseHistory || [])],
        days: updatedDays,
        streak: preservedStreak
      };
    });
  }, []);

  // Toggle Video Watched in a Day
  const toggleVideoWatched = useCallback((dayNumber, videoId) => {
    setState(prev => {
      const today = getTodayDateString();
      const dayQuiz = prev.quizState?.[dayNumber];
      const isQuizMandatory = prev.settings.isQuizMandatoryForDayCompletion;

      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const currentChecked = d.checkedVideos?.[videoId] || false;
        const newChecked = !currentChecked;
        const updatedCheckedVideos = {
          ...(d.checkedVideos || {}),
          [videoId]: newChecked
        };
        const updatedDay = {
          ...d,
          checkedVideos: updatedCheckedVideos
        };
        const nowCompleted = checkDayCompletion(updatedDay, dayQuiz, isQuizMandatory);
        return {
          ...updatedDay,
          completed: nowCompleted,
          completedAt: nowCompleted ? (d.completedAt || today) : null
        };
      });

      const wasWatched = prev.watchedVideosGlobal?.[videoId]?.watched;
      const newWatched = !wasWatched;
      const updatedWatchedGlobal = {
        ...prev.watchedVideosGlobal,
        [videoId]: {
          watched: newWatched,
          watchedAt: newWatched ? today : null
        }
      };

      const xpChange = newWatched ? XP_VALUES.WATCH_VIDEO : -XP_VALUES.WATCH_VIDEO;
      const newXP = Math.max(0, (prev.xp || 0) + xpChange);
      const updatedStreak = newWatched ? updateStreakOnActivity(prev.streak) : prev.streak;

      if (newWatched) {
        triggerCelebration();
      }

      return {
        ...prev,
        days: updatedDays,
        watchedVideosGlobal: updatedWatchedGlobal,
        xp: newXP,
        streak: updatedStreak
      };
    });
  }, [checkDayCompletion, updateStreakOnActivity, triggerCelebration]);

  // Toggle Exercise
  const toggleExercise = useCallback((dayNumber, exerciseIdx) => {
    setState(prev => {
      const today = getTodayDateString();
      let earnedXP = false;
      const dayQuiz = prev.quizState?.[dayNumber];
      const isQuizMandatory = prev.settings.isQuizMandatoryForDayCompletion;

      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const currentVal = d.checkedExercises?.[exerciseIdx] || false;
        const newVal = !currentVal;
        if (newVal) earnedXP = true;
        const updatedExercises = {
          ...(d.checkedExercises || {}),
          [exerciseIdx]: newVal
        };
        const updatedDay = {
          ...d,
          checkedExercises: updatedExercises
        };
        const nowCompleted = checkDayCompletion(updatedDay, dayQuiz, isQuizMandatory);
        return {
          ...updatedDay,
          completed: nowCompleted,
          completedAt: nowCompleted ? (d.completedAt || today) : null
        };
      });

      const xpDelta = earnedXP ? XP_VALUES.COMPLETE_EXERCISE : -XP_VALUES.COMPLETE_EXERCISE;
      const newXP = Math.max(0, (prev.xp || 0) + xpDelta);
      const updatedStreak = earnedXP ? updateStreakOnActivity(prev.streak) : prev.streak;

      return {
        ...prev,
        days: updatedDays,
        xp: newXP,
        streak: updatedStreak
      };
    });
  }, [checkDayCompletion, updateStreakOnActivity]);

  // Toggle Revision item
  const toggleRevision = useCallback((dayNumber, revisionIdx) => {
    setState(prev => {
      const today = getTodayDateString();
      let earnedXP = false;
      const dayQuiz = prev.quizState?.[dayNumber];
      const isQuizMandatory = prev.settings.isQuizMandatoryForDayCompletion;

      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const currentVal = d.checkedRevision?.[revisionIdx] || false;
        const newVal = !currentVal;
        if (newVal) earnedXP = true;
        const updatedRevision = {
          ...(d.checkedRevision || {}),
          [revisionIdx]: newVal
        };
        const updatedDay = {
          ...d,
          checkedRevision: updatedRevision
        };
        const nowCompleted = checkDayCompletion(updatedDay, dayQuiz, isQuizMandatory);
        return {
          ...updatedDay,
          completed: nowCompleted,
          completedAt: nowCompleted ? (d.completedAt || today) : null
        };
      });

      const xpDelta = earnedXP ? XP_VALUES.COMPLETE_REVISION : -XP_VALUES.COMPLETE_REVISION;
      const newXP = Math.max(0, (prev.xp || 0) + xpDelta);
      const updatedStreak = earnedXP ? updateStreakOnActivity(prev.streak) : prev.streak;

      return {
        ...prev,
        days: updatedDays,
        xp: newXP,
        streak: updatedStreak
      };
    });
  }, [checkDayCompletion, updateStreakOnActivity]);

  // Add Custom Task to a Day
  const addCustomTask = useCallback((dayNumber, title) => {
    if (!title || !title.trim()) return;
    setState(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const newTask = {
          id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: title.trim(),
          completed: false,
          createdAt: new Date().toISOString()
        };
        return {
          ...d,
          customTasks: [...(d.customTasks || []), newTask]
        };
      });
      return { ...prev, days: updatedDays };
    });
  }, []);

  // Toggle Custom Task
  const toggleCustomTask = useCallback((dayNumber, taskId) => {
    setState(prev => {
      const today = getTodayDateString();
      let earnedXP = false;
      const dayQuiz = prev.quizState?.[dayNumber];
      const isQuizMandatory = prev.settings.isQuizMandatoryForDayCompletion;

      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const updatedTasks = (d.customTasks || []).map(t => {
          if (t.id === taskId) {
            const nextVal = !t.completed;
            if (nextVal) earnedXP = true;
            return { ...t, completed: nextVal };
          }
          return t;
        });
        const updatedDay = {
          ...d,
          customTasks: updatedTasks
        };
        const nowCompleted = checkDayCompletion(updatedDay, dayQuiz, isQuizMandatory);
        return {
          ...updatedDay,
          completed: nowCompleted,
          completedAt: nowCompleted ? (d.completedAt || today) : null
        };
      });

      const xpDelta = earnedXP ? XP_VALUES.COMPLETE_CUSTOM_TASK : -XP_VALUES.COMPLETE_CUSTOM_TASK;
      const newXP = Math.max(0, (prev.xp || 0) + xpDelta);
      const updatedStreak = earnedXP ? updateStreakOnActivity(prev.streak) : prev.streak;

      return {
        ...prev,
        days: updatedDays,
        xp: newXP,
        streak: updatedStreak
      };
    });
  }, [checkDayCompletion, updateStreakOnActivity]);

  // Delete Custom Task
  const deleteCustomTask = useCallback((dayNumber, taskId) => {
    setState(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        return {
          ...d,
          customTasks: (d.customTasks || []).filter(t => t.id !== taskId)
        };
      });
      return { ...prev, days: updatedDays };
    });
  }, []);

  // Update Day Notes
  const updateDayNotes = useCallback((dayNumber, notesText) => {
    setState(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        return { ...d, notes: notesText };
      });
      return { ...prev, days: updatedDays };
    });
  }, []);

  // QUIZ ACTIONS: Submit answer for a question
  const submitQuizAnswer = useCallback((dayNumber, difficulty, questionId, selectedOption, isCorrect, topic) => {
    setState(prev => {
      const currentDayQuiz = prev.quizState?.[dayNumber] || {
        answers: {},
        bookmarked: [],
        markedForReview: [],
        status: 'not_started',
        score: 0,
        completedAt: null
      };

      const prevAnswer = currentDayQuiz.answers?.[questionId];
      if (prevAnswer) {
        return prev; // Already answered
      }

      const today = getTodayDateString();
      const newAnswers = {
        ...currentDayQuiz.answers,
        [questionId]: {
          selectedOption,
          isCorrect,
          difficulty,
          topic,
          submittedAt: new Date().toISOString()
        }
      };

      // Check if all 25 questions are now answered
      const answeredCount = Object.keys(newAnswers).length;
      const isQuizNowComplete = answeredCount >= 25;
      const correctCount = Object.values(newAnswers).filter(a => a.isCorrect).length;
      const newStatus = isQuizNowComplete ? 'completed' : 'in_progress';

      // XP reward calculation
      let xpEarned = 0;
      if (isCorrect) {
        if (difficulty === 'basic') xpEarned = XP_VALUES.QUIZ_BASIC_CORRECT;
        else if (difficulty === 'medium') xpEarned = XP_VALUES.QUIZ_MEDIUM_CORRECT;
        else if (difficulty === 'hard') xpEarned = XP_VALUES.QUIZ_HARD_CORRECT;
      }
      if (isQuizNowComplete && currentDayQuiz.status !== 'completed') {
        xpEarned += XP_VALUES.QUIZ_DAILY_COMPLETION_BONUS;
        triggerCelebration();
      }

      const updatedQuizState = {
        ...prev.quizState,
        [dayNumber]: {
          ...currentDayQuiz,
          answers: newAnswers,
          status: newStatus,
          score: correctCount,
          completedAt: isQuizNowComplete ? (currentDayQuiz.completedAt || today) : null
        }
      };

      // Check if day completion is affected by quiz completion
      let updatedDays = prev.days;
      if (prev.settings.isQuizMandatoryForDayCompletion) {
        updatedDays = prev.days.map(d => {
          if (d.day !== dayNumber) return d;
          const nowDone = checkDayCompletion(d, updatedQuizState[dayNumber], true);
          return {
            ...d,
            completed: nowDone,
            completedAt: nowDone ? (d.completedAt || today) : null
          };
        });
      }

      const updatedStreak = updateStreakOnActivity(prev.streak);

      return {
        ...prev,
        quizState: updatedQuizState,
        days: updatedDays,
        xp: (prev.xp || 0) + xpEarned,
        streak: updatedStreak
      };
    });
  }, [checkDayCompletion, updateStreakOnActivity, triggerCelebration]);

  // Bookmark / Unbookmark a Question
  const toggleBookmarkQuestion = useCallback((dayNumber, questionId) => {
    setState(prev => {
      const currentDayQuiz = prev.quizState?.[dayNumber] || {
        answers: {},
        bookmarked: [],
        markedForReview: [],
        status: 'not_started',
        score: 0
      };
      const bookmarks = new Set(currentDayQuiz.bookmarked || []);
      if (bookmarks.has(questionId)) {
        bookmarks.delete(questionId);
      } else {
        bookmarks.add(questionId);
      }
      return {
        ...prev,
        quizState: {
          ...prev.quizState,
          [dayNumber]: {
            ...currentDayQuiz,
            bookmarked: Array.from(bookmarks)
          }
        }
      };
    });
  }, []);

  // Mark / Unmark Question for Review
  const toggleReviewQuestion = useCallback((dayNumber, questionId) => {
    setState(prev => {
      const currentDayQuiz = prev.quizState?.[dayNumber] || {
        answers: {},
        bookmarked: [],
        markedForReview: [],
        status: 'not_started',
        score: 0
      };
      const reviewSet = new Set(currentDayQuiz.markedForReview || []);
      if (reviewSet.has(questionId)) {
        reviewSet.delete(questionId);
      } else {
        reviewSet.add(questionId);
      }
      return {
        ...prev,
        quizState: {
          ...prev.quizState,
          [dayNumber]: {
            ...currentDayQuiz,
            markedForReview: Array.from(reviewSet)
          }
        }
      };
    });
  }, []);

  // Reset Quiz for a Day
  const resetDayQuiz = useCallback((dayNumber) => {
    setState(prev => {
      const updatedQuizState = { ...prev.quizState };
      delete updatedQuizState[dayNumber];
      return {
        ...prev,
        quizState: updatedQuizState
      };
    });
  }, []);

  // Mark an entire day as completed manually
  const markDayComplete = useCallback((dayNumber) => {
    setState(prev => {
      const today = getTodayDateString();
      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        const checkedEx = {};
        (d.exercises || []).forEach((_, idx) => { checkedEx[idx] = true; });
        const checkedRev = {};
        (d.revision || []).forEach((_, idx) => { checkedRev[idx] = true; });
        const checkedVid = {};
        (d.videos || []).forEach(v => { checkedVid[v.id] = true; });
        const customUpdated = (d.customTasks || []).map(t => ({ ...t, completed: true }));

        return {
          ...d,
          checkedExercises: checkedEx,
          checkedRevision: checkedRev,
          checkedVideos: checkedVid,
          customTasks: customUpdated,
          completed: true,
          completedAt: today
        };
      });

      const currentDayObj = prev.days.find(d => d.day === dayNumber);
      const updatedWatchedGlobal = { ...prev.watchedVideosGlobal };
      (currentDayObj?.videos || []).forEach(v => {
        updatedWatchedGlobal[v.id] = { watched: true, watchedAt: today };
      });

      const updatedStreak = updateStreakOnActivity(prev.streak);
      const newXP = (prev.xp || 0) + XP_VALUES.COMPLETE_DAY_BONUS;

      triggerCelebration();

      return {
        ...prev,
        days: updatedDays,
        watchedVideosGlobal: updatedWatchedGlobal,
        streak: updatedStreak,
        xp: newXP
      };
    });
  }, [updateStreakOnActivity, triggerCelebration]);

  // Mark day incomplete
  const markDayIncomplete = useCallback((dayNumber) => {
    setState(prev => {
      const updatedDays = prev.days.map(d => {
        if (d.day !== dayNumber) return d;
        return {
          ...d,
          completed: false,
          completedAt: null
        };
      });
      return { ...prev, days: updatedDays };
    });
  }, []);

  // Log study session
  const logStudyTime = useCallback((dayNumber, durationMinutes, sessionNote = '', type = 'pomodoro') => {
    if (!durationMinutes || durationMinutes <= 0) return;
    setState(prev => {
      const today = getTodayDateString();
      const newSession = {
        id: 'session_' + Date.now(),
        timestamp: new Date().toISOString(),
        date: today,
        durationMinutes,
        dayNumber: dayNumber || 1,
        note: sessionNote,
        type
      };

      const updatedDays = prev.days.map(d => {
        if (d.day === dayNumber) {
          return {
            ...d,
            loggedStudyMinutes: (d.loggedStudyMinutes || 0) + durationMinutes
          };
        }
        return d;
      });

      const xpEarned = Math.round(durationMinutes * 0.75) + XP_VALUES.POMODORO_SESSION;
      const updatedStreak = updateStreakOnActivity(prev.streak);

      return {
        ...prev,
        days: updatedDays,
        studySessions: [newSession, ...(prev.studySessions || [])],
        xp: (prev.xp || 0) + xpEarned,
        streak: updatedStreak
      };
    });
  }, [updateStreakOnActivity]);

  // Missed-Day Recovery
  const moveMissedTasksToDay = useCallback((fromDayNumber, toDayNumber) => {
    setState(prev => {
      const fromDay = prev.days.find(d => d.day === fromDayNumber);
      const toDay = prev.days.find(d => d.day === toDayNumber);
      if (!fromDay || !toDay) return prev;

      const pendingVideos = (fromDay.videos || []).filter(v => !fromDay.checkedVideos?.[v.id]);
      const pendingExercises = (fromDay.exercises || []).filter((_, idx) => !fromDay.checkedExercises?.[idx]);
      const pendingCustom = (fromDay.customTasks || []).filter(t => !t.completed);

      const newCustomTasks = [
        ...(toDay.customTasks || []),
        ...pendingVideos.map(v => ({
          id: 'moved_vid_' + v.id + '_' + Date.now(),
          title: `[Moved from Day ${fromDayNumber}] Video: ${v.title}`,
          completed: false,
          originalVideoId: v.id,
          createdAt: new Date().toISOString()
        })),
        ...pendingExercises.map(ex => ({
          id: 'moved_ex_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: `[Moved from Day ${fromDayNumber}] ${ex}`,
          completed: false,
          createdAt: new Date().toISOString()
        })),
        ...pendingCustom.map(c => ({
          ...c,
          id: 'moved_cust_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          title: `[Moved from Day ${fromDayNumber}] ${c.title}`
        }))
      ];

      const updatedDays = prev.days.map(d => {
        if (d.day === fromDayNumber) {
          return {
            ...d,
            recovered: true,
            notes: (d.notes || '') + `\n[Recovery System: Missed tasks transferred to Day ${toDayNumber}]`
          };
        }
        if (d.day === toDayNumber) {
          return {
            ...d,
            customTasks: newCustomTasks,
            targetMinutes: (d.targetMinutes || 90) + 30
          };
        }
        return d;
      });

      return {
        ...prev,
        days: updatedDays
      };
    });
  }, []);

  // Reschedule
  const rescheduleScheduleFromDay = useCallback((startDayNumber) => {
    setState(prev => {
      const today = getTodayDateString();
      const updatedDays = prev.days.map(d => {
        if (d.day >= startDayNumber) {
          const dayOffset = d.day - startDayNumber;
          return {
            ...d,
            date: addDaysToDate(today, dayOffset)
          };
        }
        return d;
      });
      return {
        ...prev,
        days: updatedDays
      };
    });
  }, []);

  // Playlist additions/edits
  const addCustomVideoToPlaylist = useCallback((playlistKey, videoObj) => {
    setState(prev => {
      const currentPl = prev.playlists?.[playlistKey];
      if (!currentPl) return prev;
      const newVideo = {
        id: videoObj.id || 'vid_' + Date.now(),
        title: videoObj.title,
        duration: videoObj.duration || '45:00',
        durationSeconds: videoObj.durationSeconds || 2700,
        thumbnail: videoObj.thumbnail || `https://i.ytimg.com/vi/${videoObj.id}/hqdefault.jpg`,
        url: videoObj.url || `https://www.youtube.com/watch?v=${videoObj.id}`,
        index: (currentPl.videos?.length || 0) + 1,
        playlistId: currentPl.id,
        playlistName: currentPl.title,
        isCustom: true
      };

      const updatedVideos = [...(currentPl.videos || []), newVideo];
      const updatedPlaylists = {
        ...prev.playlists,
        [playlistKey]: {
          ...currentPl,
          totalVideos: updatedVideos.length,
          videos: updatedVideos
        }
      };

      return {
        ...prev,
        playlists: updatedPlaylists
      };
    });
  }, []);

  const editVideoInPlaylist = useCallback((playlistKey, videoId, fields) => {
    setState(prev => {
      const currentPl = prev.playlists?.[playlistKey];
      if (!currentPl) return prev;
      const updatedVideos = (currentPl.videos || []).map(v => {
        if (v.id === videoId) return { ...v, ...fields };
        return v;
      });
      return {
        ...prev,
        playlists: {
          ...prev.playlists,
          [playlistKey]: { ...currentPl, videos: updatedVideos }
        }
      };
    });
  }, []);

  const deleteVideoFromPlaylist = useCallback((playlistKey, videoId) => {
    setState(prev => {
      const currentPl = prev.playlists?.[playlistKey];
      if (!currentPl) return prev;
      const updatedVideos = (currentPl.videos || []).filter(v => v.id !== videoId);
      return {
        ...prev,
        playlists: {
          ...prev.playlists,
          [playlistKey]: {
            ...currentPl,
            totalVideos: updatedVideos.length,
            videos: updatedVideos
          }
        }
      };
    });
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setState(prev => {
      const merged = { ...prev.settings, ...newSettings };
      let updatedDays = prev.days;
      if (newSettings.startDate && newSettings.startDate !== prev.settings.startDate) {
        updatedDays = prev.days.map((d, idx) => ({
          ...d,
          date: addDaysToDate(newSettings.startDate, idx)
        }));
      }
      return {
        ...prev,
        settings: merged,
        days: updatedDays
      };
    });
  }, []);

  const resetAllProgress = useCallback(() => {
    const fresh = buildInitialState();
    setState(fresh);
    saveStateToStorage(fresh);
  }, []);

  const exportBackup = useCallback(() => {
    exportStateAsJSON(state);
  }, [state]);

  const importBackup = useCallback((jsonString) => {
    const res = parseAndValidateImportJSON(jsonString);
    if (!res.success) {
      alert(`Import failed: ${res.error}`);
      return false;
    }
    setState(res.data);
    saveStateToStorage(res.data);
    alert('Progress restored successfully from backup!');
    return true;
  }, []);

  // COMPREHENSIVE STATS CALCULATION
  const stats = useMemo(() => {
    const totalDays = state.days.length;
    const completedDays = state.days.filter(d => d.completed);
    const completedDaysCount = completedDays.length;
    const overallCompletionPercent = totalDays > 0 ? Math.round((completedDaysCount / totalDays) * 100) : 0;

    // Phases
    const javaDays = state.days.filter(d => d.phaseId === 'phase-1');
    const javaCompletedDays = javaDays.filter(d => d.completed).length;
    const javaCompletionPercent = javaDays.length > 0 ? Math.round((javaCompletedDays / javaDays.length) * 100) : 0;

    const springDays = state.days.filter(d => d.phaseId === 'phase-2');
    const springCompletedDays = springDays.filter(d => d.completed).length;
    const springCompletionPercent = springDays.length > 0 ? Math.round((springCompletedDays / springDays.length) * 100) : 0;

    const revDays = state.days.filter(d => d.phaseId === 'phase-3');
    const revCompletedDays = revDays.filter(d => d.completed).length;
    const revCompletionPercent = revDays.length > 0 ? Math.round((revCompletedDays / revDays.length) * 100) : 0;

    // Videos
    const totalJavaVideos = state.playlists?.java?.videos?.length || 57;
    const totalSpringVideos = state.playlists?.spring?.videos?.length || 45;
    const totalVideos = totalJavaVideos + totalSpringVideos;

    let completedVideosCount = 0;
    Object.values(state.watchedVideosGlobal || {}).forEach(v => {
      if (v?.watched) completedVideosCount++;
    });
    const remainingVideosCount = Math.max(0, totalVideos - completedVideosCount);

    // Study Hours
    const totalLoggedStudyMinutes = state.days.reduce((acc, d) => acc + (d.loggedStudyMinutes || 0), 0);
    const sessionStudyMinutes = (state.studySessions || []).reduce((acc, s) => acc + (s.durationMinutes || 0), 0);
    const totalStudyMinutes = Math.max(totalLoggedStudyMinutes, sessionStudyMinutes);
    const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);

    // Tasks completed
    let totalCompletedTasksCount = completedVideosCount;
    state.days.forEach(d => {
      totalCompletedTasksCount += Object.keys(d.checkedExercises || {}).filter(k => d.checkedExercises[k]).length;
      totalCompletedTasksCount += Object.keys(d.checkedRevision || {}).filter(k => d.checkedRevision[k]).length;
      totalCompletedTasksCount += (d.customTasks || []).filter(t => t.completed).length;
    });

    // Missed Days (only if active, not paused)
    const missedDays = state.journeyStatus === 'paused'
      ? []
      : state.days.filter(d => d.day < currentChallengeDay && !d.completed && !d.recovered);

    // Consistency & Levels
    const consistencyScore = calculateConsistencyScore(completedDaysCount, currentChallengeDay);
    const levelInfo = calculateLevel(state.xp || 0);

    // QUESTION BANK & QUIZ ANALYTICS
    let totalQuestionsAttempted = 0;
    let totalQuestionsCorrect = 0;
    let totalQuestionsIncorrect = 0;
    let basicAttempted = 0, basicCorrect = 0;
    let mediumAttempted = 0, mediumCorrect = 0;
    let hardAttempted = 0, hardCorrect = 0;
    let completedQuizzesCount = 0;

    const topicStats = {}; // { [topic]: { attempted, correct, dayNumbers: Set } }

    Object.entries(state.quizState || {}).forEach(([dayStr, qData]) => {
      const dNum = parseInt(dayStr, 10);
      if (qData.status === 'completed') completedQuizzesCount++;

      Object.values(qData.answers || {}).forEach(ans => {
        totalQuestionsAttempted++;
        if (ans.isCorrect) totalQuestionsCorrect++;
        else totalQuestionsIncorrect++;

        if (ans.difficulty === 'basic') {
          basicAttempted++;
          if (ans.isCorrect) basicCorrect++;
        } else if (ans.difficulty === 'medium') {
          mediumAttempted++;
          if (ans.isCorrect) mediumCorrect++;
        } else if (ans.difficulty === 'hard') {
          hardAttempted++;
          if (ans.isCorrect) hardCorrect++;
        }

        // Track topic
        const topicName = ans.topic || 'General';
        if (!topicStats[topicName]) {
          topicStats[topicName] = { topic: topicName, attempted: 0, correct: 0, dayNumber: dNum };
        }
        topicStats[topicName].attempted++;
        if (ans.isCorrect) topicStats[topicName].correct++;
      });
    });

    const overallQuizAccuracy = totalQuestionsAttempted > 0
      ? Math.round((totalQuestionsCorrect / totalQuestionsAttempted) * 100)
      : 0;

    const basicAccuracy = basicAttempted > 0 ? Math.round((basicCorrect / basicAttempted) * 100) : 0;
    const mediumAccuracy = mediumAttempted > 0 ? Math.round((mediumCorrect / mediumAttempted) * 100) : 0;
    const hardAccuracy = hardAttempted > 0 ? Math.round((hardCorrect / hardAttempted) * 100) : 0;

    // Identify Weak Topics (accuracy < 70% or at least 1 incorrect answer)
    const weakTopics = Object.values(topicStats)
      .map(t => ({
        ...t,
        accuracy: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 100) : 100,
        incorrect: t.attempted - t.correct
      }))
      .filter(t => t.incorrect > 0 || t.accuracy < 70)
      .sort((a, b) => a.accuracy - b.accuracy || b.incorrect - a.incorrect);

    // Timeline days
    const totalCalendarDaysElapsed = getDaysDifference(state.settings.startDate, getTodayDateString()) + 1;
    const activeLearningDays = Math.max(1, totalCalendarDaysElapsed - (state.totalPausedDays || 0));

    return {
      totalDays,
      completedDaysCount,
      overallCompletionPercent,
      javaDaysCount: javaDays.length,
      javaCompletedDays,
      javaCompletionPercent,
      springDaysCount: springDays.length,
      springCompletedDays,
      springCompletionPercent,
      revDaysCount: revDays.length,
      revCompletedDays,
      revCompletionPercent,
      totalVideos,
      completedVideosCount,
      remainingVideosCount,
      totalStudyMinutes,
      totalStudyHours,
      totalCompletedTasksCount,
      currentStreak: state.streak?.currentStreak || 0,
      longestStreak: state.streak?.longestStreak || 0,
      missedDays,
      consistencyScore,
      levelInfo,
      isPhase1Completed: javaCompletedDays >= javaDays.length,
      isPhase2Completed: springCompletedDays >= springDays.length,
      isPhase3Completed: revCompletedDays >= revDays.length,
      // Quiz stats
      totalQuestionsAttempted,
      totalQuestionsCorrect,
      totalQuestionsIncorrect,
      overallQuizAccuracy,
      basicAccuracy,
      mediumAccuracy,
      hardAccuracy,
      completedQuizzesCount,
      weakTopics,
      topicStats,
      // Pause metrics
      journeyStatus: state.journeyStatus,
      isPaused: state.journeyStatus === 'paused',
      pausedAt: state.pausedAt,
      totalPausedDays: state.totalPausedDays || 0,
      pauseCyclesCount: (state.pauseHistory || []).length,
      pauseHistory: state.pauseHistory || [],
      totalCalendarDaysElapsed,
      activeLearningDays
    };
  }, [state, currentChallengeDay]);

  // Sync unlocked badges
  useEffect(() => {
    const earnedBadgeIds = evaluateBadges(stats);
    const alreadyUnlocked = new Set(state.unlockedBadges || []);
    let newlyUnlocked = false;

    earnedBadgeIds.forEach(id => {
      if (!alreadyUnlocked.has(id)) {
        alreadyUnlocked.add(id);
        newlyUnlocked = true;
      }
    });

    if (newlyUnlocked) {
      setState(prev => ({
        ...prev,
        unlockedBadges: Array.from(alreadyUnlocked)
      }));
      triggerCelebration();
    }
  }, [stats, state.unlockedBadges, triggerCelebration]);

  const value = {
    days: state.days,
    playlists: state.playlists,
    watchedVideosGlobal: state.watchedVideosGlobal,
    studySessions: state.studySessions,
    streak: state.streak,
    xp: state.xp,
    unlockedBadges: state.unlockedBadges,
    settings: state.settings,
    quizState: state.quizState,
    journeyStatus: state.journeyStatus,
    pausedAt: state.pausedAt,
    totalPausedDays: state.totalPausedDays || 0,
    pauseHistory: state.pauseHistory || [],
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
    moveMissedTasksToDay,
    rescheduleScheduleFromDay,
    addCustomVideoToPlaylist,
    editVideoInPlaylist,
    deleteVideoFromPlaylist,
    updateSettings,
    resetAllProgress,
    exportBackup,
    importBackup,
    triggerCelebration
  };

  return (
    <PlannerContext.Provider value={value}>
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  const context = useContext(PlannerContext);
  if (!context) {
    throw new Error('usePlanner must be used within a PlannerProvider');
  }
  return context;
}
