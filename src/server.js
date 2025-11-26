const express = require('express');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs/promises');
const crypto = require('node:crypto');

const app = express();
const PORT = process.env.PORT || 4000;
const submissionsPath = path.join(__dirname, '../data/contact-submissions.json');

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function ensureStorageFile() {
  try {
    await fs.access(submissionsPath);
  } catch {
    await fs.mkdir(path.dirname(submissionsPath), { recursive: true });
    await fs.writeFile(submissionsPath, '[]', 'utf-8');
  }
}

async function persistSubmission(payload) {
  await ensureStorageFile();
  const raw = await fs.readFile(submissionsPath, 'utf-8');
  const submissions = raw ? JSON.parse(raw) : [];
  submissions.push(payload);
  await fs.writeFile(submissionsPath, JSON.stringify(submissions, null, 2));
}

function validatePayload(payload) {
  const errors = {};
  const { name, email, company, phone, message, projectType } = payload;

  if (!name || !name.trim()) {
    errors.name = 'Name is required.';
  }

  if (!email || !emailPattern.test(email)) {
    errors.email = 'A valid email is required.';
  }

  if (phone && phone.replace(/[^\d]/g, '').length < 7) {
    errors.phone = 'Phone number looks too short.';
  }

  if (!message || message.trim().length < 10) {
    errors.message = 'Please provide a little more detail (min 10 characters).';
  }

  if (projectType && projectType.length > 40) {
    errors.projectType = 'Project type label is too long.';
  }

  if (company && company.length > 80) {
    errors.company = 'Company name is too long.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
    cleaned: {
      name: name?.trim(),
      email: email?.trim(),
      company: company?.trim() || null,
      phone: phone?.trim() || null,
      message: message?.trim(),
      projectType: projectType?.trim() || null
    }
  };
}

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', uptime: process.uptime() });
});

app.post('/api/contact', async (req, res) => {
  const { isValid, errors, cleaned } = validatePayload(req.body);

  if (!isValid) {
    return res.status(400).json({ ok: false, errors });
  }

  const submission = {
    ...cleaned,
    id: crypto.randomUUID(),
    submittedAt: new Date().toISOString()
  };

  try {
    await persistSubmission(submission);
    res.status(201).json({ ok: true, message: 'Thanks for reaching out! We will be in touch shortly.' });
  } catch (error) {
    console.error('Failed to store submission', error);
    res.status(500).json({ ok: false, message: 'Unable to process your request right now. Please retry later.' });
  }
});

app.use((req, res) => {
  res.status(404).json({ ok: false, message: 'Route not found' });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Monce contact server listening on http://localhost:${PORT}`);
  });
}

module.exports = { app };
