import { STORAGE_KEYS, readJson, writeJson, removeKey } from './storage.js';
import { getStudentById } from './students.js';

const CREDENTIALS = Object.freeze({
  admin: { username: 'admin', password: 'admin123' },
  teacher: { username: 'teacher', password: 'teacher123' },
});

const SESSION_DURATION_MS = 30 * 60 * 1000;

function setSessionNotice(message) {
  if (!message) return;
  writeJson(STORAGE_KEYS.sessionNotice, {
    message,
    createdAt: Date.now(),
  });
}

function consumeSessionNotice() {
  const notice = readJson(STORAGE_KEYS.sessionNotice, null);
  if (notice) removeKey(STORAGE_KEYS.sessionNotice);
  return notice;
}

function login(role, idOrUsername, password) {
  if (!role || !idOrUsername || !password) {
    return { ok: false, error: 'Please fill in all fields.' };
  }

  if (role === 'student') {
    const studentId = idOrUsername;
    const student = getStudentById(studentId);
    if (!student || student.password !== password) {
      return { ok: false, error: 'Invalid credentials. Try again.' };
    }

    writeJson(STORAGE_KEYS.session, {
      role,
      userId: studentId,
      username: student.name,
      loginAt: Date.now(),
    });

    return { ok: true };
  }

  const expected = CREDENTIALS[role];
  if (!expected || idOrUsername !== expected.username || password !== expected.password) {
    return { ok: false, error: 'Invalid credentials. Try again.' };
  }

  writeJson(STORAGE_KEYS.session, {
    role,
    userId: role,
    username: expected.username,
    loginAt: Date.now(),
  });

  return { ok: true };
}

function logout() {
  removeKey(STORAGE_KEYS.session);
}

function getSession() {
  return readJson(STORAGE_KEYS.session, null);
}

function isSessionValid() {
  const session = getSession();
  if (!session || !session.role || !session.userId || !session.username) {
    return false;
  }

  const expiresAt = session.loginAt + SESSION_DURATION_MS;
  const isExpired = !session.loginAt || Date.now() > expiresAt;
  if (isExpired) {
    logout();
    setSessionNotice('Session expired. Please login again.');
    return false;
  }

  return true;
}

function requireAuth() {
  const session = getSession();
  if (!session) {
    return null;
  }

  return isSessionValid() ? session : null;
}

function getRole() {
  return getSession()?.role ?? null;
}

function getUsername() {
  return getSession()?.username ?? null;
}

function getUserId() {
  return getSession()?.userId ?? null;
}

export {
  login,
  logout,
  getSession,
  isSessionValid,
  requireAuth,
  getRole,
  getUsername,
  getUserId,
  consumeSessionNotice,
};
