import { STORAGE_KEYS, readJson, writeJson } from './storage.js';

function getStudents() {
  return readJson(STORAGE_KEYS.students, []);
}

function saveStudents(list) {
  writeJson(STORAGE_KEYS.students, list);
}

function addStudent(student) {
  const students = getStudents();
  const withPassword = {
    password: 'student123',
    ...student,
  };
  students.push(withPassword);
  saveStudents(students);
  return students;
}

function getStudentById(studentId) {
  return getStudents().find((student) => student.id === studentId);
}

function updateStudent(studentId, updates) {
  const students = getStudents();
  const index = students.findIndex((student) => student.id === studentId);
  if (index === -1) return null;

  students[index] = {
    ...students[index],
    ...updates,
  };
  saveStudents(students);
  return students[index];
}

function deleteStudent(studentId) {
  const students = getStudents();
  const next = students.filter((student) => student.id !== studentId);
  if (next.length === students.length) return false;
  saveStudents(next);
  return true;
}

function calculateAttendancePercent(student) {
  const total = Number.isInteger(student.totalWorkingDays) ? student.totalWorkingDays : 0;
  const attendance = Number.isInteger(student.attendance) ? student.attendance : 0;
  if (total === 0) return null;
  return Math.round((attendance / total) * 100);
}

function getStudentsSummaryStats(students) {
  const total = students.length;
  const avgGpa =
    total === 0
      ? 0
      : Number(
          (students.reduce((sum, student) => sum + (Number(student.gpa) || 0), 0) / total).toFixed(
            1
          )
        );

  const attendancePercents = students
    .map((student) => calculateAttendancePercent(student))
    .filter((value) => typeof value === 'number');
  const avgAttendance =
    attendancePercents.length === 0
      ? 0
      : Math.round(attendancePercents.reduce((sum, value) => sum + value, 0) / attendancePercents.length);

  const lowAttendanceCount = students.filter((student) => {
    const percent = calculateAttendancePercent(student);
    return typeof percent === 'number' && percent < 75;
  }).length;

  return {
    total,
    avgGpa,
    avgAttendance,
    lowAttendanceCount,
  };
}

function applyStudentFilters(students, { searchTerm, courseFilter }) {
  const term = (searchTerm || '').trim().toLowerCase();
  const course = (courseFilter || 'All').trim();

  return students.filter((student) => {
    const matchesTerm =
      term.length === 0 ||
      student.id.toLowerCase().includes(term) ||
      student.name.toLowerCase().includes(term);

    const matchesCourse =
      course === 'All' || student.courses.some((item) => item === course);

    return matchesTerm && matchesCourse;
  });
}

function sortStudents(students, sortKey) {
  const copy = [...students];
  if (sortKey === 'name-asc') {
    return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
  if (sortKey === 'gpa-desc') {
    return copy.sort((a, b) => (Number(b.gpa) || 0) - (Number(a.gpa) || 0));
  }
  if (sortKey === 'attendance-desc') {
    return copy.sort((a, b) => {
      const aPercent = calculateAttendancePercent(a);
      const bPercent = calculateAttendancePercent(b);
      const safeA = typeof aPercent === 'number' ? aPercent : -1;
      const safeB = typeof bPercent === 'number' ? bPercent : -1;
      return safeB - safeA;
    });
  }
  return copy;
}

function paginate(items, page, pageSize) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const pageItems = items.slice(start, start + pageSize);
  return { pageItems, totalPages, currentPage };
}

const COURSE_CATALOG = [
  'Math',
  'Physics',
  'Chemistry',
  'Biology',
  'CS',
  'English',
  'Economics',
  'History',
  'Art',
  'PE',
];

const FIRST_NAMES = [
  'Aarav',
  'Vivaan',
  'Aditya',
  'Vihaan',
  'Arjun',
  'Sai',
  'Reyansh',
  'Krishna',
  'Ishaan',
  'Shaurya',
  'Ananya',
  'Diya',
  'Isha',
  'Aadhya',
  'Myra',
  'Sara',
  'Nisha',
  'Kavya',
  'Meera',
  'Riya',
  'Priya',
  'Tanvi',
  'Neha',
  'Sanya',
  'Aditi',
  'Rohan',
  'Kabir',
  'Manav',
  'Dhruv',
  'Yash',
  'Karan',
  'Nikhil',
  'Rahul',
  'Varun',
  'Arnav',
  'Tanya',
  'Pooja',
  'Simran',
  'Alok',
  'Harsh',
];

const LAST_NAMES = [
  'Sharma',
  'Verma',
  'Gupta',
  'Mehta',
  'Kapoor',
  'Iyer',
  'Reddy',
  'Nair',
  'Singh',
  'Patel',
  'Bose',
  'Chatterjee',
  'Khan',
  'Joshi',
  'Malhotra',
  'Yadav',
  'Shah',
  'Bhat',
  'Chawla',
  'Das',
];

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickRandomItems(list, count) {
  const copy = [...list];
  const selected = [];
  while (copy.length && selected.length < count) {
    const idx = getRandomInt(0, copy.length - 1);
    selected.push(copy[idx]);
    copy.splice(idx, 1);
  }
  return selected;
}

function randomGpa(rangeMin, rangeMax) {
  const value = Math.random() * (rangeMax - rangeMin) + rangeMin;
  return Number(value.toFixed(1));
}

function seedDemoStudents(count = 60) {
  const students = [];
  const baseId = 1001;

  const ensureLowAttendance = new Set();
  while (ensureLowAttendance.size < 15) {
    ensureLowAttendance.add(getRandomInt(0, count - 1));
  }

  for (let i = 0; i < count; i += 1) {
    const studentId = `S${baseId + i}`;
    const first = FIRST_NAMES[getRandomInt(0, FIRST_NAMES.length - 1)];
    const last = LAST_NAMES[getRandomInt(0, LAST_NAMES.length - 1)];
    const name = `${first} ${last}`;

    const totalWorkingDays = i < 10 ? 0 : getRandomInt(30, 120);
    let attendanceDays = 0;
    if (totalWorkingDays > 0) {
      attendanceDays = getRandomInt(0, totalWorkingDays);
    }

    if (ensureLowAttendance.has(i) && totalWorkingDays > 0) {
      attendanceDays = getRandomInt(0, Math.max(0, Math.floor(totalWorkingDays * 0.7)));
    }

    let gpa = randomGpa(5, 7);
    if (i % 3 === 0) gpa = randomGpa(2, 4);
    if (i % 4 === 0) gpa = randomGpa(8, 10);

    const courses = pickRandomItems(COURSE_CATALOG, getRandomInt(2, 4));

    students.push({
      id: studentId,
      name,
      gpa,
      attendance: attendanceDays,
      totalWorkingDays,
      courses,
      password: 'student123',
    });
  }

  saveStudents(students);
  return students;
}

export {
  getStudents,
  addStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  calculateAttendancePercent,
  getStudentsSummaryStats,
  applyStudentFilters,
  sortStudents,
  paginate,
  seedDemoStudents,
};
