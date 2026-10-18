import React, { useState } from 'react';
import {
  ArrowRight,
  ShieldCheck,
  FileText,
  CheckCircle,
  KeyRound
} from 'lucide-react';

export default function ParentAccess({
  onAccessSubmit,
  centerInfo,
  errorMsg,
  initialPin = '',
  isParentLink = false,
  onTeacherClick
}) {
  const [pin, setPin] = useState(initialPin);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    onAccessSubmit(pin.trim());
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div className="parent-access-container">
      {/* Main Content Card */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        maxWidth: '560px',
        margin: '1rem auto',
        width: '100%'
      }}>
        <div className="parent-access-card">
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.85rem',
            fontWeight: 700,
            padding: '0.4rem 0.95rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.25rem',
            border: '1px solid rgba(79, 70, 229, 0.2)'
          }}>
            <KeyRound size={16} />
            Direct Parent Access Portal
          </div>

          <h1 style={{
            fontSize: 'clamp(1.6rem, 4vw, 2.1rem)',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em',
            lineHeight: 1.2
          }}>
            Enter Student PIN Code
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1rem',
            lineHeight: 1.6,
            marginBottom: '1.75rem',
            maxWidth: '440px',
            marginInline: 'auto'
          }}>
            Enter your child's 4-digit Student PIN provided by the tutor.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.75rem' }}>
            <div style={{ position: 'relative', marginBottom: '0.5rem', textAlign: 'left' }}>
              <label
                htmlFor="student-pin-field"
                style={{
                  display: 'block',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'var(--text-main)',
                  marginBottom: '0.45rem',
                  textAlign: 'center'
                }}
              >
                Student 4-Digit PIN Code
              </label>

              <input
                id="student-pin-field"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                placeholder="e.g. 9421"
                value={pin}
                maxLength={8}
                onChange={(e) => setPin(e.target.value.toUpperCase())}
                className={`pin-input-field ${errorMsg ? 'error' : ''}`}
                autoFocus
                aria-label="Student 4-digit PIN code"
              />

              <div style={{
                textAlign: 'center',
                fontSize: '0.875rem',
                color: 'var(--text-muted)',
                marginTop: '0.5rem'
              }}>
                💡 Hint: Ask your tutor if you don't have your child's 4-digit code.
              </div>
            </div>

            {errorMsg && (
              <div style={{
                color: '#b91c1c',
                fontSize: '0.925rem',
                fontWeight: 700,
                margin: '0.75rem 0 1rem',
                textAlign: 'center',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)'
              }}>
                ⚠️ {errorMsg}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !pin.trim()}
              style={{
                width: '100%',
                fontWeight: 800,
                fontSize: '1.1rem',
                minHeight: '54px',
                marginTop: '0.75rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              {loading ? 'Finding Records...' : (
                <>
                  Open Child Dashboard
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </form>
        </div>
      </main>

      <footer style={{
        textAlign: 'center',
        fontSize: '0.875rem',
        color: 'var(--text-muted)',
        padding: '1.25rem 0'
      }}>
        <div>{centerInfo?.name || 'Apex Scholars'} • {centerInfo?.activeTerm || 'Academic Year 2026'}</div>
        {!isParentLink && onTeacherClick && (
          <div style={{ marginTop: '0.65rem' }}>
            <button
              type="button"
              onClick={onTeacherClick}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--text-muted)', fontSize: '0.8rem', padding: '0.2rem 0.5rem', opacity: 0.75 }}
            >
              🔒 Teacher & Staff Portal
            </button>
          </div>
        )}
      </footer>
    </div>
  );
}
