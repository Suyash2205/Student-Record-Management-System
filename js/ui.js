import { calculateAttendancePercent } from './students.js';

const TOAST_DURATION = 3200;

function ensureToastContainer() {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function showToast(message, type = 'info') {
  if (!message) return;
  const container = ensureToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  window.setTimeout(() => {
    toast.classList.add('toast-hide');
  }, TOAST_DURATION);

  window.setTimeout(() => {
    toast.remove();
  }, TOAST_DURATION + 400);
}

function setText(element, text) {
  if (!element) return;
  element.textContent = text;
}

function clearElement(element) {
  if (!element) return;
  element.innerHTML = '';
}

function renderStudentsTable(tbody, students) {
  return renderStudentsTableWithActions(tbody, students, {});
}

function renderStudentsTableWithActions(tbody, students, options) {
  if (!tbody) return;
  const { showActions = false } = options || {};
  clearElement(tbody);

  students.forEach((student) => {
    const totalWorkingDays = Number.isInteger(student.totalWorkingDays) ? student.totalWorkingDays : 0;
    const attendanceDays = Number.isInteger(student.attendance) ? student.attendance : 0;
    const attendancePercent = calculateAttendancePercent({
      attendance: attendanceDays,
      totalWorkingDays,
    });
    const attendanceText =
      attendancePercent === null
        ? `${attendanceDays}/${totalWorkingDays} (—%)`
        : `${attendanceDays}/${totalWorkingDays} (${attendancePercent}%)`;
    const isLowAttendance = attendancePercent !== null && attendancePercent < 75;

    const row = document.createElement('tr');
    if (isLowAttendance) {
      row.classList.add('low-attendance-row');
    }
    row.innerHTML = `
      <td>${student.id}</td>
      <td>${student.name}</td>
      <td>${student.gpa}</td>
      <td>
        <span>${attendanceText}</span>
        ${
          isLowAttendance
            ? '<span class="attendance-badge">Low Attendance</span>'
            : ''
        }
      </td>
      <td>${student.courses.join(', ')}</td>
      ${
        showActions
          ? `<td class="actions-cell">
              <button type="button" class="action-btn action-edit" data-id="${student.id}">Edit</button>
              <button type="button" class="action-btn action-delete" data-id="${student.id}">Delete</button>
            </td>`
          : ''
      }
    `;
    tbody.appendChild(row);
  });
}

function closeModal() {
  const root = document.getElementById('modal-root');
  if (!root) return;
  root.innerHTML = '';
  document.body.classList.remove('modal-open');
  document.removeEventListener('keydown', handleEscape);
}

function handleEscape(event) {
  if (event.key === 'Escape') {
    closeModal();
  }
}

function openModal({ title, bodyHtml, onConfirm, confirmText, cancelText }) {
  const root = document.getElementById('modal-root');
  if (!root) return;
  closeModal();

  root.innerHTML = `
    <div class="modal-overlay" data-modal-overlay>
      <div class="modal">
        <div class="modal-header">
          <h3>${title || ''}</h3>
          <button type="button" class="modal-close" data-modal-close>&times;</button>
        </div>
        <div class="modal-body">${bodyHtml || ''}</div>
        <div class="modal-footer">
          <button type="button" class="modal-btn modal-cancel" data-modal-cancel>
            ${cancelText || 'Cancel'}
          </button>
          <button type="button" class="modal-btn modal-confirm" data-modal-confirm>
            ${confirmText || 'Confirm'}
          </button>
        </div>
      </div>
    </div>
  `;

  document.body.classList.add('modal-open');
  document.addEventListener('keydown', handleEscape);

  const overlay = root.querySelector('[data-modal-overlay]');
  const closeBtn = root.querySelector('[data-modal-close]');
  const cancelBtn = root.querySelector('[data-modal-cancel]');
  const confirmBtn = root.querySelector('[data-modal-confirm]');

  const tryClose = () => closeModal();

  if (overlay) {
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        tryClose();
      }
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', tryClose);
  if (cancelBtn) cancelBtn.addEventListener('click', tryClose);

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      const shouldClose = onConfirm ? onConfirm() : true;
      if (shouldClose !== false) {
        tryClose();
      }
    });
  }
}

export {
  showToast,
  setText,
  clearElement,
  renderStudentsTable,
  renderStudentsTableWithActions,
  openModal,
  closeModal,
};
