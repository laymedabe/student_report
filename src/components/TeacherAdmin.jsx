import React, { useState, useEffect } from 'react';
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
  KeyRound
} from 'lucide-react';

export default function TeacherAdmin({ 
  students, 
  center, 
  announcements = [], 
  onRefreshData, 
  onViewAsParent, 
  onShowToast, 
  onExitAdmin 
}) {
  // Authentication state
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('apex_teacher_auth') === 'true';
  });
  const [passcode, setPasscode] = useState('');
  const [authError, setAuthError] = useState('');

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
    pinCode: ''
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
    name: center?.name || '',
    tagline: center?.tagline || '',
    tutorName: center?.tutorName || '',
    phone: center?.phone || '',
    email: center?.email || '',
    address: center?.address || '',
    activeTerm: center?.activeTerm || '',
    passcode: ''
  });

  useEffect(() => {
    if (center) {
      setCenterForm(prev => ({
        ...prev,
        name: center.name || '',
        tagline: center.tagline || '',
        tutorName: center.tutorName || '',
        phone: center.phone || '',
        email: center.email || '',
        address: center.address || '',
        activeTerm: center.activeTerm || ''
      }));
    }
  }, [center]);

  const activeStudent = students.find(s => s.id === selectedStudentId);

  // Authentication submission
  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await fetch('/api/auth/teacher', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode })
      });
      const data = await res.json();
      if (data.success) {
        setIsAuthenticated(true);
        localStorage.setItem('apex_teacher_auth', 'true');
        onShowToast({ type: 'success', message: 'Welcome back, ' + (data.tutorName || 'Teacher') });
      } else {
        setAuthError(data.message || 'Incorrect passcode. Try 1234');
      }
    } catch (err) {
      if (passcode === '1234') {
        setIsAuthenticated(true);
        localStorage.setItem('apex_teacher_auth', 'true');
      } else {
        setAuthError('Connection error or incorrect passcode');
      }
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('apex_teacher_auth');
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
      pinCode: autoPin
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
      pinCode: stu.pinCode || stu.accessCode || ''
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
        body: JSON.stringify(newStudent)
      });
      const data = await res.json();
      if (data.success) {
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
          pinCode: ''
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
        onShowToast({ type: 'error', message: data.message || 'Error saving student' });
      }
    } catch (err) {
      onShowToast({ 
        type: 'error', 
        message: editingStudentId ? 'Failed to update student profile' : 'Failed to create student' 
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

  // Update Center Settings
  const handleUpdateCenter = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...centerForm };
      if (!payload.passcode) delete payload.passcode;
      const res = await fetch('/api/center', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (data.success) {
        onRefreshData();
        onShowToast({ type: 'success', message: 'Center settings updated successfully!' });
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
          maxWidth: '460px',
          width: '100%',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          textAlign: 'center'
        }}>
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
            <Lock size={26} />
          </div>

          <h2 style={{ fontSize: '1.6rem', marginBottom: '0.4rem' }}>Teacher Admin Login</h2>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.75rem' }}>
            Authorized access to manage student reports, session updates, and student PINs.
          </p>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', textAlign: 'left', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                Admin Passcode:
              </label>
              <input 
                type="password"
                placeholder="Enter passcode (default: 1234)"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '1.1rem',
                  borderRadius: 'var(--radius-md)',
                  border: authError ? '2px solid #ef4444' : '1px solid var(--border-strong)',
                  outline: 'none',
                  textAlign: 'center'
                }}
                autoFocus
              />
            </div>

            {authError && (
              <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>
                {authError}
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginBottom: '1rem' }}>
              Sign In to Admin Portal
            </button>
          </form>

          <div style={{
            background: '#f8fafc',
            borderRadius: 'var(--radius-md)',
            padding: '0.75rem',
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            🔑 Default Demo Passcode: <strong style={{ color: 'var(--primary)' }}>1234</strong>
          </div>

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

  // -------------------------------------------------------------
  // VIEW: AUTHENTICATED TEACHER ADMIN WORKSPACE
  // -------------------------------------------------------------
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
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="brand-icon">
            <Users size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h2 style={{ fontSize: '1.35rem', margin: 0 }}>Teacher Control Center</h2>
              <span className="badge badge-emerald">Admin</span>
            </div>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Logged in as {center?.tutorName || 'Teacher Kimberly'} • {center?.name}
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
                              style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                              onClick={() => handleOpenEditStudent(stu)}
                              title="Click to edit student info"
                            />
                            <div>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                                <strong 
                                  style={{ fontSize: '0.95rem', cursor: 'pointer', color: 'var(--text-main)' }}
                                  onClick={() => handleOpenEditStudent(stu)}
                                  title="Click to edit student info"
                                >
                                  {stu.fullName}
                                </strong>
                                <button 
                                  type="button"
                                  className="btn btn-ghost btn-sm"
                                  style={{ padding: '0.15rem 0.35rem', color: 'var(--primary)' }}
                                  onClick={() => handleOpenEditStudent(stu)}
                                  title="Edit student info"
                                >
                                  <Edit3 size={13} />
                                </button>
                              </div>
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
                          <div style={{ fontSize: '0.85rem' }}>
                            <span>{stu.sessions?.length || 0} sessions logged</span>
                          </div>
                          {stu.reports?.length > 0 ? (
                            <span className="badge badge-emerald" style={{ fontSize: '0.65rem' }}>Report Card Ready</span>
                          ) : (
                            <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>Pending Report</span>
                          )}
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
                <label className="form-label">Lead Tutor / Instructor Name</label>
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
              Hello {shareStudent.parentName || 'Parent'}, here is {shareStudent.fullName}'s tutoring progress report and session logs from {center?.name || 'Apex Scholars'}:
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
                  const msg = `Hello ${shareStudent.parentName || 'Parent'}, here is ${shareStudent.fullName}'s tutoring progress report from ${center?.name || 'Apex Scholars'}: ${window.location.origin}${window.location.pathname}?pin=${pin} (Student Access PIN: ${pin})`;
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
