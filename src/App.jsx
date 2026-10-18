import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import ParentAccess from './components/ParentAccess';
import ParentDashboard from './components/ParentDashboard';
import TeacherAdmin from './components/TeacherAdmin';
import Toast from './components/Toast';

export default function App() {
  // Mode: 'parent' or 'teacher'
  const [mode, setMode] = useState('parent');

  // Center, Student, and Announcements state
  const [center, setCenter] = useState(null);
  const [students, setStudents] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  // Parent portal state (Student PIN Code)
  // Detect if user opened a parent share link (?pin=... or ?parent=1)
  const [isParentLink] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.has('pin') || params.has('code') || params.get('parent') === '1' || params.get('view') === 'parent';
  });

  const [isTeacherPreview, setIsTeacherPreview] = useState(false);

  // Always require PIN entry on page load (no auto-login on refresh)
  const [parentCode, setParentCode] = useState('');

  // Shared links (?pin=9421) only pre-fill the PIN box
  const [prefillPin] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get('pin') || params.get('code');
    localStorage.removeItem('apex_student_pin');
    localStorage.removeItem('apex_parent_code');
    return pinParam ? pinParam.trim().toUpperCase() : '';
  });

  const [activeStudent, setActiveStudent] = useState(null);
  const [accessError, setAccessError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Toast helper
  const showToast = useCallback((toastData) => {
    setToast(toastData);
    setTimeout(() => {
      setToast(null);
    }, 3500);
  }, []);

  // Teacher state
  const [currentTeacher, setCurrentTeacher] = useState(() => {
    try {
      const stored = localStorage.getItem('apex_teacher_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (_) {
      return null;
    }
  });

  // Fetch center info
  const fetchPublicData = useCallback(async () => {
    try {
      const centerRes = await fetch('/api/center');
      const centerData = await centerRes.json();
      if (centerData.success) setCenter(centerData.center);
    } catch (err) {
      console.warn('Backend not responding or still booting:', err);
    }
  }, []);

  // Fetch students (isolated per teacher)
  const fetchAllStudents = useCallback(async (teacherId) => {
    try {
      const tId = teacherId || currentTeacher?.id;
      const url = tId ? `/api/students?teacherId=${encodeURIComponent(tId)}` : '/api/students';
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.warn('Failed to fetch students list:', err);
    }
  }, [currentTeacher?.id]);

  const handleTeacherChange = useCallback((teacher) => {
    setCurrentTeacher(teacher);
    if (teacher) {
      localStorage.setItem('apex_teacher_profile', JSON.stringify(teacher));
      fetchAllStudents(teacher.id);
    } else {
      localStorage.removeItem('apex_teacher_profile');
      fetchAllStudents();
    }
  }, [fetchAllStudents]);

  // Fetch specific student by PIN code (for Parent mode)
  const fetchStudentByCode = useCallback(async (code) => {
    if (!code) {
      setActiveStudent(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    setAccessError('');

    try {
      const res = await fetch(`/api/portal/${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success && data.student) {
        setActiveStudent(data.student);
        if (data.center) setCenter(data.center);
        if (data.announcements) setAnnouncements(data.announcements);
        // Clean the URL so a refresh returns to the PIN screen
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        setActiveStudent(null);
        setAccessError(data.message || 'No student found with this PIN Code. Please check with your teacher.');
      }
    } catch (err) {
      setActiveStudent(null);
      setAccessError('Could not connect to portal. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPublicData();
    fetchAllStudents();

    if (parentCode) {
      fetchStudentByCode(parentCode);
    } else {
      setLoading(false);
    }
  }, [fetchPublicData, fetchAllStudents, fetchStudentByCode, parentCode]);

  // Handle parent code submission
  const handleAccessSubmit = (code) => {
    setParentCode(code);
    fetchStudentByCode(code);
  };

  // Back to access entry
  const handleBackToAccess = () => {
    setParentCode('');
    setActiveStudent(null);
    setAccessError('');
    setIsTeacherPreview(false);
    localStorage.removeItem('apex_student_pin');
    localStorage.removeItem('apex_parent_code');
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    url.searchParams.delete('code');
    url.searchParams.delete('parent');
    window.history.replaceState({}, '', url.pathname);
  };

  // View as parent from teacher admin (teacher preview mode)
  const handleViewAsParent = (code) => {
    setIsTeacherPreview(true);
    setMode('parent');
    setParentCode(code);
    fetchStudentByCode(code);
  };

  // Return back to teacher admin from preview
  const handleExitPreview = () => {
    setIsTeacherPreview(false);
    setMode('teacher');
    setActiveStudent(null);
  };

  // Switch mode
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    setIsTeacherPreview(false);
    if (newMode === 'teacher') {
      fetchAllStudents(currentTeacher?.id);
    }
  };

  // Refresh all data
  const handleRefreshData = () => {
    fetchPublicData();
    fetchAllStudents(currentTeacher?.id);
    if (parentCode) {
      fetchStudentByCode(parentCode);
    }
  };

  // Show teacher switch ONLY when in parent mode on public initial page (no student loaded, not a parent share link)
  const shouldShowTeacherSwitch = mode === 'parent' && !activeStudent && !isParentLink;

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentMode={mode}
        onSwitchMode={handleSwitchMode}
        centerName={center?.name}
        onGoHome={handleBackToAccess}
        showTeacherSwitch={shouldShowTeacherSwitch}
        isTeacherPreview={isTeacherPreview}
        onExitPreview={handleExitPreview}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1 }}>
        {mode === 'parent' ? (
          activeStudent ? (
            <ParentDashboard 
              student={activeStudent}
              center={center}
              announcements={announcements}
              onBackToAccess={handleBackToAccess}
              onShowToast={showToast}
            />
          ) : (
            <ParentAccess 
              onAccessSubmit={handleAccessSubmit}
              centerInfo={center}
              errorMsg={accessError}
              initialPin={prefillPin}
              isParentLink={isParentLink}
              onTeacherClick={() => handleSwitchMode('teacher')}
            />
          )
        ) : (
          <TeacherAdmin 
            students={students}
            center={center}
            currentTeacher={currentTeacher}
            onTeacherChange={handleTeacherChange}
            announcements={announcements}
            onRefreshData={handleRefreshData}
            onViewAsParent={handleViewAsParent}
            onShowToast={showToast}
            onExitAdmin={() => handleSwitchMode('parent')}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
