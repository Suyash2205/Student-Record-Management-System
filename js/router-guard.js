import { requireAuth, isSessionValid } from './auth.js';

const LOGIN_PAGE = 'login.html';
const DASHBOARD_PAGE = 'dashboard.html';

function guardDashboard() {
  const session = requireAuth();
  if (!session) {
    window.location.href = LOGIN_PAGE;
    return false;
  }
  return true;
}

function guardLogin() {
  if (isSessionValid()) {
    window.location.href = DASHBOARD_PAGE;
    return false;
  }
  return true;
}

export { guardDashboard, guardLogin };
