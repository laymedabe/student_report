import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serverless detection (Vercel, AWS Lambda)
const IS_SERVERLESS = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);

// Storage fallback paths: in serverless (like Vercel), only os.tmpdir() is writable
const BUNDLED_STORE_PATH = path.join(__dirname, 'data', 'store.json');
const DATA_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), 'apex_data') : path.join(__dirname, 'data');
const STORE_PATH = IS_SERVERLESS ? path.join(DATA_DIR, 'store.json') : BUNDLED_STORE_PATH;
const UPLOADS_DIR = IS_SERVERLESS ? path.join(os.tmpdir(), 'apex_uploads') : path.join(__dirname, 'uploads');

try {
  if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
} catch (_) { }

export function saveBase64Avatar(avatarString) {
  if (!avatarString || typeof avatarString !== 'string' || !avatarString.startsWith('data:image')) {
    return avatarString;
  }
  try {
    const matches = avatarString.match(/^data:image\/([a-zA-Z0-9+]+);base64,(.+)$/);
    if (!matches) return avatarString;
    const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
    const buffer = Buffer.from(matches[2], 'base64');
    const filename = `avatar-${Date.now()}-${Math.round(Math.random() * 1e6)}.${ext}`;
    if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    fs.writeFileSync(path.join(UPLOADS_DIR, filename), buffer);
    return `/uploads/${filename}`;
  } catch (err) {
    console.warn('Notice: Base64 avatar disk save skipped:', err.message);
    return avatarString.length > 500000
      ? 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80'
      : avatarString;
  }
}

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
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(STORE_PATH)) {
      if (fs.existsSync(BUNDLED_STORE_PATH)) {
        const initial = fs.readFileSync(BUNDLED_STORE_PATH, 'utf8');
        try { fs.writeFileSync(STORE_PATH, initial, 'utf8'); } catch (_) {}
        return JSON.parse(initial);
      }
      return { center: {}, teachers: [], students: [], announcements: [] };
    }
    const data = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
    if (!data.teachers) data.teachers = [];
    if (!data.students) data.students = [];
    return data;
  } catch (err) {
    if (fs.existsSync(BUNDLED_STORE_PATH)) {
      try {
        return JSON.parse(fs.readFileSync(BUNDLED_STORE_PATH, 'utf8'));
      } catch (_) {}
    }
    return { center: {}, teachers: [], students: [], announcements: [] };
  }
}

function saveLocalData(data) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    fs.writeFileSync(STORE_PATH, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.warn('Notice: Local storage write skipped (read-only environment):', err.message);
  }
}

// -------------------------------------------------------------
// TEACHERS MANAGEMENT & MULTI-TEACHER AUTH
// -------------------------------------------------------------
export async function getAllTeachers() {
  const localData = loadLocalData();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('teachers').select('*').order('created_at', { ascending: true });
      if (!error && data && data.length > 0) {
        return data.map(t => ({
          id: t.id,
          name: t.name,
          email: t.email,
          phone: t.phone,
          avatar: t.avatar,
          centerName: t.center_name,
          createdAt: t.created_at
        }));
      }
    } catch (_) { }
  }
  return (localData.teachers || []).map(t => {
    const { passcode, ...rest } = t;
    return rest;
  });
}

export async function getTeacherById(teacherId) {
  const localData = loadLocalData();
  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase.from('teachers').select('*').eq('id', teacherId).maybeSingle();
      if (!error && data) {
        const { passcode, ...publicInfo } = data;
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          avatar: data.avatar,
          centerName: data.center_name,
          createdAt: data.created_at
        };
      }
    } catch (_) { }
  }

  const teacher = (localData.teachers || []).find(t => t.id === teacherId);
  if (teacher) {
    const { passcode, ...publicInfo } = teacher;
    return publicInfo;
  }

  // Fallback to center profile
  return {
    id: 'teacher-1',
    name: localData.center?.tutorName || 'Sir Kleeser',
    email: localData.center?.email || 'sample@email.com',
    phone: localData.center?.phone || '',
    avatar: localData.center?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    centerName: localData.center?.name || 'skwelahan ni kleeser'
  };
}

