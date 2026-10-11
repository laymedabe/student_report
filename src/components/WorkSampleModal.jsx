import React from 'react';
import { X, Calendar, Award, BookOpen, ExternalLink } from 'lucide-react';

export default function WorkSampleModal({ work, onClose }) {
  if (!work) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        style={{ maxWidth: '800px', padding: '1.75rem' }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{ marginBottom: '1rem' }}>
          <div>
            <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
              {work.type || 'Work Sample'}
            </span>
            <h2 style={{ fontSize: '1.4rem' }}>{work.title}</h2>
          </div>
          <button 
            className="btn btn-ghost" 
            onClick={onClose} 
            style={{ padding: '0.4rem', borderRadius: '50%' }}
            aria-label="Close modal"
          >
            <X size={20} />
          </button>
        </div>

        {/* Media Preview */}
        <div 
          style={{ 
            borderRadius: 'var(--radius-md)', 
            overflow: 'hidden', 
            background: '#0f172a',
            maxHeight: '440px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            position: 'relative'
          }}
        >
          <img 
            src={work.imageUrl} 
            alt={work.title} 
            style={{ 
              maxWidth: '100%', 
              maxHeight: '440px', 
              objectFit: 'contain' 
            }}
          />
          {work.score && (
            <div 
              style={{
                position: 'absolute',
                top: '14px',
                right: '14px',
                background: '#10b981',
                color: 'white',
                padding: '0.4rem 0.9rem',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
                fontSize: '0.85rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Award size={16} />
              {work.score}
            </div>
          )}
        </div>

        {/* Details row */}
        <div 
          style={{ 
            display: 'flex', 
            gap: '1.5rem', 
            fontSize: '0.875rem', 
            color: 'var(--text-muted)', 
            marginBottom: '1rem',
            flexWrap: 'wrap'
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} color="var(--primary)" />
            Subject: <strong>{work.subject}</strong>
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <Calendar size={16} />
            Submitted: <strong>{work.date}</strong>
          </span>
        </div>

        {/* Teacher Feedback Box */}
        {work.feedback && (
          <div 
            style={{ 
              background: '#f8fafc', 
              borderLeft: '4px solid var(--primary)', 
              borderRadius: '0 8px 8px 0', 
              padding: '1rem 1.25rem',
              fontSize: '0.925rem'
            }}
          >
            <strong style={{ display: 'block', marginBottom: '0.25rem', color: 'var(--primary)' }}>
              Teacher Feedback & Observations:
            </strong>
            <p style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>{work.feedback}</p>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', gap: '0.75rem' }}>
          <a 
            href={work.imageUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="btn btn-secondary btn-sm"
          >
            <ExternalLink size={15} />
            Open Full Resolution Image
          </a>
          <button className="btn btn-primary btn-sm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
