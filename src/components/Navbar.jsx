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
              className="btn btn-secondary btn-sm"
              onClick={() => onSwitchMode('teacher')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              <ShieldCheck size={16} color="var(--primary)" />
              Teacher Admin
            </button>
          ) : (
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => onSwitchMode('parent')}
              style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}
            >
              <UserCheck size={16} />
              Parent Portal View
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
