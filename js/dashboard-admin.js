import { guardDashboard } from './router-guard.js';
import { getRole, getUsername, getUserId, logout } from './auth.js';
import {
  addStudent,
  getStudents,
  getStudentById,
  getStudentsSummaryStats,
  applyStudentFilters,
  sortStudents,
  paginate,
  seedDemoStudents,
  updateStudent,
  deleteStudent,
} from './students.js';
import {
  renderStudentsTableWithActions,
  showToast,
  setText,
  openModal,
} from './ui.js';
import { clearAppStorage } from './storage.js';
import { seedDemoEnquiries } from './enquiries.js';

function parseCourses(raw) {
  return raw
    .split(',')
    .map((course) => course.trim())
    .filter(Boolean);
}

function normalizeGpa(value) {
  const trimmed = value.trim();
  if (!/^\d+(\.\d)?$/.test(trimmed)) return null;
  const gpa = Number(trimmed);
  if (!Number.isFinite(gpa) || gpa < 0 || gpa > 10) return null;
  return Number(gpa.toFixed(1));
}

function parseIntValue(value) {
  if (value === '') return null;
  const number = Number(value);
  return Number.isInteger(number) && number >= 0 ? number : null;
}

function validateStudentData({ id, name, gpaValue, attendanceValue, totalValue, courses }) {
  if (!id) {
    return 'Student ID is required.';
  }
  if (!name || name.trim().length < 2) {
    return 'Name must be at least 2 characters.';
  }
  const gpa = normalizeGpa(gpaValue);
  if (gpa === null) {
    return 'GPA must be a number between 0 and 10 (max 1 decimal).';
  }

  const attendance = parseIntValue(attendanceValue);
  if (attendance === null) {
    return 'Attendance must be a whole number (0 or more).';
  }

  const totalWorkingDays = parseIntValue(totalValue);
  if (totalWorkingDays === null) {
    return 'Total working days must be a whole number (0 or more).';
  }

  if (attendance > totalWorkingDays) {
    return 'Attendance cannot exceed total working days.';
  }

  if (!courses || courses.length === 0) {
    return 'Please provide at least one course.';
  }

  return null;
}

function renderStats(students) {
  const totalEl = document.getElementById('stat-total');
  const avgGpaEl = document.getElementById('stat-avg-gpa');
  const avgAttendanceEl = document.getElementById('stat-avg-attendance');
  const lowAttendanceEl = document.getElementById('stat-low-attendance');

  if (!totalEl || !avgGpaEl || !avgAttendanceEl || !lowAttendanceEl) return;

  const stats = getStudentsSummaryStats(students);
  totalEl.textContent = stats.total;
  avgGpaEl.textContent = stats.avgGpa.toFixed(1);
  avgAttendanceEl.textContent = `${stats.avgAttendance}%`;
  lowAttendanceEl.textContent = stats.lowAttendanceCount;
}