export async function verifyTeacherAuth(email, inputPasscode) {
  const cleanPasscode = (inputPasscode || '').trim();
  const cleanEmail = (email || '').trim().toLowerCase();
  const localData = loadLocalData();

  if (isSupabaseConfigured) {
    try {
      let query = supabase.from('teachers').select('*');
      if (cleanEmail) {
        query = query.ilike('email', cleanEmail);
      }
      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        const match = data.find(t => t.passcode === cleanPasscode);
        if (match) {
          const { passcode: _, ...publicInfo } = match;
          return {
            valid: true,
            teacher: {
              id: match.id,
              name: match.name,
              email: match.email,
              phone: match.phone,
              avatar: match.avatar,
              centerName: match.center_name,
              createdAt: match.created_at
            }
          };
        }
      }
    } catch (_) { }
  }

  // Local fallback check
  const teachers = localData.teachers || [];
  let foundTeacher = null;

  if (cleanEmail) {
    foundTeacher = teachers.find(t => t.email?.toLowerCase() === cleanEmail && t.passcode === cleanPasscode);
  } else {
    // Passcode only match (legacy demo)
    foundTeacher = teachers.find(t => t.passcode === cleanPasscode);
  }

  if (foundTeacher) {
    const { passcode: _, ...publicInfo } = foundTeacher;
    return { valid: true, teacher: publicInfo };
  }

  // Legacy center passcode fallback
  const centerPass = (localData.center?.passcode || '1234').trim();
  if (cleanPasscode === centerPass) {
    return {
      valid: true,
      teacher: {
        id: 'teacher-1',
        name: localData.center?.tutorName || 'Sir Kleeser',
        email: cleanEmail || localData.center?.email || 'sample@email.com',
        avatar: localData.center?.avatar,
        centerName: localData.center?.name || 'skwelahan ni kleeser'
      }
    };
  }

  return { valid: false, message: 'Invalid email or passcode' };
}

export async function registerTeacher(teacherData) {
  const email = (teacherData.email || '').trim().toLowerCase();
  const name = (teacherData.name || '').trim();
  const passcode = (teacherData.passcode || '').trim();
  const centerName = (teacherData.centerName || teacherData.schoolName || 'Learning Center').trim();
  const avatar = teacherData.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80';
  const phone = (teacherData.phone || '').trim();

  if (!email || !name || !passcode) {
    throw new Error('Name, email, and passcode are required');
  }

  const localData = loadLocalData();
  if (!localData.teachers) localData.teachers = [];

  if (localData.teachers.some(t => t.email?.toLowerCase() === email)) {
    throw new Error('An account with this email already exists.');
  }

  const newTeacher = {
    id: `teacher-${Date.now()}`,
    name,
    email,
    passcode,
    phone,
    avatar,
    centerName,
    createdAt: new Date().toISOString()
  };

  if (isSupabaseConfigured) {
    try {
      const payload = {
        id: newTeacher.id,
        name: newTeacher.name,
        email: newTeacher.email,
        passcode: newTeacher.passcode,
        phone: newTeacher.phone,
        avatar: newTeacher.avatar,
        center_name: newTeacher.centerName
      };
      const { error } = await supabase.from('teachers').insert([payload]);
      if (error && error.code === '23505') {
        throw new Error('An account with this email already exists.');
      }
    } catch (err) {
      if (err.message?.includes('already exists')) throw err;
    }
  }

  localData.teachers.push(newTeacher);
  saveLocalData(localData);

  const { passcode: _, ...publicInfo } = newTeacher;
  return publicInfo;
}

export async function updateTeacherProfile(teacherId, updateData) {
  const localData = loadLocalData();
  if (!localData.teachers) localData.teachers = [];
  const idx = localData.teachers.findIndex(t => t.id === teacherId);

  let updatedRecord = null;
  if (idx !== -1) {
    localData.teachers[idx] = { ...localData.teachers[idx], ...updateData };
    saveLocalData(localData);
    updatedRecord = localData.teachers[idx];
  }

  if (isSupabaseConfigured) {
    try {
      const payload = {};
      if (updateData.name) payload.name = updateData.name;
      if (updateData.email) payload.email = updateData.email;
      if (updateData.passcode) payload.passcode = updateData.passcode;
      if (updateData.phone !== undefined) payload.phone = updateData.phone;
      if (updateData.avatar) payload.avatar = updateData.avatar;
      if (updateData.centerName) payload.center_name = updateData.centerName;

      await supabase.from('teachers').update(payload).eq('id', teacherId);
    } catch (_) { }
  }

  if (updatedRecord) {
    const { passcode, ...publicInfo } = updatedRecord;
    return publicInfo;
  }
  return { id: teacherId, ...updateData };
}

// Legacy helper for single-passcode verify
export async function verifyTeacherPasscode(inputPasscode) {
  const result = await verifyTeacherAuth(null, inputPasscode);
  return { valid: result.valid, tutorName: result.teacher?.name || 'Teacher' };
}

