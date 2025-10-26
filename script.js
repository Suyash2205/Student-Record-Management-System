function handleLogin(event) {
  event.preventDefault();
  const role = document.getElementById('role').value;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMsg = document.getElementById('error-msg');

  if (
    (role === 'admin' && username === 'admin' && password === 'admin123') ||
    (role === 'student' && username === 'student' && password === 'student123')
  ) {
    localStorage.setItem('role', role);
    localStorage.setItem('username', username);
    window.location.href = 'dashboard.html';
  } else {
    errorMsg.textContent = 'Invalid credentials. Try again.';
    errorMsg.style.color = 'red';
  }
}

function logout() {
  localStorage.clear();
  window.location.href = 'login.html';
}

// ---- DASHBOARD LOGIC ----
window.onload = () => {
  const role = localStorage.getItem('role');
  const username = localStorage.getItem('username');
  const welcomeText = document.getElementById('welcome-text');
  const adminOptions = document.getElementById('admin-options');
  const studentOptions = document.getElementById('student-options');

  if (welcomeText && role) {
    if (role === 'admin') {
      welcomeText.textContent = `Welcome, Admin ${username}. You can manage all student records below.`;
      adminOptions.style.display = 'block';
    } else if (role === 'student') {
      welcomeText.textContent = `Welcome, ${username}. You can view your details and attendance below.`;
      studentOptions.style.display = 'block';
    }
  }
};

// ---- STUDENT MANAGEMENT ----
let students = JSON.parse(localStorage.getItem('students')) || [];

function addStudent(e) {
  e.preventDefault();
  const id = document.getElementById('s-id').value;
  const name = document.getElementById('s-name').value;
  const gpa = parseFloat(document.getElementById('s-gpa').value);
  const attendance = parseInt(document.getElementById('s-att').value);
  const courses = document.getElementById('s-courses').value.split(',');

  students.push({ id, name, gpa, attendance, courses });
  localStorage.setItem('students', JSON.stringify(students));

  alert('Student added successfully!');
  e.target.reset();
  viewAllStudents();
}

function viewAllStudents() {
  const tbody = document.querySelector('#students-table tbody');
  tbody.innerHTML = '';

  students.forEach((s) => {
    const row = `<tr>
      <td>${s.id}</td><td>${s.name}</td><td>${s.gpa}</td>
      <td>${s.attendance}</td><td>${s.courses.join(', ')}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function updateAttendance(e) {
  e.preventDefault();
  const id = document.getElementById('att-id').value;
  const days = parseInt(document.getElementById('att-days').value);

  const student = students.find((s) => s.id === id);
  if (student) {
    student.attendance = days;
    localStorage.setItem('students', JSON.stringify(students));
    alert('Attendance updated!');
  } else {
    alert('Student not found.');
  }
}

function searchStudent(e) {
  e.preventDefault();
  const id = document.getElementById('search-id').value;
  const student = students.find((s) => s.id === id);
  const resultDiv = document.getElementById('search-result');

  if (student) {
    resultDiv.innerHTML = `<p><strong>${student.name}</strong> — GPA: ${student.gpa}, Attendance: ${student.attendance} days</p>`;
  } else {
    resultDiv.textContent = 'No student found with that ID.';
  }
}

// ---- STUDENT VIEW ----
function viewMyDetails() {
  const username = localStorage.getItem('username');
  const student = students.find((s) => s.name.toLowerCase() === username.toLowerCase());
  const div = document.getElementById('student-view');

  if (student) {
    div.innerHTML = `
      <p><strong>ID:</strong> ${student.id}</p>
      <p><strong>Name:</strong> ${student.name}</p>
      <p><strong>GPA:</strong> ${student.gpa}</p>
      <p><strong>Courses:</strong> ${student.courses.join(', ')}</p>
    `;
  } else {
    div.innerHTML = `<p>No record found for your login name (${username}).</p>`;
  }
}

function viewMyAttendance() {
  const username = localStorage.getItem('username');
  const student = students.find((s) => s.name.toLowerCase() === username.toLowerCase());
  const div = document.getElementById('student-view');

  if (student) {
    div.innerHTML = `<p><strong>Attendance:</strong> ${student.attendance} days present</p>`;
  } else {
    div.innerHTML = `<p>No attendance record found for your login name.</p>`;
  }
}
