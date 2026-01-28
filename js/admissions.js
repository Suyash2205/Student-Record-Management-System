import { addEnquiry } from './enquiries.js';
import { showToast } from './ui.js';

function initAdmissions() {
  const form = document.getElementById('enquiryForm');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const name = document.getElementById('name')?.value.trim();
    const email = document.getElementById('email')?.value.trim();
    const course = document.getElementById('course')?.value;
    const message = document.getElementById('message')?.value.trim();

    if (!name || !email || !course) {
      showToast('Please complete all required fields.', 'error');
      return;
    }

    addEnquiry({
      name,
      email,
      course,
      message,
      createdAt: new Date().toISOString(),
    });

    showToast('Thank you for your enquiry! We will contact you soon.', 'success');
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', initAdmissions);
