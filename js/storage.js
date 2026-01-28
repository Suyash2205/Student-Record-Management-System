const STORAGE_KEYS = Object.freeze({
  session: 'srms_session',
  sessionNotice: 'srms_session_notice',
  students: 'srms_students',
  enquiries: 'srms_enquiries',
});

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    return parsed ?? fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function removeKey(key) {
  localStorage.removeItem(key);
}

function clearAppStorage() {
  Object.values(STORAGE_KEYS).forEach((key) => {
    localStorage.removeItem(key);
  });
}

export { STORAGE_KEYS, readJson, writeJson, removeKey, clearAppStorage };
