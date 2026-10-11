import express from 'express';
import cors from 'cors';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// Storage directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname) || '.jpg';
    cb(null, 'file-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + ext);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

app.use(cors());
app.use(express.json({ limit: '15mb' }));
app.use('/uploads', express.static(UPLOADS_DIR));

// Seed data with PIN codes instead of names!
function getInitialData() {
  return {
    center: {
      name: "Apex Scholars Learning Center",
      tagline: "Empowering Minds, Inspiring Lifelong Academic Confidence",
      tutorName: "Teacher Kimberly Hayes, M.Ed.",
      tutorTitle: "Lead Academic Coach & Learning Specialist",
      email: "kimberly@apexscholars.edu",
      phone: "+1 (555) 742-9918",
      address: "842 Cambridge Avenue, Suite 400",
      passcode: "1234",
      activeTerm: "Fall / Winter 2026 Term"
    },
    students: [
      {
        id: "stu-101",
        pinCode: "9421",
        accessCode: "9421",
        fullName: "Lucas Vance",
        preferredName: "Lucas",
        grade: "5th Grade",
        subjects: ["Mathematics", "Science & Discovery", "Reading Comprehension"],
        parentName: "Eleanor Vance",
        parentPhone: "+1 (555) 349-8812",
        parentEmail: "eleanor.vance@example.com",
        enrolledDate: "2026-01-15",
        status: "Active",
        avatar: "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80",
        learningGoals: "Master complex fraction arithmetic, strengthen multi-step word problem synthesis, and refine reading inference skills.",
        sessions: [
          {
            id: "ses-101-1",
            date: "2026-10-09",
            subject: "Mathematics",
            topic: "Multiplying & Dividing Fractions with Real-World Word Problems",
            duration: "60 mins",
            attendance: "Present",
            rating: 5,
            badge: "Star Problem Solver",
            tutorNotes: "Outstanding breakthrough session! Lucas solved all 7 multi-step word problems completely without coaching. He even caught an edge case in problem #4 on his own.",
            homework: "Completed - 100% Score",
            nextSteps: "Begin mixed numbers and decimal conversion next Tuesday."
          },
          {
            id: "ses-101-2",
            date: "2026-10-06",
            subject: "Science & Discovery",
            topic: "Ecosystem Energy Pyramids & Food Web Dynamics",
            duration: "60 mins",
            attendance: "Present",
            rating: 5,
            badge: "Deep Thinker",
            tutorNotes: "Lucas showed remarkable engagement during our food web flow simulation. He grasped trophic levels and trophic cascade effects very fast.",
            homework: "Completed with Diagram",
            nextSteps: "Prepare short 3-minute oral explanation of keystone species."
          },
          {
            id: "ses-101-3",
            date: "2026-10-02",
            subject: "Reading Comprehension",
            topic: "Inference & Character Motive Analysis in Fiction",
            duration: "60 mins",
            attendance: "Present",
            rating: 4,
            badge: "Great Effort",
            tutorNotes: "Solid textual evidence citing. Lucas identified subtle character motivations in chapter 4. We practiced pacing while reading aloud.",
            homework: "Reading Log Signed",
            nextSteps: "Focus on identifying thematic symbolism in non-fiction articles."
          },
          {
            id: "ses-101-4",
            date: "2026-09-28",
            subject: "Mathematics",
            topic: "Equivalent Fractions & Least Common Denominator (LCD)",
            duration: "60 mins",
            attendance: "Present",
            rating: 5,
            badge: "Perseverance Award",
            tutorNotes: "Mastered LCD methods with visual fraction bars. His confidence with unlike denominators has risen significantly compared to last month.",
            homework: "Practice Sheet 4A Completed",
            nextSteps: "Progress into multiplying fraction word problems."
          }
        ],
        reports: [
          {
            id: "rep-101-1",
            title: "Term 1 Comprehensive Academic & Growth Evaluation",
            period: "September - October 2026",
            issueDate: "2026-10-10",
            overallGrade: "A (94%)",
            attendanceRate: "100%",
            behaviorRating: "Exemplary",
            subjectEvaluations: [
              {
                subject: "Mathematics",
                grade: "A (96%)",
                mastery: "Advanced Mastery",
                comment: "Demonstrates superior computational reasoning and enthusiasm when challenged with multi-step logic."
              },
              {
                subject: "Science & Discovery",
                grade: "A (94%)",
                mastery: "Proficient & Curious",
                comment: "Consistently asks insightful questions and demonstrates sharp understanding of ecological systems."
              },
              {
                subject: "Reading Comprehension",
                grade: "A- (91%)",
                mastery: "Strong Competency",
                comment: "Vocabulary recall has grown by 30%. Continues to build speed and ease in written analytical responses."
              }
            ],
            strengths: [
              "Rapid mastery of fraction manipulation and mental arithmetic",
              "Proactive attitude and willingness to tackle difficult challenge tasks",
              "100% on-time homework submission with thorough work shown"
            ],
            areasForGrowth: [
              "Double-check arithmetic signs before turning in papers",
              "Expand written paragraph structure with more descriptive connecting words"
            ],
            tutorSummary: "Lucas is flourishing this term! The transition from initial hesitation with fractions to leading the problem-solving process has been remarkable. His attentiveness and genuine enthusiasm in our sessions make each class productive and joyful. A stellar performance all around!",
            teacherSignature: "Kimberly Hayes, M.Ed."
          }
        ],
        works: [
          {
            id: "wrk-101-1",
            title: "Fraction Operations & Multi-Step Logic Quiz",
            subject: "Mathematics",
            date: "2026-10-09",
            score: "100/100 (A+)",
            imageUrl: "https://images.unsplash.com/photo-1596495578065-6e0763fa1178?w=800&auto=format&fit=crop&q=80",
            type: "Graded Assessment",
            feedback: "Flawless step-by-step reduction and neat organization. Lucas verified every denominator without prompts."
          },
          {
            id: "wrk-101-2",
            title: "Aquatic Ecosystem Energy Flow Diagram & Summary",
            subject: "Science & Discovery",
            date: "2026-10-06",
            score: "98/100 (Exemplary)",
            imageUrl: "https://images.unsplash.com/photo-1509228468518-180dd4864904?w=800&auto=format&fit=crop&q=80",
            type: "Hands-on Project",
            feedback: "Creative illustration showing producers to apex predators. Clearly labeled energy dissipation across trophic levels."
          },
          {
            id: "wrk-101-3",
            title: "Reading Reflection: Character Motivations & Theme",
            subject: "Reading Comprehension",
            date: "2026-10-02",
            score: "92/100 (Strong)",
            imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80",
            type: "Written Assignment",
            feedback: "Cites 3 strong quotes from the novel to justify his answer. Great progress in paragraph transitions!"
          }
        ]
      },
      {
        id: "stu-102",
        pinCode: "3108",
        accessCode: "3108",
        fullName: "Maya Lin Chen",
        preferredName: "Maya",
        grade: "7th Grade",
        subjects: ["Pre-Algebra", "English Literature & Essay Writing"],
        parentName: "David & Grace Chen",
        parentPhone: "+1 (555) 891-4433",
        parentEmail: "grace.chen@example.com",
        enrolledDate: "2026-02-01",
        status: "Active",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
        learningGoals: "Strengthen algebraic equation transformations and construct persuasive five-paragraph argumentative essays.",
        sessions: [
          {
            id: "ses-102-1",
            date: "2026-10-10",
            subject: "Pre-Algebra",
            topic: "Two-Step Linear Equations & Isolating Variables",
            duration: "60 mins",
            attendance: "Present",
            rating: 5,
            badge: "Algebra Ace",
            tutorNotes: "Maya has completely internalized inverse operations. She navigated negative coefficients with great precision today.",
            homework: "Completed - 100%",
            nextSteps: "Move to multi-step equations with variables on both sides."
          },
          {
            id: "ses-102-2",
            date: "2026-10-07",
            subject: "English Literature",
            topic: "Thesis Statement Formulation & Counterargument Integration",
            duration: "60 mins",
            attendance: "Present",
            rating: 4,
            badge: "Critical Thinker",
            tutorNotes: "Crafted a strong thesis statement arguing the merits of renewable energy. Worked on structuring body paragraph 2 transitions.",
            homework: "Draft Outline Completed",
            nextSteps: "Finish draft essay conclusion paragraph."
          }
        ],
        reports: [
          {
            id: "rep-102-1",
            title: "Mid-Term Progress & Academic Mastery Report",
            period: "September - October 2026",
            issueDate: "2026-10-08",
            overallGrade: "A (93%)",
            attendanceRate: "100%",
            behaviorRating: "Dedicated & Focused",
            subjectEvaluations: [
              {
                subject: "Pre-Algebra",
                grade: "A (95%)",
                mastery: "Advanced",
                comment: "Excellent conceptual grasp of variable manipulation and algebraic properties."
              },
              {
                subject: "English Literature",
                grade: "A- (90%)",
                mastery: "Proficient",
                comment: "Demonstrates strong voice and clear argumentation. Developing deeper textual analysis skills."
              }
            ],
            strengths: [
              "High focus during independent problem drills",
              "Takes detailed notes and utilizes correction strategies effectively"
            ],
            areasForGrowth: [
              "Continue developing more nuanced transitions in analytical essays"
            ],
            tutorSummary: "Maya is a dedicated learner who approaches challenging subjects with enthusiasm and grit. Her algebra score has surged over the past 6 weeks!",
            teacherSignature: "Kimberly Hayes, M.Ed."
          }
        ],
        works: [
          {
            id: "wrk-102-1",
            title: "Two-Step Linear Equations Mastery Drill",
            subject: "Pre-Algebra",
            date: "2026-10-10",
            score: "100/100",
            imageUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800&auto=format&fit=crop&q=80",
            type: "Graded Quiz",
            feedback: "Super clean layout! Excellent application of the distributive property on problem 9."
          }
        ]
      },
      {
        id: "stu-103",
        pinCode: "5812",
        accessCode: "5812",
        fullName: "Ethan Thorne",
        preferredName: "Ethan",
        grade: "3rd Grade",
        subjects: ["Foundational Math", "Early Reading & Phonics"],
        parentName: "Marcus Thorne",
        parentPhone: "+1 (555) 723-5590",
        parentEmail: "marcus.thorne@example.com",
        enrolledDate: "2026-03-01",
        status: "Active",
        avatar: "https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=200&auto=format&fit=crop&q=80",
        learningGoals: "Master multiplication tables (1-10) and develop fluent paragraph reading speed with phonics blends.",
        sessions: [
          {
            id: "ses-103-1",
            date: "2026-10-11",
            subject: "Foundational Math",
            topic: "Multiplication Tables 6 and 7 Speed Drills & Array Games",
            duration: "45 mins",
            attendance: "Present",
            rating: 5,
            badge: "Speed Champion",
            tutorNotes: "Ethan scored 28/30 on his rapid flashcard test! His recall time improved by 40% compared to last week.",
            homework: "Flashcard practice 10 mins daily",
            nextSteps: "Introduce 8 and 9 multiplication patterns with fun finger math."
          }
        ],
        reports: [],
        works: [
          {
            id: "wrk-103-1",
            title: "Multiplication Array City Artwork & Math Calculation",
            subject: "Foundational Math",
            date: "2026-10-11",
            score: "10/10 Stars",
            imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&auto=format&fit=crop&q=80",
            type: "Creative Project",
            feedback: "Ethan built a beautiful skyline where windows formed multiplication arrays! Wonderful creativity."
          }
        ]
      }
    ],
    announcements: [
      {
        id: "ann-1",
        title: "Fall Academic Progress Reports Now Published",
        date: "2026-10-10",
        content: "Dear Parents, Term 1 Progress Reports have been finalized! You can view and download the official report card directly through your child's portal tab. Feel free to message with any questions.",
        category: "Academic",
        isPinned: true
      },
      {
        id: "ann-2",
        title: "Upcoming Holiday Center Schedule (Thanksgiving Recess)",
        date: "2026-10-05",
        content: "Please note that the learning center will be closed on Nov 26-27. Make-up sessions can be scheduled flexibly during the following Monday-Tuesday.",
        category: "Schedule",
        isPinned: false
      }
    ]
  };
}

function loadData() {
  try {
    if (!fs.existsSync(STORE_PATH)) {
      const initial = getInitialData();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    const raw = fs.readFileSync(STORE_PATH, 'utf8');
    const parsed = JSON.parse(raw);
    if (!parsed.students || !parsed.students[0] || !parsed.students[0].pinCode) {
      const initial = getInitialData();
      fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
      return initial;
    }
    return parsed;
  } catch (err) {
    const initial = getInitialData();
    fs.writeFileSync(STORE_PATH, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveData(data) {
  try {
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error saving store:', err);
    return false;
  }
}

// -------------------------------------------------------------
// ROUTES
// -------------------------------------------------------------

// Center Info & Teacher Auth
app.get('/api/center', (req, res) => {
  const data = loadData();
  const { passcode, ...publicInfo } = data.center;
  res.json({ success: true, center: publicInfo });
});

app.post('/api/auth/teacher', (req, res) => {
  const { passcode } = req.body;
  const data = loadData();
  if (data.center.passcode === (passcode || '').trim()) {
    return res.json({ success: true, tutorName: data.center.tutorName });
  }
  return res.status(401).json({ success: false, message: 'Incorrect teacher passcode' });
});

app.put('/api/center', (req, res) => {
  const data = loadData();
  data.center = { ...data.center, ...req.body };
  saveData(data);
  const { passcode, ...publicInfo } = data.center;
  res.json({ success: true, center: publicInfo });
});

// Parent Portal Lookup by PIN Code
app.get('/api/portal/:accessCode', (req, res) => {
  const inputPin = (req.params.accessCode || '').trim().toUpperCase();
  const data = loadData();
  const student = data.students.find(s => 
    (s.pinCode && s.pinCode.toUpperCase() === inputPin) ||
    (s.accessCode && s.accessCode.toUpperCase() === inputPin)
  );

  if (!student) {
    return res.status(404).json({
      success: false,
      message: 'No student found with this PIN Code. Please check with your teacher.'
    });
  }

  res.json({
    success: true,
    student,
    center: {
      name: data.center.name,
      tagline: data.center.tagline,
      tutorName: data.center.tutorName,
      tutorTitle: data.center.tutorTitle,
      email: data.center.email,
      phone: data.center.phone,
      activeTerm: data.center.activeTerm,
      address: data.center.address,
    },
    announcements: data.announcements || []
  });
});

// Student Management (Admin)
app.get('/api/students', (req, res) => {
  const data = loadData();
  res.json({ success: true, students: data.students });
});

app.post('/api/students', (req, res) => {
  const data = loadData();
  const {
    fullName,
    preferredName,
    grade,
    subjects,
    parentName,
    parentPhone,
    parentEmail,
    learningGoals,
    avatar,
    pinCode
  } = req.body;

  if (!fullName) {
    return res.status(400).json({ success: false, message: 'Student name is required' });
  }

  // Generate unique 4-digit numeric PIN code if not provided
  let pin = (pinCode || '').trim();
  if (!pin) {
    pin = String(Math.floor(1000 + Math.random() * 9000));
    while (data.students.some(s => s.pinCode === pin)) {
      pin = String(Math.floor(1000 + Math.random() * 9000));
    }
  }

  const newStudent = {
    id: `stu-${Date.now()}`,
    pinCode: pin,
    accessCode: pin,
    fullName: fullName.trim(),
    preferredName: (preferredName || fullName.split(' ')[0]).trim(),
    grade: grade || 'Grade 1',
    subjects: Array.isArray(subjects) ? subjects : (subjects ? subjects.split(',').map(s => s.trim()) : ['General Tutoring']),
    parentName: parentName || 'Parent / Guardian',
    parentPhone: parentPhone || '',
    parentEmail: parentEmail || '',
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    avatar: avatar || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80',
    learningGoals: learningGoals || 'Develop strong study habits and subject mastery.',
    sessions: [],
    reports: [],
    works: []
  };

  data.students.unshift(newStudent);
  saveData(data);
  res.status(201).json({ success: true, student: newStudent });
});

app.put('/api/students/:id', (req, res) => {
  const data = loadData();
  const idx = data.students.findIndex(s => s.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const updatedPin = req.body.pinCode || req.body.accessCode || data.students[idx].pinCode;

  data.students[idx] = {
    ...data.students[idx],
    ...req.body,
    pinCode: updatedPin,
    accessCode: updatedPin,
    id: data.students[idx].id
  };

  saveData(data);
  res.json({ success: true, student: data.students[idx] });
});

app.delete('/api/students/:id', (req, res) => {
  const data = loadData();
  data.students = data.students.filter(s => s.id !== req.params.id);
  saveData(data);
  res.json({ success: true, message: 'Student deleted' });
});

// Sessions
app.post('/api/students/:id/sessions', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { date, subject, topic, duration, attendance, rating, badge, tutorNotes, homework, nextSteps } = req.body;

  const newSession = {
    id: `ses-${Date.now()}`,
    date: date || new Date().toISOString().split('T')[0],
    subject: subject || student.subjects[0] || 'General Tutoring',
    topic: topic || 'Review & Core Exercises',
    duration: duration || '60 mins',
    attendance: attendance || 'Present',
    rating: Number(rating) || 5,
    badge: badge || 'Active Learner',
    tutorNotes: tutorNotes || 'Participated actively in class.',
    homework: homework || 'None assigned',
    nextSteps: nextSteps || ''
  };

  if (!student.sessions) student.sessions = [];
  student.sessions.unshift(newSession);

  saveData(data);
  res.status(201).json({ success: true, session: newSession, student });
});

app.put('/api/students/:studentId/sessions/:sessionId', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const sesIdx = (student.sessions || []).findIndex(s => s.id === req.params.sessionId);
  if (sesIdx === -1) return res.status(404).json({ success: false, message: 'Session not found' });

  student.sessions[sesIdx] = {
    ...student.sessions[sesIdx],
    ...req.body,
    id: student.sessions[sesIdx].id // preserve original session ID
  };

  saveData(data);
  res.json({ success: true, session: student.sessions[sesIdx], student });
});

app.delete('/api/students/:studentId/sessions/:sessionId', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  student.sessions = (student.sessions || []).filter(s => s.id !== req.params.sessionId);
  saveData(data);
  res.json({ success: true, message: 'Session deleted' });
});

// Comprehensive Progress Reports
app.post('/api/students/:id/reports', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const {
    title,
    period,
    overallGrade,
    attendanceRate,
    behaviorRating,
    subjectEvaluations,
    strengths,
    areasForGrowth,
    tutorSummary,
    teacherSignature
  } = req.body;

  const newReport = {
    id: `rep-${Date.now()}`,
    title: title || 'Term Progress Report Card',
    period: period || 'Current Term',
    issueDate: new Date().toISOString().split('T')[0],
    overallGrade: overallGrade || 'A (95%)',
    attendanceRate: attendanceRate || '100%',
    behaviorRating: behaviorRating || 'Exemplary',
    subjectEvaluations: subjectEvaluations || [],
    strengths: Array.isArray(strengths) ? strengths : (strengths ? strengths.split('\n').filter(Boolean) : []),
    areasForGrowth: Array.isArray(areasForGrowth) ? areasForGrowth : (areasForGrowth ? areasForGrowth.split('\n').filter(Boolean) : []),
    tutorSummary: tutorSummary || 'Student has shown consistent effort and wonderful improvement.',
    teacherSignature: teacherSignature || data.center.tutorName
  };

  if (!student.reports) student.reports = [];
  student.reports.unshift(newReport);

  saveData(data);
  res.status(201).json({ success: true, report: newReport, student });
});

app.delete('/api/students/:studentId/reports/:reportId', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  student.reports = (student.reports || []).filter(r => r.id !== req.params.reportId);
  saveData(data);
  res.json({ success: true, message: 'Report deleted' });
});

// Work Samples
app.post('/api/students/:id/works', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const { title, subject, date, score, imageUrl, type, feedback } = req.body;

  const newWork = {
    id: `wrk-${Date.now()}`,
    title: title || 'Completed Worksheet Sample',
    subject: subject || student.subjects[0] || 'General',
    date: date || new Date().toISOString().split('T')[0],
    score: score || 'Completed',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    type: type || 'Worksheet / Activity',
    feedback: feedback || 'Great effort and accurate answers.'
  };

  if (!student.works) student.works = [];
  student.works.unshift(newWork);

  saveData(data);
  res.status(201).json({ success: true, work: newWork, student });
});

