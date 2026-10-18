import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, ArrowLeft } from 'lucide-react';

export default function Navbar({
  currentMode,
  onSwitchMode,
  centerName,
  onGoHome,
  isTeacherPreview = false,
  onExitPreview
}) {
  return (
    <header className="top-nav no-print">
      <div className="nav-content">
        {/* Brand */}
        <div
          className="brand-badge"
          onClick={onGoHome}
          style={{ cursor: 'pointer' }}
        >
          <div className="brand-icon">
            <GraduationCap size={20} />
          </div>
          <div>
            <div className="brand-title">
              {centerName || 'Apex Scholars'}
            </div>
            <div className="brand-subtitle">
              Learning & Tutorial Hub
            </div>
          </div>
        </div>

        {/* Mode switch */}
        <div className="nav-actions">
          {isTeacherPreview ? (
            <button
              className="btn btn-secondary nav-mode-btn"
              onClick={onExitPreview}
              style={{
                borderColor: '#c7d2fe',
                background: '#eef2ff',
                color: 'var(--primary)',
                fontWeight: 700
              }}
              aria-label="Return to Teacher Admin Mode"
            >
              <ArrowLeft size={16} />
              <span className="nav-btn-text-full">Return to Teacher Admin</span>
              <span className="nav-btn-text-mobile">Admin</span>
            </button>
          ) : currentMode === 'teacher' ? (
            <button
              className="btn btn-primary nav-mode-btn"
              onClick={() => onSwitchMode('parent')}
              aria-label="Switch to Parent Portal View"
            >
              <UserCheck size={16} />
              <span className="nav-btn-text-full">Parent Portal</span>
              <span className="nav-btn-text-mobile"></span>
            </button>
          ) : (
            <button
              className="btn btn-secondary nav-mode-btn"
              onClick={() => onSwitchMode('teacher')}
              aria-label="Switch to Teacher Portal"
            >
              <ShieldCheck size={16} color="var(--primary)" />
              <span className="nav-btn-text-full"></span>
              <span className="nav-btn-text-mobile">Teacher Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
