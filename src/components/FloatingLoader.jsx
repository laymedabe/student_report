import React, { useState, useEffect } from 'react';
import { Loader2, Clock, Sparkles } from 'lucide-react';

export default function FloatingLoader({
  isLoading,
  message = 'Finding Student Records...',
  submessage = 'Please wait while we retrieve the latest progress, session logs & report cards.'
}) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    let timer;
    if (isLoading) {
      setElapsed(0);
      timer = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      setElapsed(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(15, 23, 42, 0.45)',
      backdropFilter: 'blur(6px)',
      WebkitBackdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1.25rem',
      animation: 'fadeInLoader 0.25s ease-out'
    }}>
      <style>{`
        @keyframes fadeInLoader {
          from { opacity: 0; transform: scale(0.96); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes spinLoader {
          to { transform: rotate(360deg); }
        }
        @keyframes pulseProgress {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>

      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        padding: 'clamp(1.5rem, 5vw, 2rem) clamp(1.2rem, 5vw, 2.25rem)',
        maxWidth: 'min(92vw, 440px)',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(2, 132, 199, 0.15)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.85rem'
      }}>
        {/* Brand Logo */}
        <img
          src="/logo.png"
          alt="Logic Lane Learning Center"
          style={{ height: '44px', width: 'auto', objectFit: 'contain' }}
        />

        {/* Animated Glowing Ring & Spinner */}
        <div style={{
          position: 'relative',
          width: '60px',
          height: '60px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            border: '4px solid #e0f2fe',
            borderTopColor: '#0284c7',
            animation: 'spinLoader 1s linear infinite'
          }} />
          <Sparkles size={22} color="#0284c7" />
        </div>

        {/* Headline & Subtitle */}
        <div>
          <h3 style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--text-main, #0f172a)',
            marginBottom: '0.4rem',
            letterSpacing: '-0.01em'
          }}>
            {message}
          </h3>
          <p style={{
            fontSize: '0.9rem',
            color: 'var(--text-muted, #64748b)',
            lineHeight: 1.5,
            margin: 0
          }}>
            {submessage}
          </p>
        </div>

        {/* Dynamic Progress / Delay Indicator */}
        <div style={{
          width: '100%',
          marginTop: '0.35rem'
        }}>
          {/* Animated Gradient Bar matching Logo (Blue -> Sky -> Green -> Blue) */}
          <div style={{
            width: '100%',
            height: '6px',
            background: 'linear-gradient(90deg, #0284c7, #38bdf8, #22c55e, #0284c7)',
            backgroundSize: '200% 200%',
            animation: 'pulseProgress 2s ease infinite',
            borderRadius: '999px',
            overflow: 'hidden',
            marginBottom: '0.75rem'
          }} />

          {/* If delay occurs (> 2 seconds), display helpful wait notice */}
          {elapsed >= 2 && (
            <div style={{
              background: '#fffbeb',
              border: '1px solid #fde68a',
              borderRadius: '12px',
              padding: '0.75rem 1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.65rem',
              textAlign: 'left',
              boxShadow: '0 2px 6px rgba(217, 119, 6, 0.08)',
              animation: 'fadeInLoader 0.3s ease-out'
            }}>
              <div style={{
                background: '#fef3c7',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Clock size={18} color="#d97706" />
              </div>
              <div style={{ fontSize: '0.84rem', color: '#92400e', lineHeight: 1.45, flex: 1 }}>
                <strong style={{ display: 'block', marginBottom: '2px' }}>
                  ⏳ Please wait ({elapsed}s) — Connecting...
                </strong>
                {elapsed >= 5
                  ? 'Cloud database is processing your request. Please hold on — almost there!'
                  : 'Taking a few seconds longer than usual. Please stay on this page.'}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
