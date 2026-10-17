import React, { useState, useEffect, useRef } from 'react';
import {
  Users,
  Plus,
  Search,
  Share2,
  ExternalLink,
  Trash2,
  Edit3,
  Calendar,
  FileText,
  BookOpen,
  Award,
  Settings,
  Bell,
  CheckCircle2,
  ArrowLeft,
  Lock,
  LogOut,
  Star,
  Upload,
  Copy,
  MessageSquare,
  Sparkles,
  KeyRound,
  Camera,
  LogIn,
  UserPlus,
  Mail,
  User
} from 'lucide-react';

export default function TeacherAdmin({
  students,
  center,
  currentTeacher,
  onTeacherChange,
  announcements = [],
  onRefreshData,
  onViewAsParent,
  onShowToast,
  onExitAdmin
}) {
  const teacherPhotoInputRef = useRef(null);
  const studentPhotoInputRef = useRef(null);
  const registerPhotoInputRef = useRef(null);

  // Authentication mode: 'login' | 'register'
  const [authTab, setAuthTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState(currentTeacher?.email || 'sample@email.com');
  const [loginPasscode, setLoginPasscode] = useState('');
  const [authError, setAuthError] = useState('');

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPasscode, setRegPasscode] = useState('');
  const [regCenterName, setRegCenterName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regAvatar, setRegAvatar] = useState('https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80');

  const isAuthenticated = Boolean(currentTeacher?.id);

  // Admin views: 'directory', 'student-detail', 'announcements', 'settings'
  const [adminView, setAdminView] = useState('directory');
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [editingStudentId, setEditingStudentId] = useState(null);
  const [showAddSessionModal, setShowAddSessionModal] = useState(false);
  const [editingSessionId, setEditingSessionId] = useState(null);
  const [showAddReportModal, setShowAddReportModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStudent, setShareStudent] = useState(null);

  // Form states
  const [newStudent, setNewStudent] = useState({
    fullName: '',
    preferredName: '',
    grade: '5th Grade',
    subjects: 'Mathematics, Science',
    parentName: '',
    parentPhone: '',
    parentEmail: '',
    learningGoals: '',
    avatar: '',
    pinCode: '',
    monthlySessions: 12
  });

  const [newSession, setNewSession] = useState({
    date: new Date().toISOString().split('T')[0],
    subject: '',
    topic: '',
    duration: '60 mins',
    attendance: 'Present',
    rating: 5,
    badge: 'Star Problem Solver',
    tutorNotes: '',
    homework: 'Completed - 100%',
    nextSteps: ''
  });

  const [newReport, setNewReport] = useState({
    title: 'Term Progress Report Card',
    period: 'Current Term',
    overallGrade: 'A (95%)',
    attendanceRate: '100%',
    behaviorRating: 'Exemplary',
    subjectEvaluations: [
      { subject: 'Mathematics', grade: 'A (96%)', mastery: 'Advanced Mastery', comment: 'Excellent problem solving ability.' },
      { subject: 'Science', grade: 'A- (92%)', mastery: 'Proficient', comment: 'Active participation during experiments.' }
    ],
    strengths: 'Consistent homework completion\nStrong analytical curiosity\nAttentive listening',
    areasForGrowth: 'Double-check calculations before submitting\nContinue expanding vocabulary usage',
    tutorSummary: 'Demonstrates great enthusiasm and progress. A pleasure to tutor!',
    teacherSignature: center?.tutorName || 'Teacher Kimberly Hayes'
  });

  const [newAnnouncement, setNewAnnouncement] = useState({
    title: '',
    content: '',
    category: 'General',
    isPinned: true
  });

  const [centerForm, setCenterForm] = useState({
    name: currentTeacher?.centerName || center?.name || '',
    tagline: center?.tagline || '',
    tutorName: currentTeacher?.name || center?.tutorName || '',
    phone: currentTeacher?.phone || center?.phone || '',
    email: currentTeacher?.email || center?.email || '',
    address: currentTeacher?.address || center?.address || '',
    activeTerm: center?.activeTerm || '',
    avatar: currentTeacher?.avatar || center?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80',
    passcode: ''
  });

  useEffect(() => {
    if (currentTeacher) {
      setCenterForm(prev => ({
        ...prev,
        name: currentTeacher.centerName || prev.name,
        tutorName: currentTeacher.name || prev.tutorName,
        phone: currentTeacher.phone || prev.phone,
        email: currentTeacher.email || prev.email,
        avatar: currentTeacher.avatar || prev.avatar
      }));
    } else if (center) {
      setCenterForm(prev => ({
        ...prev,
        name: center.name || '',
        tagline: center.tagline || '',
        tutorName: center.tutorName || '',
        phone: center.phone || '',
        email: center.email || '',
        address: center.address || '',
        activeTerm: center.activeTerm || '',
        avatar: center.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'
      }));
    }
  }, [currentTeacher, center]);

  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Authentication submission (Sign In)
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, passcode: loginPasscode })
      });
      const data = await res.json();
      if (data.success && data.teacher) {
        onTeacherChange(data.teacher);
        onShowToast({ type: 'success', message: 'Welcome back, ' + (data.teacher.name || 'Teacher') });
      } else {
        setAuthError(data.message || 'Incorrect email or passcode.');
      }
    } catch (err) {
      setAuthError('Connection error or invalid credentials.');
    }
  };

  // Register New Teacher
  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthError('');
    if (!regName.trim() || !regEmail.trim() || !regPasscode.trim()) {
      setAuthError('Please fill in your name, email, and 4-digit passcode.');
      return;
    }
    try {
      const res = await fetch('/api/auth/teacher/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: regName.trim(),
          email: regEmail.trim(),
          passcode: regPasscode.trim(),
          centerName: regCenterName.trim() || 'Tutorial Center',
          avatar: regAvatar,
          phone: regPhone.trim()
        })
      });
      const data = await res.json();
      if (data.success && data.teacher) {
        onTeacherChange(data.teacher);
        onShowToast({ type: 'success', message: `Welcome, ${data.teacher.name}! Your workspace is ready.` });
      } else {
        setAuthError(data.message || 'Failed to register account.');
      }
    } catch (err) {
      setAuthError('Connection error or email already taken.');
    }
  };

  const handleLogout = () => {
    onTeacherChange(null);
    setLoginPasscode('');
    onShowToast({ type: 'info', message: 'Logged out of Teacher Mode' });
  };

  const handleRegisterPhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      onShowToast({ type: 'error', message: 'Photo must be under 10MB' });
      return;
    }
    const reader = new FileReader();
    reader.onload = async (event) => {
      setRegAvatar(event.target.result);
      try {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          setRegAvatar(data.url);
        }
      } catch (_) { }
    };
    reader.readAsDataURL(file);
  };

  // Copy Parent Link with PIN code
  const handleCopyLink = (student) => {
    const pin = student.pinCode || student.accessCode;
    const url = `${window.location.origin}${window.location.pathname}?pin=${pin}`;
    navigator.clipboard.writeText(url).then(() => {
      onShowToast({
        type: 'success',
        message: `Copied direct link for ${student.fullName} (PIN: ${pin})!`
      });
    });
  };

  const handleOpenShare = (student) => {
    setShareStudent(student);
    setShowShareModal(true);
  };

  // Open New Student Modal
  const handleOpenNewStudent = () => {
    setEditingStudentId(null);
    const autoPin = String(Math.floor(1000 + Math.random() * 9000));
    setNewStudent({
      fullName: '',
      preferredName: '',
      grade: '5th Grade',
      subjects: 'Mathematics, Science',
      parentName: '',
      parentPhone: '',
      parentEmail: '',
      learningGoals: '',
      avatar: '',
      pinCode: autoPin,
      monthlySessions: 12
    });
    setShowAddStudentModal(true);
  };

  // Open Edit Student Modal
  const handleOpenEditStudent = (stu) => {
    setEditingStudentId(stu.id);
    setNewStudent({
      fullName: stu.fullName || '',
      preferredName: stu.preferredName || '',
      grade: stu.grade || '',
      subjects: Array.isArray(stu.subjects) ? stu.subjects.join(', ') : (stu.subjects || ''),
      parentName: stu.parentName || '',
      parentPhone: stu.parentPhone || '',
      parentEmail: stu.parentEmail || '',
      learningGoals: stu.learningGoals || '',
      avatar: stu.avatar || '',
      pinCode: stu.pinCode || stu.accessCode || '',
      monthlySessions: stu.monthlySessions !== undefined && stu.monthlySessions !== null ? Number(stu.monthlySessions) : 12
    });
    setShowAddStudentModal(true);
  };

  // Close Student Modal
  const handleCloseStudentModal = () => {
    setShowAddStudentModal(false);
    setEditingStudentId(null);
  };

  // Save Student (Add or Edit) Handler
  const handleSaveStudent = async (e) => {
    e.preventDefault();
    try {
      const url = editingStudentId
        ? `/api/students/${editingStudentId}`
        : '/api/students';
      const method = editingStudentId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newStudent,
          monthlySessions: Number(newStudent.monthlySessions) > 0 ? Number(newStudent.monthlySessions) : 12,
          teacherId: currentTeacher?.id || 'teacher-1'
        })
      });
      let data = {};
      try {
        data = await res.json();
      } catch (_) {
        data = { success: false, message: 'Server connection error. Please ensure the backend is running.' };
      }

      if (res.ok && data.success) {
        setShowAddStudentModal(false);
        setEditingStudentId(null);
        setNewStudent({
          fullName: '',
          preferredName: '',
          grade: '5th Grade',
          subjects: 'Mathematics, Science',
          parentName: '',
          parentPhone: '',
          parentEmail: '',
          learningGoals: '',
          avatar: '',
          pinCode: '',
          monthlySessions: 12
        });
        onRefreshData();
        const pin = data.student?.pinCode || data.student?.accessCode || newStudent.pinCode;
        onShowToast({
          type: 'success',
          message: editingStudentId
            ? `Updated student profile for ${newStudent.fullName}!`
            : `Enrolled ${data.student?.fullName || newStudent.fullName} with Student PIN: ${pin}`
        });
        if (!editingStudentId && data.student) {
          setSelectedStudentId(data.student.id);
          setAdminView('student-detail');
        }
      } else {
        onShowToast({ type: 'error', message: data.message || (editingStudentId ? 'Failed to update student profile' : 'Failed to create student') });
      }
    } catch (err) {
      onShowToast({
        type: 'error',
        message: err.message || (editingStudentId ? 'Failed to update student profile' : 'Failed to create student')
      });
    }
  };

  // Delete Student
  const handleDeleteStudent = async (studentId, studentName) => {
    if (!window.confirm(`Are you sure you want to remove ${studentName}? All their session records will be deleted.`)) return;
    try {
      const res = await fetch(`/api/students/${studentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        if (selectedStudentId === studentId) {
          setSelectedStudentId(null);
          setAdminView('directory');
        }
        onShowToast({ type: 'success', message: `Student removed.` });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Could not delete student' });
    }
  };

  // Open New Session
  const handleOpenNewSession = () => {
    setEditingSessionId(null);
    setNewSession({
      date: new Date().toISOString().split('T')[0],
      subject: activeStudent?.subjects?.[0] || 'Mathematics',
      topic: '',
      duration: '60 mins',
      attendance: 'Present',
      rating: 5,
      badge: 'Star Problem Solver',
      tutorNotes: '',
      homework: 'Completed - 100%',
      nextSteps: ''
    });
    setShowAddSessionModal(true);
  };

  // Open Edit Session
  const handleStartEditSession = (ses) => {
    setEditingSessionId(ses.id);
    setNewSession({
      date: ses.date,
      subject: ses.subject,
      topic: ses.topic,
      duration: ses.duration || '60 mins',
      attendance: ses.attendance || 'Present',
      rating: ses.rating || 5,
      badge: ses.badge || 'Star Problem Solver',
      tutorNotes: ses.tutorNotes || '',
      homework: ses.homework || '',
      nextSteps: ses.nextSteps || ''
    });
    setShowAddSessionModal(true);
  };

  // Close Session Modal
  const handleCloseSessionModal = () => {
    setShowAddSessionModal(false);
    setEditingSessionId(null);
  };

  // Save Session (Add or Edit) Handler
  const handleSaveSession = async (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    try {
      const url = editingSessionId
        ? `/api/students/${activeStudent.id}/sessions/${editingSessionId}`
        : `/api/students/${activeStudent.id}/sessions`;
      const method = editingSessionId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSession)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddSessionModal(false);
        setEditingSessionId(null);
        setNewSession({
          date: new Date().toISOString().split('T')[0],
          subject: activeStudent.subjects[0] || 'Mathematics',
          topic: '',
          duration: '60 mins',
          attendance: 'Present',
          rating: 5,
          badge: 'Great Effort',
          tutorNotes: '',
          homework: 'Completed - 100%',
          nextSteps: ''
        });
        onRefreshData();
        onShowToast({
          type: 'success',
          message: editingSessionId ? 'Tutoring session updated!' : 'Tutoring session logged!'
        });
      }
    } catch (err) {
      onShowToast({
        type: 'error',
        message: editingSessionId ? 'Failed to update session' : 'Failed to log session'
      });
    }
  };

  // Delete Session
  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session log?')) return;
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/sessions/${sessionId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        onShowToast({ type: 'success', message: 'Session deleted' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to delete session' });
    }
  };

  // Add Report Handler
  const handleAddReport = async (e) => {
    e.preventDefault();
    if (!activeStudent) return;
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newReport)
      });
      const data = await res.json();
      if (data.success) {
        setShowAddReportModal(false);
        onRefreshData();
        onShowToast({ type: 'success', message: 'Progress Report Card published!' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to publish report' });
    }
  };

  // Delete Report
  const handleDeleteReport = async (reportId) => {
    if (!window.confirm('Delete this report card?')) return;
    try {
      const res = await fetch(`/api/students/${activeStudent.id}/reports/${reportId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        onShowToast({ type: 'success', message: 'Report deleted' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to delete report' });
    }
  };

  // Post Announcement
  const handleAddAnnouncement = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/announcements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAnnouncement)
      });
      const data = await res.json();
      if (data.success) {
        setNewAnnouncement({ title: '', content: '', category: 'General', isPinned: true });
        onRefreshData();
        onShowToast({ type: 'success', message: 'Announcement posted to all parents!' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to post announcement' });
    }
  };

  const handleDeleteAnnouncement = async (id) => {
    try {
      const res = await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        onShowToast({ type: 'success', message: 'Announcement deleted' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to delete announcement' });
    }
  };

  // Handle Teacher Photo File Upload from Device
  const handleTeacherPhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast({ type: 'error', message: 'Image file must be under 10MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setCenterForm(prev => ({ ...prev, avatar: dataUrl }));
      onShowToast({ type: 'success', message: 'Photo loaded from device! Click "Save Center Information" to save.' });

      try {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          setCenterForm(prev => ({ ...prev, avatar: data.url }));
        }
      } catch (_) { }
    };
    reader.readAsDataURL(file);
  };

  // Handle Student Photo File Upload from Device
  const handleStudentPhotoFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      onShowToast({ type: 'error', message: 'Student photo must be under 10MB' });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const dataUrl = event.target.result;
      setNewStudent(prev => ({ ...prev, avatar: dataUrl }));
      onShowToast({ type: 'success', message: 'Student photo loaded!' });

      try {
        const formData = new FormData();
        formData.append('photo', file);
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        const data = await res.json();
        if (data.success && data.url) {
          setNewStudent(prev => ({ ...prev, avatar: data.url }));
        }
      } catch (_) { }
    };
    reader.readAsDataURL(file);
  };

  // Update Center & Teacher Profile Settings
  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        id: currentTeacher?.id || 'teacher-1',
        name: centerForm.tutorName,
        centerName: centerForm.name,
        email: centerForm.email,
        phone: centerForm.phone,
        avatar: centerForm.avatar
      };
      if (centerForm.passcode) payload.passcode = centerForm.passcode;

      const res = await fetch('/api/teacher/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success && data.teacher) {
        onTeacherChange(data.teacher);
        onRefreshData();
        onShowToast({ type: 'success', message: 'Profile & settings updated successfully!' });
      } else {
        // Fallback
        await fetch('/api/center', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...centerForm, id: 'center-1' })
        });
        onRefreshData();
        onShowToast({ type: 'success', message: 'Settings saved!' });
      }
    } catch (err) {
      onShowToast({ type: 'error', message: 'Failed to update settings' });
    }
  };

  // Filter students
  const filteredStudents = students.filter(s => {
    const q = searchQuery.toLowerCase();
    const pin = (s.pinCode || s.accessCode || '').toLowerCase();
    return s.fullName.toLowerCase().includes(q) ||
      s.grade.toLowerCase().includes(q) ||
      pin.includes(q) ||
      s.parentName.toLowerCase().includes(q);
  });

  const totalSessionsCount = students.reduce((sum, s) => sum + (s.sessions?.length || 0), 0);
  const totalReportsCount = students.reduce((sum, s) => sum + (s.reports?.length || 0), 0);

  // -------------------------------------------------------------
  // VIEW: TEACHER LOGIN SCREEN
  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // VIEW: TEACHER LOGIN & REGISTRATION SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div style={{
        minHeight: '90vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.5rem',
        background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 60%)'
      }}>
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem',
          maxWidth: '480px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)'
        }}>
          {/* Header Icon */}
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--primary) 0%, var(--accent-purple) 100%)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem'
          }}>
            {authTab === 'login' ? <Lock size={26} /> : <UserPlus size={26} />}
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.35rem', textAlign: 'center' }}>
            {authTab === 'login' ? 'Teacher Admin Sign In' : 'Create Teacher Account'}
          </h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem', textAlign: 'center' }}>
            {authTab === 'login'
              ? 'Sign in to access and manage your dedicated student roster.'
              : 'Register your educator profile to start managing your own students.'}
          </p>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: '#f1f5f9',
            padding: '4px',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.75rem',
            gap: '4px'
          }}>
            <button
              type="button"
              className={`btn btn-sm ${authTab === 'login' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontWeight: 600 }}
              onClick={() => { setAuthTab('login'); setAuthError(''); }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              className={`btn btn-sm ${authTab === 'register' ? 'btn-primary' : 'btn-ghost'}`}
              style={{ flex: 1, fontWeight: 600 }}
              onClick={() => { setAuthTab('register'); setAuthError(''); }}
            >
              <UserPlus size={15} /> Create Account
            </button>
          </div>

          {/* TAB 1: LOGIN */}
          {authTab === 'login' ? (
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Teacher Email:
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="Enter your email (e.g. sample@email.com)"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 2.4rem',
                      fontSize: '0.95rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-strong)',
                      outline: 'none'
                    }}
                    required
                    autoFocus
                  />
                  <Mail size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                  Personal Passcode (PIN):
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="Enter your 4-digit passcode"
                    value={loginPasscode}
                    onChange={(e) => setLoginPasscode(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '0.8rem 1rem 0.8rem 2.4rem',
                      fontSize: '1.05rem',
                      borderRadius: 'var(--radius-md)',
                      border: authError ? '2px solid #ef4444' : '1px solid var(--border-strong)',
                      outline: 'none',
                      letterSpacing: '0.1em'
                    }}
                    required
                  />
                  <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              {authError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {authError}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1.25rem' }}>
                Sign In to Teacher Dashboard
              </button>
            </form>
          ) : (
            /* TAB 2: REGISTER NEW TEACHER */
            <form onSubmit={handleRegister}>
              {/* Photo Upload */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem', padding: '0.75rem', background: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
                <input
                  type="file"
                  ref={registerPhotoInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleRegisterPhotoFileChange}
                />
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => registerPhotoInputRef.current?.click()}
                  title="Upload profile photo"
                >
                  <img
                    src={regAvatar}
                    alt="Teacher Preview"
                    style={{
                      width: '54px',
                      height: '54px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '2px solid var(--primary)',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '-2px',
                    right: '-2px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '1px solid white'
                  }}>
                    <Camera size={11} />
                  </div>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    Teacher Photo
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => registerPhotoInputRef.current?.click()}
                    style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem', marginTop: '0.25rem' }}
                  >
                    <Upload size={12} /> Choose from Device
                  </button>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Your Full Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Teacher Kimberly Hayes"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none' }}
                  required
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  Email Address (used for logging in):
                </label>
                <input
                  type="email"
                  placeholder="e.g. kimberly@example.com"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none' }}
                  required
                />
              </div>

              <div className="form-row" style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    4-Digit Passcode:
                  </label>
                  <input
                    type="password"
                    placeholder="e.g. 5678"
                    value={regPasscode}
                    onChange={(e) => setRegPasscode(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none', letterSpacing: '0.08em' }}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                    Phone (Optional):
                  </label>
                  <input
                    type="text"
                    placeholder="+1 (555)..."
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem' }}>
                  School or Tutoring Center Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Bright Horizon Learning"
                  value={regCenterName}
                  onChange={(e) => setRegCenterName(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem 0.9rem', fontSize: '0.9rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-strong)', outline: 'none' }}
                />
              </div>

              {authError && (
                <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                  {authError}
                </div>
              )}

              <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1.25rem' }}>
                Create Teacher Account
              </button>
            </form>
          )}

          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onExitAdmin}
            style={{ width: '100%' }}
          >
            ← Back to Parent Access Portal
          </button>
        </div>
      </div>
    );
  }

  // Monthly Sessions Calculation Helper (decreases as sessions in current month are done/finished)
  const calcMonthlySessions = (stu) => {
    const quota = Number(stu?.monthlySessions) > 0 ? Number(stu.monthlySessions) : 12;
    const now = new Date();
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const monthName = now.toLocaleString('default', { month: 'long' });

    const monthSessions = (stu?.sessions || []).filter(s => {
      if (!s.date) return false;
      const parts = String(s.date).split('-');
      if (parts.length >= 2) {
        const y = parseInt(parts[0], 10);
        const m = parseInt(parts[1], 10) - 1;
        return y === curYear && m === curMonth;
      }
      const d = new Date(s.date);
      return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
    });

    const completedThisMonth = monthSessions.filter(
      s => s.attendance !== 'Cancelled' && s.attendance !== 'Excused Absence'
    ).length;

    const remaining = Math.max(0, quota - completedThisMonth);
    const isFinished = remaining === 0;
    const percent = Math.min(100, Math.round((completedThisMonth / quota) * 100));

    return { quota, completedThisMonth, remaining, isFinished, percent, monthName, curYear };
  };

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED TEACHER ADMIN WORKSPACE
  // -------------------------------------------------------------
  const teacherDisplayName = currentTeacher?.name || center?.tutorName || 'Teacher Profile';
  const teacherDisplayCenter = currentTeacher?.centerName || center?.name || 'Sambag Jaro Learning Center';
  const teacherDisplayAvatar = currentTeacher?.avatar || center?.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80';

  return (
    <div className="max-width-wrapper" style={{ paddingBottom: '4rem' }}>
      {/* Admin Header Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 0',
        borderBottom: '1px solid var(--border-light)',
        marginBottom: '1.75rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div
            style={{ position: 'relative', cursor: 'pointer' }}
            onClick={() => setAdminView('settings')}
            title="Click to view & edit teacher profile photo"
          >
            <img
              src={teacherDisplayAvatar}
              alt={teacherDisplayName}
              style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '3px solid white',
                boxShadow: '0 2px 10px rgba(79, 70, 229, 0.25)',
                display: 'block'
              }}
            />
            <span style={{
              position: 'absolute',
              bottom: '1px',
              right: '1px',
              width: '13px',
              height: '13px',
              borderRadius: '50%',
              backgroundColor: '#10b981',
              border: '2px solid white'
            }} title="Active Educator" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.3rem', margin: 0, fontWeight: 700 }}>
                {teacherDisplayName}
              </h2>
              <span className="badge badge-emerald" style={{ fontSize: '0.72rem', fontWeight: 700 }}>
                Teacher / Admin
              </span>
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 600, margin: 0, marginTop: '0.15rem' }}>
              {teacherDisplayCenter}
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button
            className={`btn btn-sm ${adminView === 'directory' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => { setAdminView('directory'); setSelectedStudentId(null); }}
          >
            <Users size={15} /> Students ({students.length})
          </button>
          <button
            className={`btn btn-sm ${adminView === 'announcements' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAdminView('announcements')}
          >
            <Bell size={15} /> Noticeboard ({announcements.length})
          </button>
          <button
            className={`btn btn-sm ${adminView === 'settings' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setAdminView('settings')}
          >
            <Settings size={15} /> Center Settings
          </button>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            style={{ color: '#ef4444' }}
            title="Log out from teacher mode"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>
      </div>

      {/* =========================================================
          SUB-VIEW 1: STUDENT DIRECTORY & OVERVIEW
          ========================================================= */}
      {adminView === 'directory' && (
        <div>
          {/* Quick Stats Overview */}
          <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#eef2ff', color: '#4f46e5' }}>
                <Users size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{students.length}</div>
                <div className="stat-label">Enrolled Students</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
                <Calendar size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{totalSessionsCount}</div>
                <div className="stat-label">Total Sessions Logged</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
                <FileText size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{totalReportsCount}</div>
                <div className="stat-label">Reports Generated</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
                <Bell size={24} />
              </div>
              <div className="stat-content">
                <div className="stat-value">{announcements.length}</div>
                <div className="stat-label">Active Announcements</div>
              </div>
            </div>
          </div>

          {/* Directory Action Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ position: 'relative', width: '320px', maxWidth: '100%' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-subtle)' }} />
              <input
                type="text"
                placeholder="Search student, grade, or PIN..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.65rem 1rem 0.65rem 2.4rem',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-light)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              className="btn btn-primary"
              onClick={handleOpenNewStudent}
            >
              <Plus size={18} /> Add New Student
            </button>
          </div>

          {/* Students Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Grade & Subjects</th>
                  <th>Parent Contact</th>
                  <th>Student PIN & Link</th>
                  <th>Activity</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((stu) => {
                    const studentPin = stu.pinCode || stu.accessCode;
                    return (
                      <tr key={stu.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <img
                              src={stu.avatar || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80"}
                              alt={stu.fullName}
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                              <strong style={{ display: 'block', fontSize: '0.95rem', color: 'var(--text-main)' }}>
                                {stu.fullName}
                              </strong>
                              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                Enrolled {stu.enrolledDate}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <strong style={{ fontSize: '0.875rem' }}>{stu.grade}</strong>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                            {(stu.subjects || []).join(', ')}
                          </div>
                        </td>

                        <td>
                          <div style={{ fontSize: '0.875rem', fontWeight: 600 }}>{stu.parentName}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{stu.parentPhone || stu.parentEmail}</div>
                        </td>

                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span className="badge badge-indigo" style={{ letterSpacing: '0.08em', fontSize: '0.85rem', fontWeight: 800 }}>
                              PIN: {studentPin}
                            </span>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: 'var(--primary)' }}
                              onClick={() => handleCopyLink(stu)}
                              title="Copy Direct PIN Link"
                            >
                              <Copy size={14} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ padding: '0.25rem 0.5rem', color: '#059669' }}
                              onClick={() => handleOpenShare(stu)}
                              title="Share Link with Parent"
                            >
                              <Share2 size={14} />
                            </button>
                          </div>
                        </td>

                        <td>
                          {(() => {
                            const monthStats = calcMonthlySessions(stu);
                            return (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                                <span 
                                  className={`badge ${monthStats.isFinished ? 'badge-emerald' : 'badge-indigo'}`}
                                  style={{ 
                                    fontWeight: 700, 
                                    fontSize: '0.78rem', 
                                    display: 'inline-flex', 
                                    alignItems: 'center', 
                                    gap: '0.3rem', 
                                    width: 'fit-content' 
                                  }}
                                  title={`${monthStats.completedThisMonth} of ${monthStats.quota} sessions completed in ${monthStats.monthName}`}
                                >
                                  {monthStats.isFinished 
                                    ? `✓ All ${monthStats.quota} done (${monthStats.monthName})` 
                                    : `${monthStats.remaining} of ${monthStats.quota} left (${monthStats.monthName})`}
                                </span>
                                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                                  {stu.sessions?.length || 0} total sessions logged
                                </div>
                                {stu.reports?.length > 0 ? (
                                  <span className="badge badge-emerald" style={{ fontSize: '0.65rem', width: 'fit-content' }}>Report Card Ready</span>
                                ) : (
                                  <span className="badge badge-amber" style={{ fontSize: '0.65rem', width: 'fit-content' }}>Pending Report</span>
                                )}
                              </div>
                            );
                          })()}
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.4rem' }}>
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setSelectedStudentId(stu.id);
                                setAdminView('student-detail');
                              }}
                            >
                              Manage
                            </button>
                            <button
                              className="btn btn-secondary btn-sm"
                              style={{ color: 'var(--primary)', borderColor: '#c7d2fe', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                              onClick={() => handleOpenEditStudent(stu)}
                              title="Edit Student Info"
                            >
                              <Edit3 size={14} /> Edit
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--primary)' }}
                              onClick={() => onViewAsParent(studentPin)}
                              title="Preview Parent View"
                            >
                              <ExternalLink size={15} />
                            </button>
                            <button
                              className="btn btn-ghost btn-sm"
                              style={{ color: '#ef4444' }}
                              onClick={() => handleDeleteStudent(stu.id, stu.fullName)}
                              title="Delete Student"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-VIEW 2: DEDICATED STUDENT MANAGEMENT WORKSPACE
          ========================================================= */}
      {adminView === 'student-detail' && activeStudent && (
        <div>
          {/* Breadcrumb Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.75rem' }}>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => { setSelectedStudentId(null); setAdminView('directory'); }}
            >
              <ArrowLeft size={16} /> Back to All Students
            </button>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleCopyLink(activeStudent)}
              >
                <Copy size={15} /> Copy PIN Link
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleOpenShare(activeStudent)}
                style={{ color: '#059669' }}
              >
                <Share2 size={15} /> Share Link
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => onViewAsParent(activeStudent.pinCode || activeStudent.accessCode)}
              >
                <ExternalLink size={15} /> View Parent Dashboard
              </button>
            </div>
          </div>

          {/* Student Banner */}
          <div className="card" style={{ background: '#f8fafc', borderLeft: '4px solid var(--primary)', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                <img
                  src={activeStudent.avatar || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80"}
                  alt={activeStudent.fullName}
                  style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{activeStudent.fullName}</h2>
                    <span className="badge badge-indigo" style={{ letterSpacing: '0.08em', fontWeight: 800 }}>
                      PIN: {activeStudent.pinCode || activeStudent.accessCode}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    Grade: <strong>{activeStudent.grade}</strong> • Parent: <strong>{activeStudent.parentName} ({activeStudent.parentPhone || activeStudent.parentEmail})</strong>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleOpenEditStudent(activeStudent)}
                >
                  <Edit3 size={15} /> Edit Student Info
                </button>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setShowAddReportModal(true)}
                >
                  <FileText size={15} /> Publish Report Card
                </button>
              </div>
            </div>

            {/* Monthly Sessions Progress Bar in Student Detail Banner */}
            {(() => {
              const activeMonthStats = calcMonthlySessions(activeStudent);
              return (
                <div style={{
                  marginTop: '1.25rem',
                  padding: '1rem 1.25rem',
                  background: '#ffffff',
                  borderRadius: 'var(--radius-md)',
                  border: activeMonthStats.isFinished ? '1.5px solid #86efac' : '1px solid var(--border-light)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className={`badge ${activeMonthStats.isFinished ? 'badge-emerald' : 'badge-indigo'}`} style={{ fontWeight: 800, fontSize: '0.825rem' }}>
                        {activeMonthStats.monthName} Package: {activeMonthStats.quota} Sessions / Month
                      </span>
                      <strong style={{ fontSize: '0.95rem', color: activeMonthStats.isFinished ? '#15803d' : 'var(--primary)' }}>
                        {activeMonthStats.isFinished 
                          ? `🎉 All ${activeMonthStats.quota} sessions completed for ${activeMonthStats.monthName}!` 
                          : `${activeMonthStats.remaining} sessions remaining (${activeMonthStats.completedThisMonth} done)`}
                      </strong>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ fontSize: '0.8rem', color: 'var(--primary)', padding: '0.2rem 0.5rem' }}
                      onClick={() => handleOpenEditStudent(activeStudent)}
                      title="Adjust monthly sessions quota"
                    >
                      <Edit3 size={13} /> Change Monthly Quota
                    </button>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${activeMonthStats.percent}%`,
                      height: '100%',
                      background: activeMonthStats.isFinished ? '#10b981' : 'var(--primary)',
                      borderRadius: '999px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Sessions List */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <Calendar size={20} color="var(--primary)" />
                Logged Tutoring Sessions ({activeStudent.sessions?.length || 0})
              </h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={handleOpenNewSession}
              >
                <Plus size={15} /> Log New Session
              </button>
            </div>

            {(activeStudent.sessions || []).length > 0 ? (
              (activeStudent.sessions || []).map((ses) => (
                <div key={ses.id} className="session-card">
                  <div className="session-header">
                    <div>
                      <div className="session-topic-title">{ses.topic}</div>
                      <div className="session-meta-row">
                        <span className="badge badge-indigo">{ses.subject}</span>
                        <span className="badge badge-emerald">{ses.attendance}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{ses.date}</span>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>• {ses.duration}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div style={{ display: 'flex', color: '#f59e0b' }}>
                        {[...Array(ses.rating || 5)].map((_, i) => (
                          <Star key={i} size={15} fill="#f59e0b" />
                        ))}
                      </div>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--primary)', padding: '0.3rem' }}
                        onClick={() => handleStartEditSession(ses)}
                        title="Edit Session"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: '#ef4444', padding: '0.3rem' }}
                        onClick={() => handleDeleteSession(ses.id)}
                        title="Delete Session"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="session-notes-box">
                    <strong>Observations: </strong>{ses.tutorNotes}
                  </div>

                  <div className="session-footer-grid">
                    <div className="footer-item">
                      <span className="footer-item-label">Homework Status</span>
                      <span className="footer-item-val">{ses.homework}</span>
                    </div>
                    {ses.nextSteps && (
                      <div className="footer-item">
                        <span className="footer-item-label">Next Lesson</span>
                        <span className="footer-item-val">{ses.nextSteps}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No sessions logged yet. Click "+ Log Session" above to add your first record!
              </p>
            )}
          </div>



          {/* Published Reports Section */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">
                <FileText size={20} color="var(--primary)" />
                Published Progress Report Cards ({activeStudent.reports?.length || 0})
              </h3>
              <button
                className="btn btn-primary btn-sm"
                onClick={() => setShowAddReportModal(true)}
              >
                <Plus size={15} /> Create Report Card
              </button>
            </div>

            {(activeStudent.reports || []).length > 0 ? (
              activeStudent.reports.map((rep) => (
                <div
                  key={rep.id}
                  style={{
                    background: '#f8fafc',
                    padding: '1.25rem',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-light)',
                    marginBottom: '1rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1rem'
                  }}
                >
                  <div>
                    <h4 style={{ fontSize: '1.1rem', marginBottom: '0.2rem' }}>{rep.title}</h4>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Period: {rep.period} • Overall: <strong>{rep.overallGrade}</strong> • Attendance: <strong>{rep.attendanceRate}</strong>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => onViewAsParent(activeStudent.pinCode || activeStudent.accessCode)}
                    >
                      <ExternalLink size={14} /> Preview Card
                    </button>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDeleteReport(rep.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No comprehensive report cards generated yet. Click "+ Create Report Card" to generate one.
              </p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-VIEW 3: NOTICEBOARD & ANNOUNCEMENTS
          ========================================================= */}
      {adminView === 'announcements' && (
        <div>
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Bell size={20} color="var(--primary)" />
              Post Center Notice / Announcement
            </h3>
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Announcements will be visible at the top of every parent's dashboard.
            </p>

            <form onSubmit={handleAddAnnouncement}>
              <div className="form-group">
                <label className="form-label">Notice Title</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mid-Term Review Meeting Schedule"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Notice Content</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="Message for all parents regarding schedules, center updates, or holiday breaks..."
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({ ...newAnnouncement, content: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={newAnnouncement.isPinned}
                    onChange={(e) => setNewAnnouncement({ ...newAnnouncement, isPinned: e.target.checked })}
                  />
                  <span>Pin to top of Parent Portals</span>
                </label>

                <button type="submit" className="btn btn-primary">
                  Publish Announcement
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
              Current Active Announcements ({announcements.length})
            </h3>
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div key={ann.id} className="notice-card" style={{ marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <strong style={{ fontSize: '1rem', color: 'var(--primary)' }}>{ann.title}</strong>
                      {ann.isPinned && <span className="badge badge-amber">Pinned</span>}
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{ann.content}</p>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-subtle)', marginTop: '0.4rem', display: 'block' }}>
                      Posted on {ann.date}
                    </span>
                  </div>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleDeleteAnnouncement(ann.id)}
                  >
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              ))
            ) : (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem 0' }}>
                No active announcements.
              </p>
            )}
          </div>
        </div>
      )}

      {/* =========================================================
          SUB-VIEW 4: CENTER SETTINGS
          ========================================================= */}
      {adminView === 'settings' && (
        <div className="card" style={{ maxWidth: '750px', margin: '0 auto' }}>
          <h3 className="card-title" style={{ marginBottom: '0.5rem' }}>
            <Settings size={20} color="var(--primary)" />
            Learning Center Branding & Profile
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            This branding appears on every parent's dashboard and the official printable report cards.
          </p>

          <form onSubmit={handleUpdateCenter}>
            {/* Teacher Profile Photo Upload Section */}
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid var(--border-light)',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }}>
              {/* Avatar Preview with Camera Overlay */}
              <div
                style={{ position: 'relative', cursor: 'pointer' }}
                onClick={() => teacherPhotoInputRef.current?.click()}
                title="Click to choose a photo from your computer/device"
              >
                <img
                  src={centerForm.avatar || 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80'}
                  alt="Teacher Profile Preview"
                  style={{
                    width: '84px',
                    height: '84px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '3px solid var(--primary)',
                    boxShadow: '0 4px 14px rgba(79, 70, 229, 0.25)',
                    display: 'block'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '2px',
                  right: '2px',
                  background: 'var(--primary)',
                  color: 'white',
                  borderRadius: '50%',
                  width: '26px',
                  height: '26px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  border: '2px solid white'
                }}>
                  <Camera size={13} />
                </div>
              </div>

              {/* Upload Controls */}
              <div style={{ flex: 1, minWidth: '240px' }}>
                <input
                  type="file"
                  ref={teacherPhotoInputRef}
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  style={{ display: 'none' }}
                  onChange={handleTeacherPhotoFileChange}
                />
                <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  Teacher Profile Photo
                </div>
                <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.85rem' }}>
                  Upload your picture directly from your computer or phone.
                </p>

                <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => teacherPhotoInputRef.current?.click()}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600, padding: '0.5rem 1rem' }}
                  >
                    <Upload size={15} /> Upload Photo from Device
                  </button>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => {
                      setCenterForm({ ...centerForm, avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=200&auto=format&fit=crop&q=80' });
                      onShowToast({ type: 'info', message: 'Reset to default educator photo' });
                    }}
                  >
                    Reset Default
                  </button>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Center / Tutoring Name</label>
              <input
                type="text"
                className="form-input"
                value={centerForm.name}
                onChange={(e) => setCenterForm({ ...centerForm, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Center Tagline / Motto</label>
              <input
                type="text"
                className="form-input"
                value={centerForm.tagline}
                onChange={(e) => setCenterForm({ ...centerForm, tagline: e.target.value })}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Teacher Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={centerForm.tutorName}
                  onChange={(e) => setCenterForm({ ...centerForm, tutorName: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Active Academic Term</label>
                <input
                  type="text"
                  className="form-input"
                  value={centerForm.activeTerm}
                  onChange={(e) => setCenterForm({ ...centerForm, activeTerm: e.target.value })}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">Contact Phone (shown to parents)</label>
                <input
                  type="text"
                  className="form-input"
                  value={centerForm.phone}
                  onChange={(e) => setCenterForm({ ...centerForm, phone: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Contact Email</label>
                <input
                  type="email"
                  className="form-input"
                  value={centerForm.email}
                  onChange={(e) => setCenterForm({ ...centerForm, email: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Address / Center Location</label>
              <input
                type="text"
                className="form-input"
                value={centerForm.address}
                onChange={(e) => setCenterForm({ ...centerForm, address: e.target.value })}
              />
            </div>

            <div className="form-group" style={{ background: '#f8fafc', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-light)' }}>
              <label className="form-label" style={{ color: 'var(--primary)' }}>
                Change Admin Passcode
              </label>
              <input
                type="password"
                className="form-input"
                placeholder="Leave blank to keep current passcode (default: 1234)"
                value={centerForm.passcode}
                onChange={(e) => setCenterForm({ ...centerForm, passcode: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              Save Center Information
            </button>
          </form>
        </div>
      )}

      {/* =========================================================
          MODAL: ADD / EDIT STUDENT (WITH PIN CODE)
          ========================================================= */}
      {showAddStudentModal && (
        <div className="modal-overlay" onClick={handleCloseStudentModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>
                  {editingStudentId ? 'Edit Student Profile' : 'Enroll New Student'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {editingStudentId
                    ? `Updating record for ${newStudent.fullName || 'Student'}`
                    : 'Assign a PIN code and learning details'}
                </span>
              </div>
              <button className="btn btn-ghost" onClick={handleCloseStudentModal}>✕</button>
            </div>

            <form onSubmit={handleSaveStudent}>
              {/* Student Photo Upload Section */}
              <div style={{
                background: '#f8fafc',
                padding: '1.25rem',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border-light)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '1.25rem',
                flexWrap: 'wrap'
              }}>
                <div
                  style={{ position: 'relative', cursor: 'pointer' }}
                  onClick={() => studentPhotoInputRef.current?.click()}
                  title="Click to choose a photo for the student"
                >
                  <img
                    src={newStudent.avatar || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80"}
                    alt="Student Photo Preview"
                    style={{
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '3px solid var(--primary)',
                      boxShadow: '0 3px 10px rgba(79, 70, 229, 0.2)',
                      display: 'block'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: '0px',
                    right: '0px',
                    background: 'var(--primary)',
                    color: 'white',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid white'
                  }}>
                    <Camera size={12} />
                  </div>
                </div>

                <div style={{ flex: 1, minWidth: '220px' }}>
                  <input
                    type="file"
                    ref={studentPhotoInputRef}
                    accept="image/png,image/jpeg,image/jpg,image/webp"
                    style={{ display: 'none' }}
                    onChange={handleStudentPhotoFileChange}
                  />
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.2rem' }}>
                    Student Photo
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, marginBottom: '0.6rem' }}>
                    Upload a picture from your device (JPG, PNG, WEBP).
                  </p>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      className="btn btn-primary btn-sm"
                      onClick={() => studentPhotoInputRef.current?.click()}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}
                    >
                      <Upload size={14} /> Upload Student Photo
                    </button>
                    {newStudent.avatar && (
                      <button
                        type="button"
                        className="btn btn-secondary btn-sm"
                        onClick={() => setNewStudent({ ...newStudent, avatar: '' })}
                      >
                        Reset Default
                      </button>
                    )}
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Liam Parker"
                    value={newStudent.fullName}
                    onChange={(e) => setNewStudent({ ...newStudent, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Preferred Name / Nickname</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Liam"
                    value={newStudent.preferredName}
                    onChange={(e) => setNewStudent({ ...newStudent, preferredName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Grade / Level</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 5th Grade"
                    value={newStudent.grade}
                    onChange={(e) => setNewStudent({ ...newStudent, grade: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <KeyRound size={15} /> Student Access PIN Code *
                  </label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 4829 (4-6 digits)"
                    value={newStudent.pinCode}
                    onChange={(e) => setNewStudent({ ...newStudent, pinCode: e.target.value })}
                    required
                    style={{ fontWeight: 700, letterSpacing: '0.08em' }}
                  />
                </div>
              </div>

              {/* Simple Monthly Sessions Input */}
              <div className="form-group">
                <label className="form-label">Monthly Sessions</label>
                <input
                  type="number"
                  min="1"
                  className="form-input"
                  placeholder="12"
                  value={newStudent.monthlySessions}
                  onChange={(e) => setNewStudent({ ...newStudent, monthlySessions: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Enrolled Subjects (comma-separated)</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Mathematics, Science"
                  value={newStudent.subjects}
                  onChange={(e) => setNewStudent({ ...newStudent, subjects: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Parent / Guardian Name *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Jessica Parker"
                    value={newStudent.parentName}
                    onChange={(e) => setNewStudent({ ...newStudent, parentName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Parent Phone / Contact</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={newStudent.parentPhone}
                    onChange={(e) => setNewStudent({ ...newStudent, parentPhone: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Parent Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. jessica.parker@example.com"
                  value={newStudent.parentEmail}
                  onChange={(e) => setNewStudent({ ...newStudent, parentEmail: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Current Academic Focus / Goals</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  placeholder="e.g. Master multiplication tables, build fraction confidence, and enhance reading fluency."
                  value={newStudent.learningGoals}
                  onChange={(e) => setNewStudent({ ...newStudent, learningGoals: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseStudentModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingStudentId ? 'Save Changes' : 'Enroll Student & Set PIN Code'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: LOG / EDIT TUTORING SESSION
          ========================================================= */}
      {showAddSessionModal && activeStudent && (
        <div className="modal-overlay" onClick={handleCloseSessionModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>
                  {editingSessionId ? 'Edit Tutoring Session' : 'Log Tutoring Session'}
                </h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  For {activeStudent.fullName} ({activeStudent.grade})
                </span>
              </div>
              <button className="btn btn-ghost" onClick={handleCloseSessionModal}>✕</button>
            </div>

            <form onSubmit={handleSaveSession}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Session Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={newSession.date}
                    onChange={(e) => setNewSession({ ...newSession, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Subject</label>
                  <select
                    className="form-select"
                    value={newSession.subject}
                    onChange={(e) => setNewSession({ ...newSession, subject: e.target.value })}
                  >
                    {(activeStudent.subjects || ['Mathematics']).map((s, i) => (
                      <option key={i} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Topic Covered *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Multiplying Fractions with Real-World Word Problems"
                  value={newSession.topic}
                  onChange={(e) => setNewSession({ ...newSession, topic: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Attendance</label>
                  <select
                    className="form-select"
                    value={newSession.attendance}
                    onChange={(e) => setNewSession({ ...newSession, attendance: e.target.value })}
                  >
                    <option value="Present">Present</option>
                    <option value="Late">Late</option>
                    <option value="Excused">Excused Absence</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <select
                    className="form-select"
                    value={newSession.rating}
                    onChange={(e) => setNewSession({ ...newSession, rating: Number(e.target.value) })}
                  >
                    <option value={5}>⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value={4}>⭐⭐⭐⭐ 4 Stars</option>
                    <option value={3}>⭐⭐⭐ 3 Stars</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Tutor Observations & Remarks *</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newSession.tutorNotes}
                  onChange={(e) => setNewSession({ ...newSession, tutorNotes: e.target.value })}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Homework Status</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSession.homework}
                    onChange={(e) => setNewSession({ ...newSession, homework: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Next Lesson Plan</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newSession.nextSteps}
                    onChange={(e) => setNewSession({ ...newSession, nextSteps: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={handleCloseSessionModal}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingSessionId ? 'Save Changes' : 'Save Session Log'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}



      {/* =========================================================
          MODAL: GENERATE PROGRESS REPORT CARD
          ========================================================= */}
      {showAddReportModal && activeStudent && (
        <div className="modal-overlay" onClick={() => setShowAddReportModal(false)}>
          <div className="modal-content" style={{ maxWidth: '720px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 style={{ fontSize: '1.3rem' }}>Create Official Progress Report</h3>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Formal report card for {activeStudent.fullName}
                </span>
              </div>
              <button className="btn btn-ghost" onClick={() => setShowAddReportModal(false)}>✕</button>
            </div>

            <form onSubmit={handleAddReport}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Report Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newReport.title}
                    onChange={(e) => setNewReport({ ...newReport, title: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Evaluation Period</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newReport.period}
                    onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Overall Grade Rating</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newReport.overallGrade}
                    onChange={(e) => setNewReport({ ...newReport, overallGrade: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Attendance Record</label>
                  <input
                    type="text"
                    className="form-input"
                    value={newReport.attendanceRate}
                    onChange={(e) => setNewReport({ ...newReport, attendanceRate: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Key Strengths (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newReport.strengths}
                  onChange={(e) => setNewReport({ ...newReport, strengths: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Areas for Growth / Goals (one per line)</label>
                <textarea
                  className="form-textarea"
                  rows="2"
                  value={newReport.areasForGrowth}
                  onChange={(e) => setNewReport({ ...newReport, areasForGrowth: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Lead Tutor's Comprehensive Summary</label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  value={newReport.tutorSummary}
                  onChange={(e) => setNewReport({ ...newReport, tutorSummary: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddReportModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Publish Official Report Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================
          MODAL: SHARE LINK & MESSAGE WITH PARENT (WITH PIN CODE)
          ========================================================= */}
      {showShareModal && shareStudent && (
        <div className="modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Share2 size={20} color="var(--primary)" />
                Share Link with Parent ({shareStudent.parentName})
              </h3>
              <button className="btn btn-ghost" onClick={() => setShowShareModal(false)}>✕</button>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              Share this direct portal link and invitation message directly with the parent.
            </p>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-md)',
              padding: '1.25rem',
              fontSize: '0.9rem',
              lineHeight: 1.6,
              marginBottom: '1.5rem',
              color: 'var(--text-main)'
            }}>
              Hello {shareStudent.parentName || 'Parent'}, here is {shareStudent.fullName}'s tutoring progress report and session logs from {center?.name || 'Sample'}:
              <br /><br />
              👉 <strong>{`${window.location.origin}${window.location.pathname}?pin=${shareStudent.pinCode || shareStudent.accessCode}`}</strong>
              <br /><br />
              (Student Access PIN: <strong>{shareStudent.pinCode || shareStudent.accessCode}</strong>)
              <br /><br />
              Best regards,<br />
              {center?.tutorName || 'Teacher Kimberly'}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  const pin = shareStudent.pinCode || shareStudent.accessCode;
                  const url = `${window.location.origin}${window.location.pathname}?pin=${pin}`;
                  navigator.clipboard.writeText(url);
                  onShowToast({ type: 'success', message: 'Direct PIN link copied to clipboard!' });
                }}
              >
                <Copy size={16} /> Copy Direct Link
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  const pin = shareStudent.pinCode || shareStudent.accessCode;
                  const msg = `Hello ${shareStudent.parentName || 'Parent'}, here is ${shareStudent.fullName}'s tutoring progress report from ${center?.name || 'Sample'}: ${window.location.origin}${window.location.pathname}?pin=${pin} (Student Access PIN: ${pin})`;
                  navigator.clipboard.writeText(msg);
                  onShowToast({ type: 'success', message: 'Share message copied to clipboard!' });
                  setShowShareModal(false);
                }}
              >
                <Share2 size={16} /> Copy Full Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
