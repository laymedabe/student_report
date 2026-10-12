import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Storage fallback paths for local development
const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

// Supabase environment variables
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export let supabase = null;
if (isSupabaseConfigured) {
  supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  console.log('⚡ Connected to Supabase Cloud Database at:', SUPABASE_URL);
} else {
  console.log('📂 Running in Local Mode with store.json fallback (Set SUPABASE_URL & SUPABASE_KEY to activate cloud storage)');
}

// -------------------------------------------------------------
// LOCAL FALLBACK HELPERS
// -------------------------------------------------------------
function loadLocalData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(STORE_PATH)) return { center: {}, students: [], announcements: [] };
  try {
    return JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  } catch (err) {
    return { center: {}, students: [], announcements: [] };
  }
}

function saveLocalData(data) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// -------------------------------------------------------------
// CENTER & TEACHER AUTH
// -------------------------------------------------------------
export async function getCenterInfo() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase.from('centers').select('*').limit(1).single();
    if (error || !data) {
      return {
        name: "Apex Scholars Learning Center",
        tagline: "Empowering Minds, Inspiring Lifelong Academic Confidence",
        tutorName: "Teacher Kimberly Hayes, M.Ed.",
        tutorTitle: "Lead Academic Coach & Learning Specialist",
        phone: "+1 (555) 742-9918",
        email: "kimberly@apexscholars.edu",
        address: "842 Cambridge Avenue, Suite 400",
        activeTerm: "Fall / Winter 2026 Term"
      };
    }
    const { passcode, ...publicInfo } = data;
    return {
      id: data.id,
      name: data.name,
      tagline: data.tagline,
      tutorName: data.tutor_name,
      tutorTitle: data.tutor_title,
      phone: data.phone,
      email: data.email,
      address: data.address,
      activeTerm: data.active_term
    };
  }

  const data = loadLocalData();
  const { passcode, ...publicInfo } = data.center || {};
  return publicInfo;
}

export async function verifyTeacherPasscode(inputPasscode) {
  if (isSupabaseConfigured) {
    const { data } = await supabase.from('centers').select('passcode, tutor_name').limit(1).single();
    const valid = data && data.passcode === (inputPasscode || '').trim();
    return { valid, tutorName: data?.tutor_name || 'Teacher' };
  }

  const data = loadLocalData();
  const valid = (data.center?.passcode || '1234') === (inputPasscode || '').trim();
  return { valid, tutorName: data.center?.tutorName || 'Teacher' };
}

export async function updateCenterInfo(updateData) {
  if (isSupabaseConfigured) {
    const payload = {};
    if (updateData.name) payload.name = updateData.name;
    if (updateData.tagline) payload.tagline = updateData.tagline;
    if (updateData.tutorName) payload.tutor_name = updateData.tutorName;
    if (updateData.tutorTitle) payload.tutor_title = updateData.tutorTitle;
    if (updateData.phone) payload.phone = updateData.phone;
    if (updateData.email) payload.email = updateData.email;
    if (updateData.address) payload.address = updateData.address;
    if (updateData.activeTerm) payload.active_term = updateData.activeTerm;
    if (updateData.passcode) payload.passcode = updateData.passcode;

    const { data, error } = await supabase
      .from('centers')
      .update(payload)
      .eq('id', updateData.id || 'center-1')
      .select()
      .single();

    if (error) throw error;
    const { passcode, ...publicInfo } = data;
    return publicInfo;
  }

  const data = loadLocalData();
  data.center = { ...data.center, ...updateData };
  saveLocalData(data);
  const { passcode, ...publicInfo } = data.center;
  return publicInfo;
}

