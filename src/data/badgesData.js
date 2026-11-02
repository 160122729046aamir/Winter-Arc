export const BADGES_CATALOG = [
  {
    id: 'first_step',
    name: 'Day 1 Commenced',
    description: 'Completed your very first task in the Winter Arc challenge',
    icon: 'Footprints',
    category: 'Milestone',
    xpReward: 50,
    requirement: { type: 'days_completed', count: 1 }
  },
  {
    id: 'week_1_conqueror',
    name: 'Week 1 Survivor',
    description: 'Crushed the first 7 days of intense Core Java training',
    icon: 'Flame',
    category: 'Milestone',
    xpReward: 150,
    requirement: { type: 'days_completed', count: 7 }
  },
  {
    id: 'day_15_milestone',
    name: 'Quarter Arc Master',
    description: 'Conquered 15 days of deep OOP and Collections',
    icon: 'Award',
    category: 'Milestone',
    xpReward: 250,
    requirement: { type: 'days_completed', count: 15 }
  },
  {
    id: 'java_champion',
    name: 'Core Java Virtuoso',
    description: 'Successfully finished Phase 1 (Days 1–25) and all 57 Java videos',
    icon: 'Coffee',
    category: 'Phase',
    xpReward: 500,
    requirement: { type: 'phase_completed', phase: 'phase-1' }
  },
  {
    id: 'day_30_halftime',
    name: 'Halfway Spartan',
    description: 'Reached Day 30! Entered the Spring Boot battleground',
    icon: 'Shield',
    category: 'Milestone',
    xpReward: 400,
    requirement: { type: 'days_completed', count: 30 }
  },
  {
    id: 'day_45_architect',
    name: 'Backend Architect',
    description: 'Mastered 45 days including JPA, Hibernate & Spring MVC',
    icon: 'Cpu',
    category: 'Milestone',
    xpReward: 600,
    requirement: { type: 'days_completed', count: 45 }
  },
  {
    id: 'spring_master',
    name: 'Spring Boot Maestro',
    description: 'Finished Phase 2 (Days 26–55) including Spring Security & JWT',
    icon: 'Leaf',
    category: 'Phase',
    xpReward: 800,
    requirement: { type: 'phase_completed', phase: 'phase-2' }
  },
  {
    id: 'winter_arc_legend',
    name: 'Winter Arc Legend',
    description: 'Completed all 60 days of Backend Engineering challenge!',
    icon: 'Crown',
    category: 'Ultimate',
    xpReward: 1500,
    requirement: { type: 'days_completed', count: 60 }
  },
  {
    id: 'streak_3',
    name: 'Hat Trick Streak',
    description: 'Maintained a 3-day unbroken daily study streak',
    icon: 'Zap',
    category: 'Streak',
    xpReward: 100,
    requirement: { type: 'streak', count: 3 }
  },
  {
    id: 'streak_7',
    name: 'Weekly Momentum',
    description: 'Kept an unbroken 7-day study streak',
    icon: 'Activity',
    category: 'Streak',
    xpReward: 200,
    requirement: { type: 'streak', count: 7 }
  },
  {
    id: 'streak_21',
    name: 'Habit Machine',
    description: 'Reached a 21-day study streak! Coding is now second nature',
    icon: 'Sparkles',
    category: 'Streak',
    xpReward: 500,
    requirement: { type: 'streak', count: 21 }
  },
  {
    id: 'pomodoro_pioneer',
    name: 'Focus Master',
    description: 'Logged over 10 hours of focused Pomodoro study sessions',
    icon: 'Timer',
    category: 'Focus',
    xpReward: 250,
    requirement: { type: 'study_hours', hours: 10 }
  },
  {
    id: 'century_club',
    name: 'Century Scholar',
    description: 'Completed 100 individual learning tasks (exercises, videos, revisions)',
    icon: 'Target',
    category: 'Tasks',
    xpReward: 350,
    requirement: { type: 'tasks_completed', count: 100 }
  },
  {
    id: 'video_binger',
    name: 'Lecture Devourer',
    description: 'Watched 50+ authentic Coder Army lectures',
    icon: 'PlayCircle',
    category: 'Videos',
    xpReward: 300,
    requirement: { type: 'videos_watched', count: 50 }
  }
];

export const XP_LEVELS = [
  { level: 1, name: 'Novice Coder', minXP: 0 },
  { level: 2, name: 'Byte Apprentice', minXP: 200 },
  { level: 3, name: 'Syntax Explorer', minXP: 500 },
  { level: 4, name: 'OOP Practitioner', minXP: 1000 },
  { level: 5, name: 'Collections Specialist', minXP: 1800 },
  { level: 6, name: 'Concurrency Voyager', minXP: 2800 },
  { level: 7, name: 'Spring Recruit', minXP: 4000 },
  { level: 8, name: 'REST Artisan', minXP: 5500 },
  { level: 9, name: 'JPA & DB Alchemist', minXP: 7200 },
  { level: 10, name: 'Security Guardian', minXP: 9200 },
  { level: 11, name: 'Backend Architect', minXP: 11500 },
  { level: 12, name: 'Winter Arc Grandmaster', minXP: 14000 }
];