export async function getCenterInfo() {
  const localData = loadLocalData();

  if (isSupabaseConfigured) {
    try {
      const { data, error } = await supabase
        .from('centers')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        const { passcode, ...publicInfo } = data;
        return {
          id: data.id || 'center-1',
          name: data.name || localData.center?.name || 'skwelahan ni kleeser',
          tagline: data.tagline || localData.center?.tagline || 'Empowering Minds, Inspiring Lifelong Academic Confidence',
          tutorName: data.tutor_name || localData.center?.tutorName || 'Sir Kleeser',
          tutorTitle: data.tutor_title || localData.center?.tutorTitle || 'Lead Academic Coach',
          phone: data.phone || localData.center?.phone || '',
          email: data.email || localData.center?.email || 'sample@email.com',
          address: data.address || localData.center?.address || 'Sambag jaro',
          activeTerm: data.active_term || localData.center?.activeTerm || '2026 Term',
          avatar: localData.center?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
        };
      }
    } catch (_) { }
  }

  const center = localData.center || {};
  const { passcode, ...publicInfo } = center;
  return {
    id: center.id || 'center-1',
    name: center.name || 'skwelahan ni kleeser',
    tagline: center.tagline || 'Empowering Minds, Inspiring Lifelong Academic Confidence',
    tutorName: center.tutorName || 'Sir Kleeser',
    tutorTitle: center.tutorTitle || 'Lead Academic Coach',
    phone: center.phone || '',
    email: center.email || 'sample@email.com',
    address: center.address || 'Sambag jaro',
    activeTerm: center.activeTerm || '2026 Term',
    avatar: center.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
  };
}

export async function updateCenterInfo(updateData) {
  // Always synchronize to local storage
  const localData = loadLocalData();
  localData.center = { ...localData.center, ...updateData };
  saveLocalData(localData);

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
    return {
      ...publicInfo,
      avatar: updateData.avatar || localData.center?.avatar
    };
  }

  const { passcode, ...publicInfo } = localData.center;
  return publicInfo;
}