// -------------------------------------------------------------
// STUDENT & PARENT PORTAL
// -------------------------------------------------------------
export async function getStudentByPin(inputPin) {
  const pin = (inputPin || '').trim().toUpperCase();

  if (isSupabaseConfigured) {
    // Look up student
    const { data: student, error } = await supabase
      .from('students')
      .select('*')
      .or(`pin_code.eq.${pin},access_code.eq.${pin}`)
      .limit(1)
      .maybeSingle();

    if (error || !student) return null;

    // Fetch related sessions
    const { data: sessions } = await supabase
      .from('sessions')
      .select('*')
      .eq('student_id', student.id)
      .order('date', { ascending: false });

    // Fetch related reports
    const { data: reports } = await supabase
      .from('reports')
      .select('*')
      .eq('student_id', student.id)
      .order('issue_date', { ascending: false });

    return {
      id: student.id,
      pinCode: student.pin_code,
      accessCode: student.access_code || student.pin_code,
      fullName: student.full_name,
      preferredName: student.preferred_name,
      grade: student.grade,
      subjects: student.subjects || [],
      parentName: student.parent_name,
      parentPhone: student.parent_phone,
      parentEmail: student.parent_email,
      enrolledDate: student.enrolled_date,
      status: student.status,
      avatar: student.avatar,
      learningGoals: student.learning_goals,
      sessions: (sessions || []).map(s => ({
        id: s.id,
        date: s.date,
        subject: s.subject,
        topic: s.topic,
        duration: s.duration,
        attendance: s.attendance,
        rating: s.rating,
        badge: s.badge,
        tutorNotes: s.tutor_notes,
        homework: s.homework,
        nextSteps: s.next_steps
      })),
      reports: (reports || []).map(r => ({
        id: r.id,
        title: r.title,
        period: r.period,
        issueDate: r.issue_date,
        overallGrade: r.overall_grade,
        attendanceRate: r.attendance_rate,
        behaviorRating: r.behavior_rating,
        subjectEvaluations: r.subject_evaluations || [],
        strengths: r.strengths || [],
        areasForGrowth: r.areas_for_growth || [],
        tutorSummary: r.tutor_summary,
        teacherSignature: r.teacher_signature
      }))
    };
  }

  const data = loadLocalData();
  return data.students.find(s =>
    (s.pinCode && s.pinCode.toUpperCase() === pin) ||
    (s.accessCode && s.accessCode.toUpperCase() === pin)
  ) || null;
}

