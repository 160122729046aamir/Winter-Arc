// Date utilities for 90-Day Winter Arc Planner with Sunday Exclusion

// Parse YYYY-MM-DD safely into local Date without UTC midnight timezone offset bugs
export function parseLocalDate(dateStr) {
  if (!dateStr) return new Date();
  if (dateStr instanceof Date) return dateStr;
  const parts = String(dateStr).split('-').map(Number);
  if (parts.length === 3 && !isNaN(parts[0]) && !isNaN(parts[1]) && !isNaN(parts[2])) {
    return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0);
  }
  return new Date(dateStr);
}

export function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function formatShortDate(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateWithDay(dateStr) {
  if (!dateStr) return '';
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

export function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getTomorrowDateString() {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToDate(dateStr, daysToAdd) {
  const d = parseLocalDate(dateStr);
  d.setDate(d.getDate() + daysToAdd);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Add study days excluding Sundays (Rest Day)
 * dayIndex = 0 returns the start date (or Monday if start date is a Sunday)
 * dayIndex = 1 returns the next study day (skips Sunday if encountered)
 */
export function addStudyDays(startDateStr, dayIndex, excludeSundays = true) {
  if (!startDateStr) return '';
  const cur = parseLocalDate(startDateStr);

  // If initial start date lands on Sunday and Sundays are excluded, roll to Monday
  if (excludeSundays && cur.getDay() === 0) {
    cur.setDate(cur.getDate() + 1);
  }

  if (dayIndex >= 0) {
    let counted = 0;
    while (counted < dayIndex) {
      cur.setDate(cur.getDate() + 1);
      if (excludeSundays && cur.getDay() === 0) continue;
      counted++;
    }
  } else {
    let counted = 0;
    while (counted > dayIndex) {
      cur.setDate(cur.getDate() - 1);
      if (excludeSundays && cur.getDay() === 0) continue;
      counted--;
    }
  }

  const y = cur.getFullYear();
  const m = String(cur.getMonth() + 1).padStart(2, '0');
  const d = String(cur.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getDaysDifference(startDateStr, endDateStr) {
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);
  const diffTime = end.getTime() - start.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Calculate count of study days elapsed between two dates (excluding Sundays)
 */
export function getStudyDaysDifference(startDateStr, endDateStr, excludeSundays = true) {
  if (!startDateStr || !endDateStr) return 0;
  const start = parseLocalDate(startDateStr);
  const end = parseLocalDate(endDateStr);

  if (start.getTime() > end.getTime()) {
    let count = 0;
    const cur = new Date(start);
    while (cur.getTime() > end.getTime()) {
      cur.setDate(cur.getDate() - 1);
      if (excludeSundays && cur.getDay() === 0) continue;
      count--;
    }
    return count;
  }

  let count = 0;
  const cur = new Date(start);
  while (cur.getTime() < end.getTime()) {
    cur.setDate(cur.getDate() + 1);
    if (excludeSundays && cur.getDay() === 0) continue;
    count++;
  }
  return count;
}

// Calculate which day of the 90-day challenge corresponds to today with pause support & Sunday exclusion
export function calculateCurrentChallengeDay(
  startDateStr,
  totalDays = 90,
  totalPausedDays = 0,
  isPaused = false,
  frozenDay = null,
  excludeSundays = true
) {
  if (isPaused && frozenDay !== null && frozenDay !== undefined) {
    return frozenDay;
  }
  if (!startDateStr) return 1;
  const today = getTodayDateString();
  const rawDiff = getStudyDaysDifference(startDateStr, today, excludeSundays);
  // Subtract paused study days from elapsed study days
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
