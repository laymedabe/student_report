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
  const [parentCode, setParentCode] = useState(() => {
    // Check URL parameters first: ?pin=9421 or legacy ?code=9421
    const params = new URLSearchParams(window.location.search);
    const pinParam = params.get('pin') || params.get('code');
    if (pinParam) return pinParam.trim().toUpperCase();

    // Check hash: #9421
    if (window.location.hash && window.location.hash.length > 1) {
      return window.location.hash.replace('#', '').trim().toUpperCase();
    }

    // Check localStorage
    return localStorage.getItem('apex_student_pin') || localStorage.getItem('apex_parent_code') || '';
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

  // Fetch all students (for Teacher mode)
  const fetchAllStudents = useCallback(async () => {
    try {
      const res = await fetch('/api/students');
      const data = await res.json();
      if (data.success) {
        setStudents(data.students);
      }
    } catch (err) {
      console.warn('Failed to fetch students list:', err);
    }
  }, []);

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
        localStorage.setItem('apex_student_pin', code);
        
        // Update URL query parameter cleanly without reloading (?pin=9421)
        const url = new URL(window.location.href);
        url.searchParams.set('pin', code);
        url.searchParams.delete('code');
        window.history.replaceState({}, '', url.toString());
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
    localStorage.removeItem('apex_student_pin');
    localStorage.removeItem('apex_parent_code');
    const url = new URL(window.location.href);
    url.searchParams.delete('pin');
    url.searchParams.delete('code');
    window.history.replaceState({}, '', url.pathname);
  };

  // View as parent from teacher admin
  const handleViewAsParent = (code) => {
    setMode('parent');
    setParentCode(code);
    fetchStudentByCode(code);
  };

  // Switch mode
  const handleSwitchMode = (newMode) => {
    setMode(newMode);
    if (newMode === 'teacher') {
      fetchAllStudents();
    }
  };

  // Refresh all data
  const handleRefreshData = () => {
    fetchPublicData();
    fetchAllStudents();
    if (parentCode) {
      fetchStudentByCode(parentCode);
    }
  };

  return (
    <div className="app-container">
      {/* Top Navbar */}
      <Navbar 
        currentMode={mode}
        onSwitchMode={handleSwitchMode}
        centerName={center?.name}
        onGoHome={handleBackToAccess}
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
            />
          )
        ) : (
          <TeacherAdmin 
            students={students}
            center={center}
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