export async function getAllStudents() {
  if (isSupabaseConfigured) {
    const { data: students, error } = await supabase
      .from('students')
      .select(`
        *,
        sessions (*),
        reports (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (students || []).map(student => ({
      id: student.id,
      pinCode: student.pin_code,
      accessCode: student.access_code || student.pin_code,
      fullName: student.full_name,
      preferredName: student.preferred_name,
      grade: student.grade,
      subjects: student.subjects || [],
      parentName: student.parent_name,
      parentPhone: student.parent_phone,
      parentEmail: student.parent_email,
      enrolledDate: student.enrolled_date,
      status: student.status,
      avatar: student.avatar,
      learningGoals: student.learning_goals,
      sessions: (student.sessions || []).map(s => ({
        id: s.id,
        date: s.date,
        subject: s.subject,
        topic: s.topic,
        duration: s.duration,
        attendance: s.attendance,
        rating: s.rating,
        badge: s.badge,
        tutorNotes: s.tutor_notes,
        homework: s.homework,
        nextSteps: s.next_steps
      })),
      reports: (student.reports || []).map(r => ({
        id: r.id,
        title: r.title,
        period: r.period,
        issueDate: r.issue_date,
        overallGrade: r.overall_grade,
        attendanceRate: r.attendance_rate,
        behaviorRating: r.behavior_rating,
        subjectEvaluations: r.subject_evaluations || [],
        strengths: r.strengths || [],
        areasForGrowth: r.areas_for_growth || [],
        tutorSummary: r.tutor_summary,
        teacherSignature: r.teacher_signature
      }))
    }));
  }

  const data = loadLocalData();
  return data.students || [];
}

export async function createStudent(studentData) {
  let pin = (studentData.pinCode || '').trim();
  
  if (isSupabaseConfigured) {
    if (!pin) {
      pin = String(Math.floor(1000 + Math.random() * 9000));
    }

    const newStudent = {
      id: `stu-${Date.now()}`,
      pin_code: pin,
      access_code: pin,
      full_name: studentData.fullName.trim(),
      preferred_name: (studentData.preferredName || studentData.fullName.split(' ')[0]).trim(),
      grade: studentData.grade || 'Grade 1',
      subjects: Array.isArray(studentData.subjects) 
        ? studentData.subjects 
        : (studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()) : ['General Tutoring']),
      parent_name: studentData.parentName || 'Parent / Guardian',
      parent_phone: studentData.parentPhone || '',
      parent_email: studentData.parentEmail || '',
      enrolled_date: new Date().toISOString().split('T')[0],
      status: 'Active',
      avatar: studentData.avatar || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80',
      learning_goals: studentData.learningGoals || 'Develop strong study habits and subject mastery.'
    };

    const { data, error } = await supabase.from('students').insert([newStudent]).select().single();
    if (error) throw error;

    return {
      ...newStudent,
      pinCode: newStudent.pin_code,
      accessCode: newStudent.access_code,
      fullName: newStudent.full_name,
      preferredName: newStudent.preferred_name,
      parentName: newStudent.parent_name,
      parentPhone: newStudent.parent_phone,
      parentEmail: newStudent.parent_email,
      enrolledDate: newStudent.enrolled_date,
      learningGoals: newStudent.learning_goals,
      sessions: [],
      reports: []
    };
  }

  const data = loadLocalData();
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
    fullName: studentData.fullName.trim(),
    preferredName: (studentData.preferredName || studentData.fullName.split(' ')[0]).trim(),
    grade: studentData.grade || 'Grade 1',
    subjects: Array.isArray(studentData.subjects) ? studentData.subjects : (studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()) : ['General Tutoring']),
    parentName: studentData.parentName || 'Parent / Guardian',
    parentPhone: studentData.parentPhone || '',
    parentEmail: studentData.parentEmail || '',
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    avatar: studentData.avatar || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80',
    learningGoals: studentData.learningGoals || 'Develop strong study habits and subject mastery.',
    sessions: [],
    reports: []
  };

  data.students.unshift(newStudent);
  saveLocalData(data);
  return newStudent;
}

export async function updateStudent(id, studentData) {
  if (isSupabaseConfigured) {
    const payload = {};
    if (studentData.fullName) payload.full_name = studentData.fullName;
    if (studentData.preferredName) payload.preferred_name = studentData.preferredName;
    if (studentData.grade) payload.grade = studentData.grade;
    if (studentData.subjects) payload.subjects = studentData.subjects;
    if (studentData.parentName) payload.parent_name = studentData.parentName;
    if (studentData.parentPhone) payload.parent_phone = studentData.parentPhone;
    if (studentData.parentEmail) payload.parent_email = studentData.parentEmail;
    if (studentData.status) payload.status = studentData.status;
    if (studentData.learningGoals) payload.learning_goals = studentData.learningGoals;
    if (studentData.pinCode) {
      payload.pin_code = studentData.pinCode;
      payload.access_code = studentData.pinCode;
    }

    const { data, error } = await supabase.from('students').update(payload).eq('id', id).select().single();
    if (error) throw error;
    return data;
  }

  const data = loadLocalData();
  const idx = data.students.findIndex(s => s.id === id);
  if (idx === -1) return null;

  const updatedPin = studentData.pinCode || studentData.accessCode || data.students[idx].pinCode;
  data.students[idx] = {
    ...data.students[idx],
    ...studentData,
    pinCode: updatedPin,
    accessCode: updatedPin,
    id: data.students[idx].id
  };
  saveLocalData(data);
  return data.students[idx];
}

export async function deleteStudent(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('students').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const data = loadLocalData();
  data.students = data.students.filter(s => s.id !== id);
  saveLocalData(data);
  return true;
}

// -------------------------------------------------------------
// SESSIONS
// -------------------------------------------------------------
export async function createSession(studentId, sessionData) {
  const newSession = {
    id: `ses-${Date.now()}`,
    date: sessionData.date || new Date().toISOString().split('T')[0],
    subject: sessionData.subject || 'Mathematics',
    topic: sessionData.topic || 'Review & Core Exercises',
    duration: sessionData.duration || '60 mins',
    attendance: sessionData.attendance || 'Present',
    rating: Number(sessionData.rating) || 5,
    badge: sessionData.badge || 'Star Problem Solver',
    tutorNotes: sessionData.tutorNotes || 'Participated actively in class.',
    homework: sessionData.homework || 'Completed - 100%',
    nextSteps: sessionData.nextSteps || ''
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('sessions').insert([{
      id: newSession.id,
      student_id: studentId,
      date: newSession.date,
      subject: newSession.subject,
      topic: newSession.topic,
      duration: newSession.duration,
      attendance: newSession.attendance,
      rating: newSession.rating,
      badge: newSession.badge,
      tutor_notes: newSession.tutorNotes,
      homework: newSession.homework,
      next_steps: newSession.nextSteps
    }]);

    if (error) throw error;
    return newSession;
  }

  const data = loadLocalData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return null;
  if (!student.sessions) student.sessions = [];
  student.sessions.unshift(newSession);
  saveLocalData(data);
  return newSession;
}

export async function updateSession(studentId, sessionId, sessionData) {
  if (isSupabaseConfigured) {
    const payload = {};
    if (sessionData.date) payload.date = sessionData.date;
    if (sessionData.subject) payload.subject = sessionData.subject;
    if (sessionData.topic) payload.topic = sessionData.topic;
    if (sessionData.duration) payload.duration = sessionData.duration;
    if (sessionData.attendance) payload.attendance = sessionData.attendance;
    if (sessionData.rating !== undefined) payload.rating = Number(sessionData.rating);
    if (sessionData.badge) payload.badge = sessionData.badge;
    if (sessionData.tutorNotes) payload.tutor_notes = sessionData.tutorNotes;
    if (sessionData.homework) payload.homework = sessionData.homework;
    if (sessionData.nextSteps !== undefined) payload.next_steps = sessionData.nextSteps;

    const { data, error } = await supabase
      .from('sessions')
      .update(payload)
      .eq('id', sessionId)
      .eq('student_id', studentId)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      date: data.date,
      subject: data.subject,
      topic: data.topic,
      duration: data.duration,
      attendance: data.attendance,
      rating: data.rating,
      badge: data.badge,
      tutorNotes: data.tutor_notes,
      homework: data.homework,
      nextSteps: data.next_steps
    };
  }

  const data = loadLocalData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return null;
  const idx = (student.sessions || []).findIndex(s => s.id === sessionId);
  if (idx === -1) return null;

  student.sessions[idx] = {
    ...student.sessions[idx],
    ...sessionData,
    id: sessionId
  };
  saveLocalData(data);
  return student.sessions[idx];
}

export async function deleteSession(studentId, sessionId) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('student_id', studentId);

    if (error) throw error;
    return true;
  }

  const data = loadLocalData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return false;
  student.sessions = (student.sessions || []).filter(s => s.id !== sessionId);
  saveLocalData(data);
  return true;
}

// -------------------------------------------------------------
// PROGRESS REPORTS
// -------------------------------------------------------------
export async function createReport(studentId, reportData) {
  const newReport = {
    id: `rep-${Date.now()}`,
    title: reportData.title || 'Term Progress Report Card',
    period: reportData.period || 'Current Term',
    issueDate: new Date().toISOString().split('T')[0],
    overallGrade: reportData.overallGrade || 'A (95%)',
    attendanceRate: reportData.attendanceRate || '100%',
    behaviorRating: reportData.behaviorRating || 'Exemplary',
    subjectEvaluations: reportData.subjectEvaluations || [],
    strengths: Array.isArray(reportData.strengths) ? reportData.strengths : (reportData.strengths ? reportData.strengths.split('\n').filter(Boolean) : []),
    areasForGrowth: Array.isArray(reportData.areasForGrowth) ? reportData.areasForGrowth : (reportData.areasForGrowth ? reportData.areasForGrowth.split('\n').filter(Boolean) : []),
    tutorSummary: reportData.tutorSummary || 'Student has shown consistent effort and wonderful improvement.',
    teacherSignature: reportData.teacherSignature || 'Teacher Kimberly Hayes, M.Ed.'
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('reports').insert([{
      id: newReport.id,
      student_id: studentId,
      title: newReport.title,
      period: newReport.period,
      issue_date: newReport.issueDate,
      overall_grade: newReport.overallGrade,
      attendance_rate: newReport.attendanceRate,
      behavior_rating: newReport.behaviorRating,
      subject_evaluations: newReport.subjectEvaluations,
      strengths: newReport.strengths,
      areas_for_growth: newReport.areasForGrowth,
      tutor_summary: newReport.tutorSummary,
      teacher_signature: newReport.teacherSignature
    }]);

    if (error) throw error;
    return newReport;
  }

  const data = loadLocalData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return null;
  if (!student.reports) student.reports = [];
  student.reports.unshift(newReport);
  saveLocalData(data);
  return newReport;
}

export async function deleteReport(studentId, reportId) {
  if (isSupabaseConfigured) {
    const { error } = await supabase
      .from('reports')
      .delete()
      .eq('id', reportId)
      .eq('student_id', studentId);

    if (error) throw error;
    return true;
  }

  const data = loadLocalData();
  const student = data.students.find(s => s.id === studentId);
  if (!student) return false;
  student.reports = (student.reports || []).filter(r => r.id !== reportId);
  saveLocalData(data);
  return true;
}

// -------------------------------------------------------------
// ANNOUNCEMENTS
// -------------------------------------------------------------
export async function getAnnouncements() {
  if (isSupabaseConfigured) {
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) return [];
    return (data || []).map(a => ({
      id: a.id,
      title: a.title,
      content: a.content,
      date: a.date,
      category: a.category,
      isPinned: a.is_pinned
    }));
  }

  const data = loadLocalData();
  return data.announcements || [];
}

export async function createAnnouncement(annData) {
  const newAnn = {
    id: `ann-${Date.now()}`,
    title: annData.title.trim(),
    content: annData.content.trim(),
    date: new Date().toISOString().split('T')[0],
    category: annData.category || 'General',
    isPinned: Boolean(annData.isPinned)
  };

  if (isSupabaseConfigured) {
    const { error } = await supabase.from('announcements').insert([{
      id: newAnn.id,
      title: newAnn.title,
      content: newAnn.content,
      date: newAnn.date,
      category: newAnn.category,
      is_pinned: newAnn.isPinned
    }]);

    if (error) throw error;
    return newAnn;
  }

  const data = loadLocalData();
  if (!data.announcements) data.announcements = [];
  if (newAnn.isPinned) data.announcements.unshift(newAnn);
  else data.announcements.push(newAnn);
  saveLocalData(data);
  return newAnn;
}

export async function deleteAnnouncement(id) {
  if (isSupabaseConfigured) {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) throw error;
    return true;
  }

  const data = loadLocalData();
  data.announcements = (data.announcements || []).filter(a => a.id !== id);
  saveLocalData(data);
  return true;
}
