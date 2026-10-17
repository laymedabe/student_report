-- ====================================================================
-- SUPABASE DATABASE SCHEMA FOR APEX SCHOLARS / LOGIC LANE PORTAL
-- ====================================================================
-- Run this script in your Supabase project's SQL Editor (Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Teachers / Educators Table
CREATE TABLE IF NOT EXISTS teachers (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  passcode TEXT NOT NULL DEFAULT '1234',
  name TEXT NOT NULL,
  phone TEXT,
  avatar TEXT,
  center_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_teachers_email ON teachers(email);

-- 2. Centers Table (Legacy / Center branding)
CREATE TABLE IF NOT EXISTS centers (
  id TEXT PRIMARY KEY DEFAULT 'center-1',
  name TEXT NOT NULL,
  tagline TEXT,
  tutor_name TEXT,
  tutor_title TEXT,
  phone TEXT,
  email TEXT,
  address TEXT,
  passcode TEXT DEFAULT '1234',
  active_term TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Students Table (PIN-Code Access & Teacher Assignment)
CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  teacher_id TEXT DEFAULT 'teacher-1' REFERENCES teachers(id) ON DELETE SET NULL,
  pin_code TEXT NOT NULL UNIQUE,
  access_code TEXT,
  full_name TEXT NOT NULL,
  preferred_name TEXT,
  grade TEXT,
  subjects JSONB DEFAULT '[]'::jsonb,
  parent_name TEXT,
  parent_phone TEXT,
  parent_email TEXT,
  enrolled_date TEXT,
  status TEXT DEFAULT 'Active',
  avatar TEXT,
  learning_goals TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_students_pin ON students(pin_code);

-- 3. Sessions Table
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  date TEXT NOT NULL,
  subject TEXT,
  topic TEXT NOT NULL,
  duration TEXT DEFAULT '60 mins',
  attendance TEXT DEFAULT 'Present',
  rating INT DEFAULT 5,
  badge TEXT DEFAULT 'Star Problem Solver',
  tutor_notes TEXT,
  homework TEXT,
  next_steps TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_student_id ON sessions(student_id);

-- 4. Progress Reports Table
CREATE TABLE IF NOT EXISTS reports (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  period TEXT,
  issue_date TEXT,
  overall_grade TEXT,
  attendance_rate TEXT,
  behavior_rating TEXT,
  subject_evaluations JSONB DEFAULT '[]'::jsonb,
  strengths JSONB DEFAULT '[]'::jsonb,
  areas_for_growth JSONB DEFAULT '[]'::jsonb,
  tutor_summary TEXT,
  teacher_signature TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reports_student_id ON reports(student_id);

-- 5. Center Announcements Table
CREATE TABLE IF NOT EXISTS announcements (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  date TEXT,
  category TEXT DEFAULT 'General',
  is_pinned BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
-- Allow access for public/anon requests through the API
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE centers ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on teachers" ON teachers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on centers" ON centers FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on students" ON students FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on sessions" ON sessions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on reports" ON reports FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on announcements" ON announcements FOR ALL USING (true) WITH CHECK (true);

-- ====================================================================
-- INITIAL SEED DATA
-- ====================================================================
INSERT INTO teachers (id, email, passcode, name, phone, avatar, center_name)
VALUES (
  'teacher-1',
  'sample@email.com',
  '1234',
  'Sir Kleeser',
  '',
  'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
  'skwelahan ni kleeser'
)
ON CONFLICT (id) DO NOTHING;

INSERT INTO centers (id, name, tagline, tutor_name, tutor_title, phone, email, address, passcode, active_term)
VALUES (
  'center-1',
  'Apex Scholars Learning Center',
  'Empowering Minds, Inspiring Lifelong Academic Confidence',
  'Teacher Kimberly Hayes, M.Ed.',
  'Lead Academic Coach & Learning Specialist',
  '+1 (555) 742-9918',
  'kimberly@apexscholars.edu',
  '842 Cambridge Avenue, Suite 400',
  '1234',
  'Fall / Winter 2026 Term'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Student 1: Kal-el / Lucas (PIN: 9421)
INSERT INTO students (id, pin_code, access_code, full_name, preferred_name, grade, subjects, parent_name, parent_phone, parent_email, enrolled_date, status, avatar, learning_goals)
VALUES (
  'stu-101',
  '9421',
  '9421',
  'Lucas Vance',
  'Lucas',
  '5th Grade',
  '["Mathematics", "Science & Discovery", "Reading Comprehension"]'::jsonb,
  'Eleanor Vance',
  '+1 (555) 349-8812',
  'eleanor.vance@example.com',
  '2026-01-15',
  'Active',
  'https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80',
  'Master complex fraction arithmetic, strengthen multi-step word problem synthesis, and refine reading inference skills.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Student 2: Maya Lin (PIN: 3108)
INSERT INTO students (id, pin_code, access_code, full_name, preferred_name, grade, subjects, parent_name, parent_phone, parent_email, enrolled_date, status, avatar, learning_goals)
VALUES (
  'stu-102',
  '3108',
  '3108',
  'Maya Lin Chen',
  'Maya',
  '7th Grade',
  '["Pre-Algebra", "English Literature & Essay Writing"]'::jsonb,
  'David & Grace Chen',
  '+1 (555) 891-4433',
  'grace.chen@example.com',
  '2026-02-01',
  'Active',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'Strengthen algebraic equation transformations and construct persuasive five-paragraph argumentative essays.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Student 3: Ethan Cole (PIN: 5812)
INSERT INTO students (id, pin_code, access_code, full_name, preferred_name, grade, subjects, parent_name, parent_phone, parent_email, enrolled_date, status, avatar, learning_goals)
VALUES (
  'stu-103',
  '5812',
  '5812',
  'Ethan Cole',
  'Ethan',
  '3rd Grade',
  '["Mathematics", "Science & Discovery"]'::jsonb,
  'Sarah Cole',
  '+1 (555) 672-8901',
  'sarah.cole@example.com',
  '2026-03-10',
  'Active',
  'https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?w=200&auto=format&fit=crop&q=80',
  'Master skip counting patterns, strengthen word pronunciation, and develop independent reading fluency.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Sessions for Lucas
INSERT INTO sessions (id, student_id, date, subject, topic, duration, attendance, rating, badge, tutor_notes, homework, next_steps)
VALUES
(
  'ses-101-1',
  'stu-101',
  '2026-10-09',
  'Mathematics',
  'Multiplying & Dividing Fractions with Real-World Word Problems',
  '60 mins',
  'Present',
  5,
  'Star Problem Solver',
  'Outstanding breakthrough session! Lucas solved all 7 multi-step word problems completely without coaching. He even caught an edge case in problem #4 on his own.',
  'Completed - 100% Score',
  'Begin mixed numbers and decimal conversion next Tuesday.'
),
(
  'ses-101-2',
  'stu-101',
  '2026-10-06',
  'Science & Discovery',
  'Ecosystem Energy Pyramids & Food Web Dynamics',
  '60 mins',
  'Present',
  5,
  'Deep Thinker',
  'Lucas showed remarkable engagement during our food web flow simulation. He grasped trophic levels and trophic cascade effects very fast.',
  'Completed with Diagram',
  'Prepare short 3-minute oral explanation of keystone species.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Progress Report for Lucas
INSERT INTO reports (id, student_id, title, period, issue_date, overall_grade, attendance_rate, behavior_rating, subject_evaluations, strengths, areas_for_growth, tutor_summary, teacher_signature)
VALUES (
  'rep-101-1',
  'stu-101',
  'Term 1 Comprehensive Academic & Growth Evaluation',
  'September - October 2026',
  '2026-10-10',
  'A (94%)',
  '100%',
  'Exemplary',
  '[
    {"subject": "Mathematics", "grade": "A (96%)", "mastery": "Advanced Mastery", "comment": "Demonstrates superior computational reasoning and enthusiasm when challenged with multi-step logic."},
    {"subject": "Science & Discovery", "grade": "A (94%)", "mastery": "Proficient & Curious", "comment": "Consistently asks insightful questions and demonstrates sharp understanding of ecological systems."},
    {"subject": "Reading Comprehension", "grade": "A- (91%)", "mastery": "Strong Competency", "comment": "Vocabulary recall has grown by 30%. Continues to build speed and ease in written analytical responses."}
  ]'::jsonb,
  '["Rapid mastery of fraction manipulation and mental arithmetic", "Proactive attitude and willingness to tackle difficult challenge tasks", "100% on-time homework submission with thorough work shown"]'::jsonb,
  '["Double-check arithmetic signs before turning in papers", "Expand written paragraph structure with more descriptive connecting words"]'::jsonb,
  'Lucas is flourishing this term! The transition from initial hesitation with fractions to leading the problem-solving process has been remarkable. His attentiveness and genuine enthusiasm make each session productive and joyful.',
  'Teacher Kimberly Hayes, M.Ed.'
)
ON CONFLICT (id) DO NOTHING;

-- Seed Announcement
INSERT INTO announcements (id, title, content, date, category, is_pinned)
VALUES (
  'ann-1',
  'Fall Term Progress Evaluations Live',
  'Dear Parents, all updated session records and term progress reports are now live in your child''s PIN portal. Feel free to review recent observations and lesson goals.',
  '2026-10-10',
  'General',
  TRUE
)
ON CONFLICT (id) DO NOTHING;
