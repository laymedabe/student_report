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
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.75rem' }}
        >
          <img
            src="/logo.png"
            alt="Logic Lane Learning Center"
            className="navbar-logo-img"
            style={{
              height: '46px',
              width: 'auto',
              maxHeight: '46px',
              objectFit: 'contain'
            }}
          />
          <div>
            <div className="brand-title">
              {centerName || 'Logic Lane Learning Center'}
            </div>
            <div className="brand-subtitle" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: '0.75rem', letterSpacing: '0.04em' }}>
              Learning Center • Excellentia Valores Competentia
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
              <ShieldCheck size={16} />
              <span className="nav-btn-text-full"></span>
              <span className="nav-btn-text-mobile">Teacher Portal</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
