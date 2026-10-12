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
            <GraduationCap size={22} />
          </div>
          <div>
            <div style={{ fontSize: '1.1rem', fontWeight: 800, letterSpacing: '-0.01em', lineHeight: 1.1 }}>
              {centerName || 'Apex Scholars'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              Learning & Tutorial Hub
            </div>
          </div>
        </div>

        {/* Mode switch */}
        <div className="nav-actions">
          {currentMode === 'parent' ? (
            <button 
              className="btn btn-secondary"
              onClick={() => onSwitchMode('teacher')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, minHeight: '44px', padding: '0.55rem 1rem', fontSize: '0.9rem' }}
              aria-label="Switch to Teacher Admin Mode"
            >
              <ShieldCheck size={18} color="var(--primary)" />
              <span>Teacher Admin</span>
            </button>
          ) : (
            <button 
              className="btn btn-primary"
              onClick={() => onSwitchMode('parent')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700, minHeight: '44px', padding: '0.55rem 1rem', fontSize: '0.9rem' }}
              aria-label="Switch to Parent Portal View"
            >
              <UserCheck size={18} />
              <span>Parent Portal View</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
