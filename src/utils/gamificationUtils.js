import { XP_LEVELS, BADGES_CATALOG } from '../data/badgesData';

export const XP_VALUES = {
  WATCH_VIDEO: 30,
  COMPLETE_EXERCISE: 20,
  COMPLETE_REVISION: 15,
  COMPLETE_CUSTOM_TASK: 15,
  COMPLETE_DAY_BONUS: 75,
  POMODORO_SESSION: 25,
  SAVE_NOTE: 10,
  QUIZ_BASIC_CORRECT: 10,
  QUIZ_MEDIUM_CORRECT: 15,
  QUIZ_HARD_CORRECT: 25,
  QUIZ_DAILY_COMPLETION_BONUS: 50,
  PROJECT_COMPLETE: 250
};

const countTrue = (obj) => Object.values(obj || {}).filter(Boolean).length;

/**
 * XP is derived from progress rather than accumulated, so it can never drift:
 * un-checking a task, resetting a quiz, deleting a session or re-clicking
 * "Complete Day" all produce the correct total automatically.
 */
export function computeXP(state) {
  let xp = 0;

  Object.values(state.watchedVideosGlobal || {}).forEach((v) => {
    if (v?.watched) xp += XP_VALUES.WATCH_VIDEO;
  });

  (state.days || []).forEach((d) => {
    xp += countTrue(d.checkedExercises) * XP_VALUES.COMPLETE_EXERCISE;
    xp += countTrue(d.checkedRevision) * XP_VALUES.COMPLETE_REVISION;
    xp += (d.customTasks || []).filter((t) => t.completed).length * XP_VALUES.COMPLETE_CUSTOM_TASK;
    if (d.completed) xp += XP_VALUES.COMPLETE_DAY_BONUS;
  });

  Object.values(state.quizState || {}).forEach((q) => {
    Object.values(q?.answers || {}).forEach((a) => {
      if (!a?.isCorrect) return;
      if (a.difficulty === 'basic') xp += XP_VALUES.QUIZ_BASIC_CORRECT;
      else if (a.difficulty === 'medium') xp += XP_VALUES.QUIZ_MEDIUM_CORRECT;
      else if (a.difficulty === 'hard') xp += XP_VALUES.QUIZ_HARD_CORRECT;
    });
    if (q?.status === 'completed') xp += XP_VALUES.QUIZ_DAILY_COMPLETION_BONUS;
  });

  (state.studySessions || []).forEach((s) => {
    const mins = Number(s.durationMinutes) || 0;
    if (mins > 0) xp += Math.round(mins * 0.75) + XP_VALUES.POMODORO_SESSION;
  });

  Object.values(state.completedProjects || {}).forEach((done) => {
    if (done) xp += XP_VALUES.PROJECT_COMPLETE;
  });

  const unlocked = new Set(state.unlockedBadges || []);
  BADGES_CATALOG.forEach((b) => {
    if (unlocked.has(b.id)) xp += Number(b.xpReward) || 0;
  });

  return xp;
}

// Calculate level and progress to next level
export function calculateLevel(totalXP) {
  let currentLevel = XP_LEVELS[0];
  let nextLevel = XP_LEVELS[1] || null;

  for (let i = 0; i < XP_LEVELS.length; i++) {
    if (totalXP >= XP_LEVELS[i].minXP) {
      currentLevel = XP_LEVELS[i];
      nextLevel = XP_LEVELS[i + 1] || null;
    } else {
      break;
    }
  }

  let progress = 100;
  if (nextLevel) {
    const xpIntoLevel = totalXP - currentLevel.minXP;
    const xpNeededForLevel = nextLevel.minXP - currentLevel.minXP;
    progress = Math.min(100, Math.max(0, Math.round((xpIntoLevel / xpNeededForLevel) * 100)));
  }

  return {
    currentLevel: currentLevel.level,
    title: currentLevel.name,
    minXP: currentLevel.minXP,
    nextLevelMinXP: nextLevel ? nextLevel.minXP : currentLevel.minXP,
    nextTitle: nextLevel ? nextLevel.name : 'Max Level',
    progress,
    xpToNext: nextLevel ? Math.max(0, nextLevel.minXP - totalXP) : 0
  };
}

// Evaluate which badges are unlocked based on user stats
export function evaluateBadges(stats) {
  const unlocked = [];

  for (const badge of BADGES_CATALOG) {
    const req = badge.requirement;
    let isEarned = false;

    if (req.type === 'days_completed' && stats.completedDaysCount >= req.count) {
      isEarned = true;
    } else if (req.type === 'streak' && (stats.currentStreak >= req.count || stats.longestStreak >= req.count)) {
      isEarned = true;
    } else if (req.type === 'study_hours' && (stats.totalStudyMinutes / 60) >= req.hours) {
      isEarned = true;
    } else if (req.type === 'tasks_completed' && stats.totalCompletedTasksCount >= req.count) {
      isEarned = true;
    } else if (req.type === 'videos_watched' && stats.completedVideosCount >= req.count) {
      isEarned = true;
    } else if (req.type === 'phase_completed') {
      if (req.phase === 'phase-1' && stats.isPhase1Completed) isEarned = true;
      if (req.phase === 'phase-2' && stats.isPhase2Completed) isEarned = true;
      if (req.phase === 'phase-3' && stats.isPhase3Completed) isEarned = true;
    }

    if (isEarned) {
      unlocked.push(badge.id);
    }
  }

  return unlocked;
}

// Calculate consistency score (0 to 100) based on days on track vs elapsed active days
export function calculateConsistencyScore(completedDays, elapsedDays) {
  if (!elapsedDays || elapsedDays <= 0) return 100;
  const ratio = (completedDays / elapsedDays) * 100;
  return Math.min(100, Math.max(0, Math.round(ratio)));
}
