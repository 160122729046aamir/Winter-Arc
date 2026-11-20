import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { usePlanner } from './PlannerContext';
import { toast } from '../utils/alerts';

// Global focus timer. Lives above the routes so it keeps running while you
// navigate, and is timestamp-based so it stays accurate in background tabs and
// across page reloads.

export const TIMER_PRESETS = [
  { name: 'Pomodoro', minutes: 25, mode: 'focus' },
  { name: 'Deep Work', minutes: 50, mode: 'focus' },
  { name: 'Short Break', minutes: 5, mode: 'break' },
  { name: 'Long Break', minutes: 15, mode: 'break' }
];

const STORAGE_KEY = 'winter_arc_timer_v1';
const TimerContext = createContext(null);

const defaultTimer = () => ({
  presetName: TIMER_PRESETS[0].name,
  mode: TIMER_PRESETS[0].mode,
  durationSec: TIMER_PRESETS[0].minutes * 60,
  remainingSec: TIMER_PRESETS[0].minutes * 60,
  endsAt: null, // epoch ms while running
  running: false,
  dayNumber: null, // null → current challenge day
  note: ''
});

const loadTimer = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultTimer();
    return { ...defaultTimer(), ...JSON.parse(raw) };
  } catch {
    return defaultTimer();
  }
};

const playChime = () => {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.18, 0.36].forEach((offset, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime([587.33, 739.99, 880][i], ctx.currentTime + offset);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime + offset);
      gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + offset + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + offset + 0.9);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + offset);
      osc.stop(ctx.currentTime + offset + 1);
    });
    setTimeout(() => ctx.close?.(), 2000);
  } catch {
    // audio unavailable
  }
};

export const formatClock = (sec) => {
  const s = Math.max(0, Math.round(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(r).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

export function TimerProvider({ children }) {
  const { logStudyTime, currentChallengeDay, triggerCelebration } = usePlanner();
  const [timer, setTimer] = useState(loadTimer);
  const [now, setNow] = useState(Date.now());
  const completingRef = useRef(false);
  const baseTitleRef = useRef(typeof document !== 'undefined' ? document.title : '');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(timer));
    } catch {
      // storage unavailable
    }
  }, [timer]);

  const remainingSec = timer.running && timer.endsAt
    ? Math.max(0, Math.ceil((timer.endsAt - now) / 1000))
    : timer.remainingSec;
  const elapsedSec = Math.max(0, timer.durationSec - remainingSec);
  const effectiveDay = timer.dayNumber || currentChallengeDay;

  const complete = useCallback((awayMs = 0) => {
    if (completingRef.current) return;
    completingRef.current = true;
    setTimer((t) => {
      const finished = { ...t, running: false, endsAt: null, remainingSec: t.durationSec };
      return finished;
    });
    const t = timer;
    const minutes = Math.round(t.durationSec / 60);
    playChime();
    if (t.mode === 'focus') {
      logStudyTime(effectiveDay, minutes, t.note.trim() || `${t.presetName} focus session`, 'pomodoro');
      triggerCelebration(
        `Focus session complete — ${minutes} min logged`,
        awayMs > 60000 ? 'It finished while you were away.' : `Logged to Day ${effectiveDay}.`
      );
    } else {
      toast('Break over', { icon: 'info', text: 'Ready for the next focus block?' });
    }
    setTimeout(() => { completingRef.current = false; }, 500);
  }, [timer, effectiveDay, logStudyTime, triggerCelebration]);

  // Tick while running; complete when the end time passes (also on reload)
  useEffect(() => {
    if (!timer.running || !timer.endsAt) return undefined;
    const tick = () => {
      const n = Date.now();
      setNow(n);
      if (n >= timer.endsAt) complete(n - timer.endsAt);
    };
    tick();
    const id = setInterval(tick, 500);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [timer.running, timer.endsAt, complete]);

  // Show the countdown in the tab title while running
  useEffect(() => {
    if (timer.running) {
      document.title = `${formatClock(remainingSec)} · ${timer.mode === 'focus' ? 'Focus' : 'Break'} — Winter Arc`;
    } else {
      document.title = baseTitleRef.current;
    }
  }, [timer.running, timer.mode, remainingSec]);

  const start = useCallback(() => {
    setTimer((t) => (t.running ? t : { ...t, running: true, endsAt: Date.now() + t.remainingSec * 1000 }));
    setNow(Date.now());
  }, []);

  const pause = useCallback(() => {
    setTimer((t) => (t.running
      ? { ...t, running: false, endsAt: null, remainingSec: Math.max(0, Math.ceil((t.endsAt - Date.now()) / 1000)) }
      : t));
  }, []);

  const reset = useCallback(() => {
    setTimer((t) => ({ ...t, running: false, endsAt: null, remainingSec: t.durationSec }));
  }, []);

  /** Log the minutes already focused in the current (unfinished) session, then reset. */
  const logPartialAndReset = useCallback(() => {
    const minutes = Math.floor(elapsedSec / 60);
    if (timer.mode === 'focus' && minutes >= 1) {
      logStudyTime(effectiveDay, minutes, timer.note.trim() || `Partial ${timer.presetName} session`, 'pomodoro');
      toast(`Logged ${minutes} min to Day ${effectiveDay}`);
    }
    reset();
  }, [elapsedSec, timer.mode, timer.note, timer.presetName, effectiveDay, logStudyTime, reset]);

  const selectPreset = useCallback((preset) => {
    setTimer((t) => ({
      ...t,
      presetName: preset.name,
      mode: preset.mode,
      durationSec: preset.minutes * 60,
      remainingSec: preset.minutes * 60,
      running: false,
      endsAt: null
    }));
  }, []);

  const setDayNumber = useCallback((dayNumber) => setTimer((t) => ({ ...t, dayNumber })), []);
  const setNote = useCallback((note) => setTimer((t) => ({ ...t, note })), []);

  const value = useMemo(() => ({
    ...timer,
    remainingSec,
    elapsedSec,
    effectiveDay,
    progress: timer.durationSec > 0 ? elapsedSec / timer.durationSec : 0,
    start,
    pause,
    reset,
    logPartialAndReset,
    selectPreset,
    setDayNumber,
    setNote
  }), [timer, remainingSec, elapsedSec, effectiveDay, start, pause, reset, logPartialAndReset, selectPreset, setDayNumber, setNote]);

  return <TimerContext.Provider value={value}>{children}</TimerContext.Provider>;
}

export function useTimer() {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error('useTimer must be used within a TimerProvider');
  return ctx;
}