app.delete('/api/students/:studentId/works/:workId', (req, res) => {
  const data = loadData();
  const student = data.students.find(s => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  student.works = (student.works || []).filter(w => w.id !== req.params.workId);
  saveData(data);
  res.json({ success: true, message: 'Work sample deleted' });
});

// File Upload
app.post('/api/upload', upload.single('file'), (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: 'No file uploaded' });
  res.json({
    success: true,
    fileUrl: `/uploads/${req.file.filename}`,
    filename: req.file.filename
  });
});

// Announcements
app.get('/api/announcements', (req, res) => {
  const data = loadData();
  res.json({ success: true, announcements: data.announcements || [] });
});

app.post('/api/announcements', (req, res) => {
  const data = loadData();
  const { title, content, category, isPinned } = req.body;
  if (!title || !content) return res.status(400).json({ success: false, message: 'Required fields missing' });

  const newAnn = {
    id: `ann-${Date.now()}`,
    title: title.trim(),
    content: content.trim(),
    date: new Date().toISOString().split('T')[0],
    category: category || 'General',
    isPinned: Boolean(isPinned)
  };

  if (!data.announcements) data.announcements = [];
  if (newAnn.isPinned) data.announcements.unshift(newAnn);
  else data.announcements.push(newAnn);

  saveData(data);
  res.status(201).json({ success: true, announcement: newAnn });
});

app.delete('/api/announcements/:id', (req, res) => {
  const data = loadData();
  data.announcements = (data.announcements || []).filter(a => a.id !== req.params.id);
  saveData(data);
  res.json({ success: true, message: 'Announcement deleted' });
});

// Static dist serving
const DIST_DIR = path.join(__dirname, '..', 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`🚀 Tutor & Student Report Backend running on http://localhost:${PORT}`);
});
