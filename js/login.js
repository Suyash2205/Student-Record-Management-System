import { login, consumeSessionNotice } from './auth.js';
import { guardLogin } from './router-guard.js';
import { showToast, setText } from './ui.js';

function initLogin() {
  if (!guardLogin()) return;
  const form = document.getElementById('login-form');
  const errorMsg = document.getElementById('error-msg');
  const roleSelect = document.getElementById('role');
  const usernameLabel = document.getElementById('username-label');
  const usernameInput = document.getElementById('username');

  if (!form) return;

  const notice = consumeSessionNotice();
  if (notice?.message) {
    showToast(notice.message, 'error');
  }

  const updateLoginField = () => {
    const role = roleSelect?.value;
    const isStudent = role === 'student';
    if (usernameLabel) {
      usernameLabel.textContent = isStudent ? 'Student ID' : 'Username';
    }
    if (usernameInput) {
      usernameInput.placeholder = isStudent ? 'Enter your student ID' : 'Enter your username';
    }
  };

  if (roleSelect) {
    roleSelect.addEventListener('change', updateLoginField);
    updateLoginField();
  }

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    setText(errorMsg, '');

    const role = document.getElementById('role')?.value;
    const username = document.getElementById('username')?.value.trim();
    const password = document.getElementById('password')?.value;

    const result = login(role, username, password);
    if (!result.ok) {
      setText(errorMsg, result.error);
      showToast(result.error, 'error');
      return;
    }

    showToast('Login successful!', 'success');
    window.location.href = 'dashboard.html';
  });
}

document.addEventListener('DOMContentLoaded', initLogin);
