// LocalStorage manager with JSON export/import support

const STORAGE_KEY = 'winter_arc_60_days_state_v1';

export function loadStoredState(defaultState) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    return {
      ...defaultState,
      ...parsed,
      settings: { ...defaultState.settings, ...(parsed.settings || {}) }
    };
  } catch (err) {
    console.error('Failed to load stored state from LocalStorage:', err);
    return defaultState;
  }
}

export function saveStateToStorage(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (err) {
    console.error('Failed to save state to LocalStorage:', err);
  }
}

export function exportStateAsJSON(state) {
  const exportData = {
    appName: 'Winter Arc - 60 Days of Backend Engineering',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    data: state
  };

  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(exportData, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute(
    'download',
    `winter-arc-backup-${new Date().toISOString().slice(0, 10)}.json`
  );
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

export function parseAndValidateImportJSON(jsonText) {
  try {
    const parsed = JSON.parse(jsonText);
    const stateData = parsed.data || parsed;

    if (!stateData.days || !Array.isArray(stateData.days)) {
      throw new Error('Invalid backup file: "days" array is missing.');
    }
    return { success: true, data: stateData };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

