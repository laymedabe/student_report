import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import * as db from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serverless detection
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

// Uploads directory: in serverless (like Vercel), only os.tmpdir() is writable
const UPLOADS_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), 'apex_uploads') : path.join(__dirname, 'uploads');
try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (_) { }

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    } catch (_) { }
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'file-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// 1. Center Info & Teacher Auth
app.get('/api/center', async (req, res) => {
  try {
    const center = await db.getCenterInfo();
    res.json({ success: true, center });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/teacher', async (req, res) => {
  try {
    const { email, passcode } = req.body;
    const result = await db.verifyTeacherAuth(email, passcode);
    if (result.valid) {
      return res.json({ success: true, teacher: result.teacher, tutorName: result.teacher?.name });
    }
    return res.status(401).json({ success: false, message: result.message || 'Incorrect email or passcode' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/auth/teacher/register', async (req, res) => {
  try {
    const { name, email, passcode, centerName, avatar, phone } = req.body;
    if (!name || !email || !passcode) {
      return res.status(400).json({ success: false, message: 'Name, email, and passcode are required' });
    }
    const teacher = await db.registerTeacher({ name, email, passcode, centerName, avatar, phone });
    res.status(201).json({ success: true, teacher });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

app.put('/api/teacher/profile', async (req, res) => {
  try {
    const teacherId = req.body.id || req.headers['x-teacher-id'] || 'teacher-1';
    const teacher = await db.updateTeacherProfile(teacherId, req.body);
    res.json({ success: true, teacher });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.get('/api/teachers', async (req, res) => {
  try {
    const teachers = await db.getAllTeachers();
    res.json({ success: true, teachers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/center', async (req, res) => {
  try {
    const center = await db.updateCenterInfo(req.body);
    res.json({ success: true, center });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// File upload endpoint for photos (returns self-contained data URL for 100% serverless/cloud compatibility)
app.post('/api/upload', upload.single('photo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file received' });
    }
    const mime = req.file.mimetype || 'image/jpeg';
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64 = fileBuffer.toString('base64');
    const fileUrl = `data:${mime};base64,${base64}`;
    try { fs.unlinkSync(req.file.path); } catch (_) { }
    res.json({ success: true, url: fileUrl });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Parent Portal Lookup by PIN Code
app.get('/api/portal/:accessCode', async (req, res) => {
  try {
    const pin = req.params.accessCode;
    const student = await db.getStudentByPin(pin);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'No student found with this PIN Code. Please check with your teacher.'
      });
    }

    const center = await db.getCenterInfo();
    const announcements = await db.getAnnouncements();
    const teacher = student.teacher || (await db.getTeacherById(student.teacherId || 'teacher-1'));

    // Align center branding to the student's assigned teacher
    const studentCenter = {
      ...center,
      name: teacher?.centerName || center?.name,
      tutorName: teacher?.name || center?.tutorName,
      avatar: teacher?.avatar || center?.avatar,
      email: teacher?.email || center?.email,
      phone: teacher?.phone || center?.phone
    };

    res.json({
      success: true,
      student,
      teacher,
      center: studentCenter,
      announcements
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Students Management (Admin)
app.get('/api/students', async (req, res) => {
  try {
    const teacherId = req.query.teacherId || req.headers['x-teacher-id'];
    const students = await db.getAllStudents(teacherId);
    res.json({ success: true, students });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/students', async (req, res) => {
  try {
    const { fullName } = req.body;
    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Student full name is required' });
    }
    const teacherId = req.body.teacherId || req.headers['x-teacher-id'] || 'teacher-1';
    const student = await db.createStudent({ ...req.body, teacherId });
    res.status(201).json({ success: true, student });
  } catch (err) {
    console.error('Error creating student:', err.message);
    const status = err.message?.includes('already') || err.message?.includes('required') ? 400 : 500;
    res.status(status).json({ success: false, message: err.message });
  }
});

app.put('/api/students/:id', async (req, res) => {
  try {
    const student = await db.updateStudent(req.params.id, req.body);
    if (!student) return res.status(404).json({ success: false, message: 'Student not found' });
    res.json({ success: true, student });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/students/:id', async (req, res) => {
  try {
    await db.deleteStudent(req.params.id);
    res.json({ success: true, message: 'Student deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Tutoring Sessions
app.post('/api/students/:id/sessions', async (req, res) => {
  try {
    const session = await db.createSession(req.params.id, req.body);
    if (!session) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(201).json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/students/:studentId/sessions/:sessionId', async (req, res) => {
  try {
    const session = await db.updateSession(req.params.studentId, req.params.sessionId, req.body);
    if (!session) return res.status(404).json({ success: false, message: 'Session or student not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/students/:studentId/sessions/:sessionId', async (req, res) => {
  try {
    await db.deleteSession(req.params.studentId, req.params.sessionId);
    res.json({ success: true, message: 'Session deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Comprehensive Progress Reports
app.post('/api/students/:id/reports', async (req, res) => {
  try {
    const report = await db.createReport(req.params.id, req.body);
    if (!report) return res.status(404).json({ success: false, message: 'Student not found' });
    res.status(201).json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.put('/api/students/:studentId/reports/:reportId', async (req, res) => {
  try {
    const report = await db.updateReport(req.params.studentId, req.params.reportId, req.body);
    if (!report) return res.status(404).json({ success: false, message: 'Student or report not found' });
    res.json({ success: true, report });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/students/:studentId/reports/:reportId', async (req, res) => {
  try {
    await db.deleteReport(req.params.studentId, req.params.reportId);
    res.json({ success: true, message: 'Report deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Announcements
app.get('/api/announcements', async (req, res) => {
  try {
    const announcements = await db.getAnnouncements();
    res.json({ success: true, announcements });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.post('/api/announcements', async (req, res) => {
  try {
    const { title, content } = req.body;
    if (!title || !content) return res.status(400).json({ success: false, message: 'Required fields missing' });
    const announcement = await db.createAnnouncement(req.body);
    res.status(201).json({ success: true, announcement });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

app.delete('/api/announcements/:id', async (req, res) => {
  try {
    await db.deleteAnnouncement(req.params.id);
    res.json({ success: true, message: 'Announcement deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 7. Static file serving (for standalone Node deployment / local preview)
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

export default app;
