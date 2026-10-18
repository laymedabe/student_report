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
          style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.85rem' }}
        >
          <img
            src="/logo.png"
            alt="Logic Lane Learning Center"
            className="navbar-logo-img"
            style={{
              height: '50px',
              width: 'auto',
              maxHeight: '50px',
              objectFit: 'contain',
              filter: 'drop-shadow(0 2px 8px rgba(2, 132, 199, 0.15))',
              display: 'block'
            }}
          />
          <div>
            <div className="brand-title" style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              {centerName || 'Logic Lane Learning Center'}
            </div>
            <div className="brand-subtitle" style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '0.72rem', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Excellentia Valores Competentia
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
