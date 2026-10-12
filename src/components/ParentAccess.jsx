import React, { useState } from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  FileText, 
  CheckCircle,
  KeyRound
} from 'lucide-react';

export default function ParentAccess({ onAccessSubmit, centerInfo, errorMsg }) {
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!pin.trim()) return;
    setLoading(true);
    onAccessSubmit(pin.trim());
    setTimeout(() => setLoading(false), 400);
  };

  return (
    <div style={{
      minHeight: 'calc(100vh - 72px)',
      display: 'flex',
      flexDirection: 'column',
      background: 'radial-gradient(circle at top right, #e0e7ff 0%, #f8fafc 50%, #f1f5f9 100%)',
      padding: '2rem 1.5rem'
    }}>
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
        <div style={{
          background: 'white',
          borderRadius: 'var(--radius-xl)',
          padding: '2.75rem 2.25rem',
          boxShadow: 'var(--shadow-xl)',
          border: '1px solid var(--border-light)',
          width: '100%',
          textAlign: 'center'
        }}>
          {/* Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            background: 'var(--primary-light)',
            color: 'var(--primary)',
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.35rem 0.85rem',
            borderRadius: 'var(--radius-full)',
            marginBottom: '1.25rem'
          }}>
            <KeyRound size={14} />
            Direct Parent PIN Access
          </div>

          <h1 style={{
            fontSize: '1.95rem',
            fontWeight: 800,
            color: 'var(--text-main)',
            marginBottom: '0.75rem',
            letterSpacing: '-0.02em'
          }}>
            Enter Student PIN Code
          </h1>

          <p style={{
            color: 'var(--text-muted)',
            fontSize: '0.95rem',
            lineHeight: 1.55,
            marginBottom: '2rem',
            maxWidth: '440px',
            marginInline: 'auto'
          }}>
            Enter your child's 4-digit Student PIN provided by the tutor.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.75rem' }}>
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <input 
                type="text" 
                placeholder="PIN: e.g. 9421"
                value={pin}
                maxLength={8}
                onChange={(e) => setPin(e.target.value)}
                style={{
                  width: '100%',
                  padding: '1.1rem 1.25rem',
                  fontSize: '1.5rem',
                  fontWeight: 800,
                  letterSpacing: '0.18em',
                  textAlign: 'center',
                  borderRadius: 'var(--radius-lg)',
                  border: errorMsg ? '2px solid #ef4444' : '2px solid var(--border-strong)',
                  background: '#f8fafc',
                  color: 'var(--text-main)',
                  outline: 'none',
                  transition: 'border-color 0.2s, box-shadow 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = errorMsg ? '#ef4444' : 'var(--border-strong)'}
                autoFocus
              />
            </div>

            {errorMsg && (
              <div style={{
                color: '#ef4444',
                fontSize: '0.85rem',
                fontWeight: 600,
                marginBottom: '1rem',
                textAlign: 'center',
                background: '#fef2f2',
                padding: '0.5rem 0.75rem',
                borderRadius: 'var(--radius-sm)'
              }}>
                {errorMsg}
              </div>
            )}

            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading || !pin.trim()}
              style={{
                width: '100%',
                fontWeight: 700,
                fontSize: '1.05rem',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.4)'
              }}
            >
              {loading ? 'Finding Records...' : (
                <>
                  Open Child Dashboard
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Value Props */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '0.75rem',
            textAlign: 'center',
            fontSize: '0.78rem',
            color: 'var(--text-muted)',
            paddingTop: '0.5rem'
          }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <CheckCircle size={18} color="#10b981" />
              <span>Instant PIN Access</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <FileText size={18} color="#4f46e5" />
              <span>Official Reports</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
              <ShieldCheck size={18} color="#0d9488" />
              <span>Secure & Private</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        fontSize: '0.825rem',
        color: 'var(--text-subtle)',
        padding: '1rem 0'
      }}>
        {centerInfo?.name || 'Apex Scholars'} • {centerInfo?.activeTerm || 'Academic Year 2026'}
      </footer>
    </div>
  );
}
