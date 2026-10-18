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
  // Detect if user opened a parent share link (?pin=... or ?parent=1) and persist across refresh
  const [isParentLink] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const hasParentParam = params.has('pin') || params.has('code') || params.get('parent') === '1' || params.get('view') === 'parent';
    if (hasParentParam) {
      sessionStorage.setItem('apex_role', 'parent');
    }
    return hasParentParam || sessionStorage.getItem('apex_role') === 'parent';
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

  // Teacher state: session-only, not stored in localStorage to prevent auto-login
  const [currentTeacher, setCurrentTeacher] = useState(null);

  // Clear any existing stored credentials on load
  useEffect(() => {
    localStorage.removeItem('apex_teacher_profile');
    localStorage.removeItem('apex_student_pin');
    localStorage.removeItem('apex_parent_code');
  }, []);

  // Warning when refreshing or leaving page while logged in (returns to login portal)
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (activeStudent || currentTeacher) {
        e.preventDefault();
        e.returnValue = 'Refreshing will return you to the login portal. Are you sure you want to proceed?';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [activeStudent, currentTeacher]);

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
      fetchAllStudents(teacher.id);
    } else {
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
    if (newMode === 'parent') {
      // Clear teacher session so switching to teacher portal requires entering passcode
      setCurrentTeacher(null);
    }
    if (newMode === 'teacher') {
      setCurrentTeacher(null);
      fetchAllStudents();
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

  // Handle direct teacher admin route via URL (#admin, #teacher, ?admin=1)
  useEffect(() => {
    const checkAdminRoute = () => {
      const params = new URLSearchParams(window.location.search);
      const hash = window.location.hash;
      if (params.get('admin') === '1' || params.get('teacher') === '1' || hash === '#admin' || hash === '#teacher') {
        sessionStorage.removeItem('apex_role');
        setMode('teacher');
      }
    };
    checkAdminRoute();
    window.addEventListener('hashchange', checkAdminRoute);
    return () => window.removeEventListener('hashchange', checkAdminRoute);
  }, []);

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentMode={mode}
        onSwitchMode={handleSwitchMode}
        centerName={center?.name}
        onGoHome={handleBackToAccess}
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
