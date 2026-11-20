// Turns a project's plan-day anchors into real dates from the live schedule.
// Dates move automatically when days are skipped, paused or rescheduled.
import { addStudyDays } from './dateUtils';

/**
 * @returns {{
 *   startDate: string, endDate: string, startLabel: string, endLabel: string,
 *   milestones: Array<object>, status: 'completed'|'upcoming'|'in_progress'|'due_today'|'overdue',
 *   daysLeft: number|null
 * }}
 */
export function getProjectSchedule(project, days, today, isCompleted = false) {
  const byDay = new Map(days.map((d) => [d.day, d]));
  const lastDay = days[days.length - 1];

  let startDate;
  let endDate;
  let startLabel;
  let endLabel;

  if (project.afterPlan) {
    startDate = addStudyDays(lastDay.date, 1, true);
    endDate = addStudyDays(lastDay.date, project.afterPlan.studyDays, true);
    startLabel = `After Day ${lastDay.day}`;
    endLabel = `+${project.afterPlan.studyDays} study days`;
  } else {
    startDate = byDay.get(project.startDay)?.date;
    endDate = byDay.get(project.endDay)?.date;
    startLabel = `Day ${project.startDay}`;
    endLabel = `Day ${project.endDay}`;
  }

  const milestones = (project.milestones || []).map((m) => {
    if (m.afterPlanDay) {
      return {
        ...m,
        date: addStudyDays(lastDay.date, m.afterPlanDay, true),
        label: `Day ${lastDay.day} + ${m.afterPlanDay}`
      };
    }
    const d = byDay.get(m.day);
    return { ...m, date: d?.date, label: `Day ${m.day}`, lectureTitle: d?.title, lectureDone: !!d?.completed };
  });

  let status;
  if (isCompleted) status = 'completed';
  else if (!startDate || today < startDate) status = 'upcoming';
  else if (today > endDate) status = 'overdue';
  else if (today === endDate) status = 'due_today';
  else status = 'in_progress';

  const daysLeft = endDate ? Math.round((new Date(endDate + 'T12:00:00') - new Date(today + 'T12:00:00')) / 86400000) : null;

  return { startDate, endDate, startLabel, endLabel, milestones, status, daysLeft };
}

/** The project milestone (if any) scheduled for a given plan day, for the Daily Planner. */
export function getProjectWorkForDay(projects, days, dayNumber) {
  const results = [];
  const lastDay = days[days.length - 1];
  projects.forEach((p) => {
    if (p.afterPlan) {
      if (dayNumber === lastDay.day) {
        results.push({ project: p, milestone: null, kind: 'next' });
      }
      return;
    }
    if (dayNumber < p.startDay || dayNumber > p.endDay) return;
    const milestone = (p.milestones || []).find((m) => m.day === dayNumber) || null;
    results.push({
      project: p,
      milestone,
      kind: dayNumber === p.startDay ? 'start' : dayNumber === p.endDay ? 'end' : 'ongoing'
    });
  });
  return results;
}