function initAdminDashboard() {
  if (!guardDashboard()) return;
  const role = getRole();
  if (role !== 'admin' && role !== 'teacher') return;

  const welcomeText = document.getElementById('welcome-text');
  const adminOptions = document.getElementById('admin-options');
  const logoutButton = document.getElementById('logout-button');
  const roleBadge = document.getElementById('role-badge');
  const roleIdentifier = document.getElementById('role-identifier');
  const addStudentCard = document.getElementById('add-student-card');
  const dataToolsCard = document.getElementById('data-tools-card');
  const seedDemoButton = document.getElementById('seed-demo-data');
  const resetAppButton = document.getElementById('reset-app-data');
  const actionsHeader = document.getElementById('actions-header');
  const addForm = document.getElementById('add-student-form');
  const viewAllBtn = document.getElementById('view-all-btn');
  const updateForm = document.getElementById('update-attendance-form');
  const searchForm = document.getElementById('search-form');
  const searchResult = document.getElementById('search-result');
  const studentsTableBody = document.querySelector('#students-table tbody');
  const searchInput = document.getElementById('search-input');
  const courseFilter = document.getElementById('course-filter');
  const sortSelect = document.getElementById('sort-select');
  const pageSizeSelect = document.getElementById('page-size');
  const emptyState = document.getElementById('empty-state');
  const resetFiltersButton = document.getElementById('reset-filters');
  const pageIndicator = document.getElementById('page-indicator');
  const prevPageButton = document.getElementById('prev-page');
  const nextPageButton = document.getElementById('next-page');
  renderStats(getStudents());

  if (!adminOptions) return;
  adminOptions.style.display = 'block';
  const roleLabel = role === 'teacher' ? 'Teacher' : 'Admin';
  setText(
    welcomeText,
    `Welcome, ${roleLabel} ${getUsername()}. You can manage all student records below.`
  );

  if (roleBadge) {
    roleBadge.textContent = `Logged in as: ${role === 'teacher' ? 'Teacher' : 'Admin'}`;
  }
  if (roleIdentifier) {
    roleIdentifier.textContent = getUsername() || getUserId() || '';
  }

  if (role === 'teacher' && addStudentCard) {
    addStudentCard.style.display = 'none';
  }
  if (role === 'teacher' && dataToolsCard) {
    dataToolsCard.style.display = 'none';
  }
  if (role === 'teacher' && actionsHeader) {
    actionsHeader.style.display = 'none';
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

  const STORAGE_KEY = 'srms_table_state';
  const defaultState = {
    searchTerm: '',
    courseFilter: 'All',
    sortKey: 'name-asc',
    pageSize: 10,
    page: 1,
  };

  const loadTableState = () => {
    try {
      const raw = sessionStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultState };
      const parsed = JSON.parse(raw);
      return { ...defaultState, ...parsed };
    } catch (err) {
      return { ...defaultState };
    }
  };

  const saveTableState = (state) => {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  };

  let tableState = loadTableState();

  const setControlValues = (state) => {
    if (searchInput) searchInput.value = state.searchTerm;
    if (courseFilter) courseFilter.value = state.courseFilter;
    if (sortSelect) sortSelect.value = state.sortKey;
    if (pageSizeSelect) pageSizeSelect.value = String(state.pageSize);
  };

  const updateCourseOptions = (students) => {
    if (!courseFilter) return;
    const courses = Array.from(
      new Set(
        students.flatMap((student) =>
          (student.courses || []).map((course) => course.trim()).filter(Boolean)
        )
      )
    ).sort((a, b) => a.localeCompare(b));

    const currentValue = courseFilter.value || tableState.courseFilter;
    courseFilter.innerHTML = '<option value="All">All</option>';
    courses.forEach((course) => {
      const option = document.createElement('option');
      option.value = course;
      option.textContent = course;
      courseFilter.appendChild(option);
    });

    if (currentValue !== 'All' && !courses.includes(currentValue)) {
      tableState.courseFilter = 'All';
    }
  };

  const applyTableState = () => {
    const students = getStudents();
    renderStats(students);
    updateCourseOptions(students);

    const filtered = applyStudentFilters(students, {
      searchTerm: tableState.searchTerm,
      courseFilter: tableState.courseFilter,
    });
    const sorted = sortStudents(filtered, tableState.sortKey);
    const pageSize = Number(tableState.pageSize) || defaultState.pageSize;
    const paged = paginate(sorted, tableState.page, pageSize);

    tableState.page = paged.currentPage;
    saveTableState(tableState);
    setControlValues(tableState);

    if (sorted.length === 0) {
      if (studentsTableBody) {
        studentsTableBody.innerHTML = '';
      }
      if (emptyState) emptyState.style.display = 'block';
    } else if (emptyState) {
      emptyState.style.display = 'none';
    }

    if (studentsTableBody) {
      renderStudentsTableWithActions(studentsTableBody, paged.pageItems, {
        showActions: role === 'admin',
      });
    }

    if (pageIndicator) {
      pageIndicator.textContent = `Page ${paged.currentPage} of ${paged.totalPages}`;
    }
    if (prevPageButton) {
      prevPageButton.disabled = paged.currentPage <= 1;
    }
    if (nextPageButton) {
      nextPageButton.disabled = paged.currentPage >= paged.totalPages;
    }
  };

  const resetFilters = () => {
    tableState = { ...defaultState };
    sessionStorage.removeItem(STORAGE_KEY);
    applyTableState();
  };

  setControlValues(tableState);
  applyTableState();

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      tableState.searchTerm = searchInput.value;
      tableState.page = 1;
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (courseFilter) {
    courseFilter.addEventListener('change', () => {
      tableState.courseFilter = courseFilter.value;
      tableState.page = 1;
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      tableState.sortKey = sortSelect.value;
      tableState.page = 1;
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (pageSizeSelect) {
    pageSizeSelect.addEventListener('change', () => {
      tableState.pageSize = Number(pageSizeSelect.value);
      tableState.page = 1;
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (prevPageButton) {
    prevPageButton.addEventListener('click', () => {
      tableState.page = Math.max(1, tableState.page - 1);
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (nextPageButton) {
    nextPageButton.addEventListener('click', () => {
      tableState.page = tableState.page + 1;
      saveTableState(tableState);
      applyTableState();
    });
  }

  if (resetFiltersButton) {
    resetFiltersButton.addEventListener('click', resetFilters);
  }

  if (seedDemoButton) {
    seedDemoButton.addEventListener('click', () => {
      const existing = getStudents();
      if (existing.length > 0) {
        openModal({
          title: 'Replace Data?',
          confirmText: 'Replace',
          cancelText: 'Cancel',
          bodyHtml:
            '<p>Replace existing students with demo data? This will remove current data.</p>',
          onConfirm: () => {
            seedDemoStudents(60);
            seedDemoEnquiries(15);
            showToast('Demo data loaded', 'success');
            applyTableState();
            return true;
          },
        });
        return;
      }

      seedDemoStudents(60);
      seedDemoEnquiries(15);
      showToast('Demo data loaded', 'success');
      applyTableState();
    });
  }

  if (resetAppButton) {
    resetAppButton.addEventListener('click', () => {
      openModal({
        title: 'Reset App Data',
        confirmText: 'Reset',
        cancelText: 'Cancel',
        bodyHtml: '<p>Reset app data? This cannot be undone.</p>',
        onConfirm: () => {
          clearAppStorage();
          sessionStorage.removeItem(STORAGE_KEY);
          tableState = { ...defaultState };
          applyTableState();
          showToast('App data reset', 'success');
          return true;
        },
      });
    });
  }

  if (addForm) {
    addForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('s-id')?.value.trim();
      const name = document.getElementById('s-name')?.value.trim();
      const gpaValue = document.getElementById('s-gpa')?.value.trim() || '';
      const attValue = document.getElementById('s-att')?.value.trim() || '';
      const totalValue = document.getElementById('s-total')?.value.trim() || '';
      const coursesRaw = document.getElementById('s-courses')?.value.trim();
      const courses = coursesRaw ? parseCourses(coursesRaw) : [];

      const validationError = validateStudentData({
        id,
        name,
        gpaValue,
        attendanceValue: attValue,
        totalValue,
        courses,
      });
      if (validationError) {
        showToast(validationError, 'error');
        return;
      }

      if (getStudentById(id)) {
        showToast('A student with this ID already exists.', 'error');
        return;
      }

      const gpa = normalizeGpa(gpaValue);
      const attendance = parseIntValue(attValue);
      const totalWorkingDays = parseIntValue(totalValue);
      addStudent({ id, name, gpa, attendance, totalWorkingDays, courses });
      showToast('Student added successfully!', 'success');
      addForm.reset();
      applyTableState();
    });
  }

  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      applyTableState();
    });
  }

  if (updateForm) {
    updateForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('att-id')?.value.trim();
      const daysValue = document.getElementById('att-days')?.value.trim();
      const days = Number(daysValue);

      if (!id || !daysValue) {
        showToast('Please provide a student ID and attendance value.', 'error');
        return;
      }

      if (!Number.isFinite(days) || days < 0) {
        showToast('Please enter a valid attendance value.', 'error');
        return;
      }

      const updated = updateStudent(id, { attendance: days });
      if (!updated) {
        showToast('Student not found.', 'error');
        return;
      }

      showToast('Attendance updated!', 'success');
      updateForm.reset();
      applyTableState();
    });
  }

  if (searchForm) {
    searchForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const id = document.getElementById('search-id')?.value.trim();
      if (!id) {
        showToast('Please enter a student ID to search.', 'error');
        return;
      }

      const student = getStudentById(id);
      if (student) {
        searchResult.innerHTML = `<p><strong>${student.name}</strong> — GPA: ${student.gpa}, Attendance: ${student.attendance} days</p>`;
      } else {
        searchResult.textContent = 'No student found with that ID.';
      }
    });
  }

  if (studentsTableBody) {
    studentsTableBody.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;

      if (target.classList.contains('action-edit')) {
        const id = target.dataset.id;
        if (!id) return;
        const student = getStudentById(id);
        if (!student) {
          showToast('Student not found.', 'error');
          return;
        }

        const totalWorkingDays = Number.isInteger(student.totalWorkingDays)
          ? student.totalWorkingDays
          : student.attendance ?? 0;

        openModal({
          title: `Edit Student ${student.id}`,
          confirmText: 'Save',
          cancelText: 'Cancel',
          bodyHtml: `
            <div class="modal-field">
              <label>Student ID</label>
              <input type="text" id="edit-id" value="${student.id}" readonly>
            </div>
            <div class="modal-field">
              <label>Name</label>
              <input type="text" id="edit-name" value="${student.name}">
            </div>
            <div class="modal-field">
              <label>GPA (0-10)</label>
              <input type="number" step="0.1" id="edit-gpa" value="${student.gpa}">
            </div>
            <div class="modal-field">
              <label>Attendance Days</label>
              <input type="number" id="edit-attendance" value="${student.attendance}">
            </div>
            <div class="modal-field">
              <label>Total Working Days</label>
              <input type="number" id="edit-total" value="${totalWorkingDays}">
            </div>
            <div class="modal-field">
              <label>Courses (comma-separated)</label>
              <input type="text" id="edit-courses" value="${student.courses.join(', ')}">
            </div>
          `,
          onConfirm: () => {
            const name = document.getElementById('edit-name')?.value.trim() || '';
            const gpaValue = document.getElementById('edit-gpa')?.value.trim() || '';
            const attendanceValue =
              document.getElementById('edit-attendance')?.value.trim() || '';
            const totalValue = document.getElementById('edit-total')?.value.trim() || '';
            const coursesRaw = document.getElementById('edit-courses')?.value.trim() || '';
            const courses = coursesRaw ? parseCourses(coursesRaw) : [];

            const validationError = validateStudentData({
              id,
              name,
              gpaValue,
              attendanceValue,
              totalValue,
              courses,
            });
            if (validationError) {
              showToast(validationError, 'error');
              return false;
            }

            const gpa = normalizeGpa(gpaValue);
            const attendance = parseIntValue(attendanceValue);
            const totalWorkingDays = parseIntValue(totalValue);

            updateStudent(id, {
              name,
              gpa,
              attendance,
              totalWorkingDays,
              courses,
            });
            showToast('Student updated successfully!', 'success');
            applyTableState();
            return true;
          },
        });
      }

      if (target.classList.contains('action-delete')) {
        const id = target.dataset.id;
        if (!id) return;
        const student = getStudentById(id);
        if (!student) {
          showToast('Student not found.', 'error');
          return;
        }

        openModal({
          title: 'Confirm Delete',
          confirmText: 'Delete',
          cancelText: 'Cancel',
          bodyHtml: `<p>Delete <strong>${student.id}</strong> — ${student.name}? This cannot be undone.</p>`,
          onConfirm: () => {
            const removed = deleteStudent(student.id);
            if (!removed) {
              showToast('Unable to delete student.', 'error');
              return false;
            }
            showToast('Student deleted successfully!', 'success');
            applyTableState();
            return true;
          },
        });
      }
    });
  }
}

document.addEventListener('DOMContentLoaded', initAdminDashboard);
