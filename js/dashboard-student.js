import { guardDashboard } from './router-guard.js';
import { getRole, getUsername, getUserId, logout } from './auth.js';
import { getStudentById } from './students.js';
import { setText, showToast } from './ui.js';

function initStudentDashboard() {
  if (!guardDashboard()) return;
  const role = getRole();
  if (role !== 'student') return;

  const welcomeText = document.getElementById('welcome-text');
  const studentOptions = document.getElementById('student-options');
  const studentView = document.getElementById('student-view');
  const viewDetailsBtn = document.getElementById('view-details-btn');
  const viewAttendanceBtn = document.getElementById('view-attendance-btn');
  const logoutButton = document.getElementById('logout-button');
  const roleBadge = document.getElementById('role-badge');
  const roleIdentifier = document.getElementById('role-identifier');

  if (!studentOptions) return;
  studentOptions.style.display = 'block';
  setText(
    welcomeText,
    `Welcome, ${getUsername()}. You can view your details and attendance below.`
  );

  if (roleBadge) {
    roleBadge.textContent = 'Logged in as: Student';
  }
  if (roleIdentifier) {
    roleIdentifier.textContent = getUserId() || '';
  }

  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      logout();
      showToast('Logged out', 'success');
      window.setTimeout(() => {
        window.location.href = 'login.html';
      }, 150);
    });
  }

  const handleMissingRecord = () => {
    showToast('Student record not found. Please login again.', 'error');
    logout();
    window.setTimeout(() => {
      window.location.href = 'login.html';
    }, 150);
  };

  const existingStudent = getStudentById(getUserId());
  if (!existingStudent) {
    handleMissingRecord();
    return;
  }

  const renderStudentDetails = () => {
    const studentId = getUserId();
    const username = getUsername();
    const student = getStudentById(studentId);
    if (student) {
      studentView.innerHTML = `
        <p><strong>ID:</strong> ${student.id}</p>
        <p><strong>Name:</strong> ${student.name}</p>
        <p><strong>GPA:</strong> ${student.gpa}</p>
        <p><strong>Courses:</strong> ${student.courses.join(', ')}</p>
      `;
    } else {
      studentView.innerHTML = `<p>No record found for your login name (${username}).</p>`;
      handleMissingRecord();
    }
  };

  const renderAttendance = () => {
    const studentId = getUserId();
    const student = getStudentById(studentId);
    if (student) {
      studentView.innerHTML = `<p><strong>Attendance:</strong> ${student.attendance} days present</p>`;
    } else {
      studentView.innerHTML = `<p>No attendance record found for your login name.</p>`;
      handleMissingRecord();
    }
  };

  if (viewDetailsBtn) {
    viewDetailsBtn.addEventListener('click', renderStudentDetails);
  }

  if (viewAttendanceBtn) {
    viewAttendanceBtn.addEventListener('click', renderAttendance);
  }
}

document.addEventListener('DOMContentLoaded', initStudentDashboard);
