import { STORAGE_KEYS, readJson, writeJson } from './storage.js';

function getEnquiries() {
  return readJson(STORAGE_KEYS.enquiries, []);
}

function addEnquiry(enquiry) {
  const enquiries = getEnquiries();
  enquiries.push(enquiry);
  writeJson(STORAGE_KEYS.enquiries, enquiries);
  return enquiries;
}

function seedDemoEnquiries(count = 15) {
  const programs = [
    'B.E. Computer Engineering',
    'B.E. Information Technology',
    'MCA',
    'B.E. Electronics Engineering',
    'B.Sc. Data Science',
    'MBA',
  ];
  const statuses = ['New', 'Contacted', 'Closed'];

  const sampleMessages = [
    'Looking for program details and fee structure.',
    'Interested in scholarship options and hostel availability.',
    'Please share the admission timeline and eligibility.',
    'Can I visit the campus? Need appointment details.',
    'Requesting details about placement support.',
  ];

  const docsPool = [
    { name: 'marksheet_12th.pdf', type: 'application/pdf', sizeKb: 220 },
    { name: 'id_proof.png', type: 'image/png', sizeKb: 180 },
    { name: 'recommendation_letter.pdf', type: 'application/pdf', sizeKb: 140 },
  ];

  const enquiries = [];
  for (let i = 0; i < count; i += 1) {
    const id = `ENQ-${1001 + i}`;
    const createdAt = new Date(Date.now() - i * 86400000).toISOString();
    const fullName = `Applicant ${i + 1}`;
    const email = `applicant${i + 1}@example.com`;
    const phone = `+91 98${String(100000 + i).padStart(6, '0')}`;
    const program = programs[i % programs.length];
    const message = sampleMessages[i % sampleMessages.length];
    const status = statuses[i % statuses.length];
    const documents = i < 3 ? docsPool : [];

    enquiries.push({
      id,
      createdAt,
      fullName,
      email,
      phone,
      program,
      message,
      status,
      documents,
    });
  }

  writeJson(STORAGE_KEYS.enquiries, enquiries);
  return enquiries;
}

export { getEnquiries, addEnquiry, seedDemoEnquiries };