// -------------------------------------------------------------
// STUDENT & PARENT PORTAL
// -------------------------------------------------------------
export async function getStudentByPin(inputPin) {
  const pin = (inputPin || '').trim().toUpperCase();
  const localData = loadLocalData();

  if (isSupabaseConfigured) {
    try {
      // Look up student in Supabase
      const { data: student, error } = await supabase
        .from('students')
        .select('*')
        .or(`pin_code.eq.${pin},access_code.eq.${pin}`)
        .limit(1)
        .maybeSingle();

      if (!error && student) {
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

        const localRec = (localData.students || []).find(ls => ls.id === student.id);
        const monthlyQuota = student.monthly_sessions !== undefined && student.monthly_sessions !== null
          ? Number(student.monthly_sessions)
          : (localRec?.monthlySessions !== undefined ? Number(localRec.monthlySessions) : 12);

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
          monthlySessions: monthlyQuota,
          teacherId: student.teacher_id || 'teacher-1',
          teacher: await getTeacherById(student.teacher_id || 'teacher-1'),
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
    } catch (_) { }
  }

  // Fallback to local store.json
  const student = (localData.students || []).find(s =>
    (s.pinCode && s.pinCode.toUpperCase() === pin) ||
    (s.accessCode && s.accessCode.toUpperCase() === pin)
  );
  if (!student) return null;

  const teacher = await getTeacherById(student.teacherId || 'teacher-1');
  return {
    ...student,
    monthlySessions: student.monthlySessions !== undefined ? Number(student.monthlySessions) : 12,
    teacherId: student.teacherId || 'teacher-1',
    teacher
  };
}

export async function getAllStudents(teacherId) {
  const localData = loadLocalData();

  if (isSupabaseConfigured) {
    try {
      let query = supabase
        .from('students')
        .select(`
          *,
          sessions (*),
          reports (*)
        `)
        .order('created_at', { ascending: false });

      if (teacherId) {
        if (teacherId === 'teacher-1') {
          query = query.or(`teacher_id.eq.${teacherId},teacher_id.is.null`);
        } else {
          query = query.eq('teacher_id', teacherId);
        }
      }

      let { data: students, error } = await query;

      // If teacher_id column doesn't exist yet on Supabase, fallback query all students
      if (error && error.message?.includes('teacher_id')) {
        const fallbackRes = await supabase
          .from('students')
          .select(`*, sessions (*), reports (*)`)
          .order('created_at', { ascending: false });
        students = fallbackRes.data;
        error = fallbackRes.error;
      }

      if (!error && students) {
        const mapped = (students || []).map(student => {
          const localRec = (localData.students || []).find(ls => ls.id === student.id);
          const monthlyQuota = student.monthly_sessions !== undefined && student.monthly_sessions !== null
            ? Number(student.monthly_sessions)
            : (localRec?.monthlySessions !== undefined ? Number(localRec.monthlySessions) : 12);

          return {
            id: student.id,
            teacherId: student.teacher_id || localRec?.teacherId || 'teacher-1',
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
            monthlySessions: monthlyQuota,
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
          };
        });

        // Merge any local students that aren't yet in Supabase
        const remoteIds = new Set(mapped.map(s => s.id));
        const remotePins = new Set(mapped.map(s => s.pinCode));
        for (const localStu of (localData.students || [])) {
          if (!remoteIds.has(localStu.id) && !remotePins.has(localStu.pinCode)) {
            mapped.push({
              ...localStu,
              monthlySessions: localStu.monthlySessions !== undefined ? Number(localStu.monthlySessions) : 12,
              teacherId: localStu.teacherId || 'teacher-1',
              sessions: localStu.sessions || [],
              reports: localStu.reports || []
            });
          }
        }

        if (teacherId) {
          return mapped.filter(s => s.teacherId === teacherId);
        }
        return mapped;
      }
    } catch (_) { }
  }

  const list = (localData.students || []).map(s => ({
    ...s,
    monthlySessions: s.monthlySessions !== undefined ? Number(s.monthlySessions) : 12,
    teacherId: s.teacherId || 'teacher-1'
  }));
  if (teacherId) {
    return list.filter(s => s.teacherId === teacherId);
  }
  return list;
}

export async function createStudent(studentData) {
  let pin = (studentData.pinCode || '').trim();
  const assignedTeacherId = studentData.teacherId || 'teacher-1';
  const monthlySessions = Number(studentData.monthlySessions) > 0 ? Number(studentData.monthlySessions) : 12;
  const processedAvatar = saveBase64Avatar(studentData.avatar) || 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80';

  const localData = loadLocalData();
  if (!localData.students) localData.students = [];

  // Validate or generate unique PIN
  if (pin) {
    const existingLocal = localData.students.find(s => s.pinCode === pin || s.accessCode === pin);
    if (existingLocal) {
      throw new Error(`Student PIN "${pin}" is already used by ${existingLocal.fullName || 'another student'}. Please choose a different PIN.`);
    }
  } else {
    pin = String(Math.floor(1000 + Math.random() * 9000));
    while (localData.students.some(s => s.pinCode === pin || s.accessCode === pin)) {
      pin = String(Math.floor(1000 + Math.random() * 9000));
    }
  }

  const studentRecord = {
    id: `stu-${Date.now()}`,
    teacherId: assignedTeacherId,
    pinCode: pin,
    accessCode: pin,
    fullName: (studentData.fullName || '').trim(),
    preferredName: (studentData.preferredName || studentData.fullName?.split(' ')[0] || '').trim(),
    grade: studentData.grade || 'Grade 1',
    subjects: Array.isArray(studentData.subjects)
      ? studentData.subjects
      : (studentData.subjects ? studentData.subjects.split(',').map(s => s.trim()).filter(Boolean) : ['General Tutoring']),
    parentName: studentData.parentName || 'Parent / Guardian',
    parentPhone: studentData.parentPhone || '',
    parentEmail: studentData.parentEmail || '',
    enrolledDate: new Date().toISOString().split('T')[0],
    status: 'Active',
    avatar: processedAvatar,
    learningGoals: studentData.learningGoals || 'Develop strong study habits and subject mastery.',
    monthlySessions: monthlySessions,
    sessions: [],
    reports: []
  };

  // Attempt Supabase insert if configured
  if (isSupabaseConfigured) {
    try {
      const supabasePayload = {
        id: studentRecord.id,
        teacher_id: assignedTeacherId,
        pin_code: studentRecord.pinCode,
        access_code: studentRecord.accessCode,
        full_name: studentRecord.fullName,
        preferred_name: studentRecord.preferredName,
        grade: studentRecord.grade,
        subjects: studentRecord.subjects,
        parent_name: studentRecord.parentName,
        parent_phone: studentRecord.parentPhone,
        parent_email: studentRecord.parentEmail,
        enrolled_date: studentRecord.enrolledDate,
        status: studentRecord.status,
        avatar: studentRecord.avatar,
        learning_goals: studentRecord.learningGoals
      };

      let { data, error } = await supabase.from('students').insert([supabasePayload]).select().single();

      if (error && (error.code === '23503' || error.message?.includes('teacher_id'))) {
        delete supabasePayload.teacher_id;
        const retry = await supabase.from('students').insert([supabasePayload]).select().single();
        data = retry.data;
        error = retry.error;
      }

      if (error && error.code === '23505') {
        throw new Error(`Student PIN "${pin}" is already registered in the database. Please choose a different PIN.`);
      }

      if (error) {
        console.warn('Supabase student insert notice (persisting locally):', error.message || error);
      }
    } catch (err) {
      if (err.message?.includes('already registered') || err.message?.includes('already used')) {
        throw err;
      }
      console.warn('Supabase student insert error (persisting locally):', err.message || err);
    }
  }

  // Always save locally to ensure 100% persistence
  localData.students.unshift(studentRecord);
  saveLocalData(localData);

  return studentRecord;
}

export async function updateStudent(id, studentData) {
  const targetMonthly = studentData.monthlySessions !== undefined
    ? (Number(studentData.monthlySessions) > 0 ? Number(studentData.monthlySessions) : 12)
    : undefined;

  const processedAvatar = studentData.avatar ? saveBase64Avatar(studentData.avatar) : undefined;
  let updatedStudent = null;

  if (isSupabaseConfigured) {
    const payload = {};
    if (studentData.fullName) payload.full_name = studentData.fullName.trim();
    if (studentData.preferredName !== undefined) payload.preferred_name = studentData.preferredName.trim();
    if (studentData.grade !== undefined) payload.grade = studentData.grade;
    if (studentData.subjects !== undefined) {
      payload.subjects = Array.isArray(studentData.subjects)
        ? studentData.subjects
        : (typeof studentData.subjects === 'string' ? studentData.subjects.split(',').map(s => s.trim()).filter(Boolean) : studentData.subjects);
    }
    if (studentData.parentName !== undefined) payload.parent_name = studentData.parentName;
    if (studentData.parentPhone !== undefined) payload.parent_phone = studentData.parentPhone;
    if (studentData.parentEmail !== undefined) payload.parent_email = studentData.parentEmail;
    if (studentData.status !== undefined) payload.status = studentData.status;
    if (studentData.learningGoals !== undefined) payload.learning_goals = studentData.learningGoals;
    if (processedAvatar !== undefined) payload.avatar = processedAvatar;
    if (studentData.pinCode) {
      payload.pin_code = studentData.pinCode.trim();
      payload.access_code = studentData.pinCode.trim();
    }

    try {
      if (Object.keys(payload).length > 0) {
        let { data, error } = await supabase.from('students').update(payload).eq('id', id).select();
        if (!error && data && data.length > 0) {
          const row = data[0];
          updatedStudent = {
            ...row,
            pinCode: row.pin_code,
            accessCode: row.access_code,
            fullName: row.full_name,
            preferredName: row.preferred_name,
            parentName: row.parent_name,
            parentPhone: row.parent_phone,
            parentEmail: row.parent_email,
            enrolledDate: row.enrolled_date,
            learningGoals: row.learning_goals,
            monthlySessions: targetMonthly !== undefined ? targetMonthly : (row.monthly_sessions || 12)
          };
        }
      }
    } catch (_) {}
  }

  // Update in local store.json
  const data = loadLocalData();
  if (!data.students) data.students = [];
  const idx = data.students.findIndex(s => s.id === id);

  const subjects = studentData.subjects !== undefined
    ? (Array.isArray(studentData.subjects) ? studentData.subjects : (typeof studentData.subjects === 'string' ? studentData.subjects.split(',').map(s => s.trim()).filter(Boolean) : studentData.subjects))
    : (idx !== -1 ? data.students[idx].subjects : ['General Tutoring']);

  const updatedPin = studentData.pinCode || studentData.accessCode || (idx !== -1 ? data.students[idx].pinCode : '');

  const localRecord = {
    ...(idx !== -1 ? data.students[idx] : {}),
    ...(updatedStudent || {}),
    ...studentData,
    avatar: processedAvatar || (idx !== -1 ? data.students[idx].avatar : studentData.avatar),
    subjects,
    pinCode: updatedPin,
    accessCode: updatedPin,
    monthlySessions: targetMonthly !== undefined ? targetMonthly : (idx !== -1 ? (data.students[idx].monthlySessions || 12) : 12),
    id
  };

  if (idx !== -1) {
    data.students[idx] = localRecord;
  } else {
    data.students.push(localRecord);
  }
  saveLocalData(data);

  return localRecord;
}

export async function deleteStudent(id) {
  if (isSupabaseConfigured) {
    try {
      await supabase.from('students').delete().eq('id', id);
    } catch (_) {}
  }

  const data = loadLocalData();
  if (data.students) {
    data.students = data.students.filter(s => s.id !== id);
    saveLocalData(data);
  }
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
