// Date utilities for 60-Day Winter Arc Planner

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr, daysToAdd) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDaysDifference(startDateStr, endDateStr) {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

// Calculate which day of the 60-day challenge corresponds to today with pause support
export function calculateCurrentChallengeDay(
  startDateStr,
  totalDays = 60,
  totalPausedDays = 0,
  isPaused = false,
  frozenDay = null
) {
  if (isPaused && frozenDay !== null && frozenDay !== undefined) {
    return frozenDay;
  }
  if (!startDateStr) return 1;
  const today = getTodayDateString();
  const rawDiff = getDaysDifference(startDateStr, today);
  // Subtract paused days from elapsed calendar days
  const activeElapsed = Math.max(0, rawDiff - (totalPausedDays || 0));
  const currentDay = activeElapsed + 1;
  if (currentDay < 1) return 1;
  if (currentDay > totalDays) return totalDays;
  return currentDay;
}

// Format seconds into MM:SS or HH:MM:SS
export function formatTimeSeconds(totalSeconds) {
  if (!totalSeconds || totalSeconds < 0) return '00:00';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Format minutes into human readable "X hrs Y mins"
export function formatMinutesHuman(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0m';
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h`;
  return `${mins}m`;
}

// Format days duration human readable
export function formatDurationDaysHuman(daysCount) {
  if (!daysCount || daysCount <= 0) return '0 days';
  if (daysCount === 1) return '1 day';
  return `${daysCount} days`;
}
