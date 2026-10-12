import React from 'react';
import { GraduationCap, ShieldCheck, UserCheck, ArrowRight, Home } from 'lucide-react';

export default function Navbar({ 
  currentMode, 
  onSwitchMode, 
  centerName, 
  onGoHome 
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
          {currentMode === 'parent' ? (
            <button 
              className="btn btn-secondary nav-mode-btn"
              onClick={() => onSwitchMode('teacher')}
              aria-label="Switch to Teacher Admin Mode"
            >
              <ShieldCheck size={16} color="var(--primary)" />
              <span className="nav-btn-text-full">Teacher Admin</span>
              <span className="nav-btn-text-mobile">Teacher</span>
            </button>
          ) : (
            <button 
              className="btn btn-primary nav-mode-btn"
              onClick={() => onSwitchMode('parent')}
              aria-label="Switch to Parent Portal View"
            >
              <UserCheck size={16} />
              <span className="nav-btn-text-full">Parent Portal View</span>
              <span className="nav-btn-text-mobile">Parent View</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
