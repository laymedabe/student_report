import React, { useState } from 'react';
import {
  Calendar,
  BookOpen,
  Award,
  CheckCircle2,
  Clock,
  Printer,
  Share2,
  Star,
  ArrowLeft,
  FileText,
  Sparkles,
  Phone,
  Mail,
  KeyRound
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ParentDashboard({
  student,
  center,
  announcements = [],
  onBackToAccess,
  onShowToast
}) {
  const [activeTab, setActiveTab] = useState('overview');
  const [subjectFilter, setSubjectFilter] = useState('All');

  // Trigger celebration confetti
  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Copy portal link to clipboard (with PIN code!)
  const handleCopyLink = () => {
    const studentPin = student.pinCode || student.accessCode;
    const url = `${window.location.origin}${window.location.pathname}?pin=${studentPin}&parent=1`;
    navigator.clipboard.writeText(url).then(() => {
      if (onShowToast) {
        onShowToast({
          type: 'success',
          message: 'Direct portal link copied to clipboard!'
        });
      }
    });
  };

  // Print Report Card directly
  const handlePrint = () => {
    setActiveTab('report');
    setTimeout(() => {
      window.print();
    }, 250);
  };

  // Filter sessions
  const filteredSessions = (student.sessions || []).filter(session => {
    if (subjectFilter === 'All') return true;
    return session.subject === subjectFilter;
  });

  const latestSession = student.sessions && student.sessions.length > 0 ? student.sessions[0] : null;
  const latestReport = student.reports && student.reports.length > 0 ? student.reports[0] : null;

  // Calculate attendance rate
  const totalSessions = (student.sessions || []).length;
  const presentCount = (student.sessions || []).filter(s => s.attendance === 'Present').length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  // Monthly Sessions Allowance & Automatic Countdown
  const monthlyQuota = Number(student.monthlySessions) > 0 ? Number(student.monthlySessions) : 12;
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });

  const monthSessions = (student.sessions || []).filter(s => {
    if (!s.date) return false;
    const parts = String(s.date).split('-');
    if (parts.length >= 2) {
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      return y === curYear && m === curMonth;
    }
    const d = new Date(s.date);
    return !isNaN(d.getTime()) && d.getFullYear() === curYear && d.getMonth() === curMonth;
  });

  const completedThisMonth = monthSessions.filter(
    s => s.attendance !== 'Cancelled' && s.attendance !== 'Excused Absence'
  ).length;

  const remainingThisMonth = Math.max(0, monthlyQuota - completedThisMonth);
  const isMonthFinished = remainingThisMonth === 0;
  const monthPercent = Math.min(100, Math.round((completedThisMonth / monthlyQuota) * 100));

  const displayPin = student.pinCode || student.accessCode;

  return (
    <div className="max-width-wrapper" style={{ paddingBottom: '4rem' }}>
      {/* Top Bar for Parent */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1rem 0 0.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <button
          className="btn btn-ghost btn-sm"
          onClick={onBackToAccess}
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-muted)' }}
        >
          <ArrowLeft size={16} />
          Switch Student / Enter Another PIN
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <KeyRound size={15} color="var(--primary)" />
            Student PIN: <strong style={{ color: 'var(--primary)', letterSpacing: '0.08em', fontSize: '0.95rem' }}>{displayPin}</strong>
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={handleCopyLink}
            title="Copy shareable link for WhatsApp/Email"
          >
            <Share2 size={14} />
            Share Link
          </button>
        </div>
      </div>

      {/* Pinned Announcement Alert (if any) */}
      {announcements.length > 0 && (
        <div className="no-print" style={{ marginTop: '0.75rem' }}>
          {announcements.filter(a => a.isPinned).map(ann => (
            <div key={ann.id} className="notice-card">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <Sparkles size={20} color="var(--primary)" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--primary)' }}>
                    Center Notice: {ann.title}
                  </strong>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                    {ann.content}
                  </p>
                </div>
              </div>
              <span className="badge badge-indigo" style={{ fontSize: '0.7rem' }}>
                {ann.date}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Student Hero Profile Banner */}
      <div className="student-hero-card">
        <div className="hero-layout">
          <div className="hero-profile">
            <img
              src={student.avatar || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?w=200&auto=format&fit=crop&q=80"}
              alt={student.fullName}
              className="student-avatar-lg"
            />
            <div className="hero-info">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <h1>{student.fullName}</h1>
                <span className="badge badge-emerald" style={{ background: 'rgba(16, 185, 129, 0.25)', color: '#a7f3d0' }}>
                  {student.status || 'Active Tutee'}
                </span>
              </div>

              <div className="hero-subtitle">
                <span>{student.grade}</span>
                <span>•</span>
                <span>Parent: {student.parentName}</span>
                <span>•</span>
                <span>Enrolled: {student.enrolledDate}</span>
              </div>

              <div className="hero-tags">
                {(student.subjects || []).map((sub, idx) => (
                  <span key={idx} className="hero-tag">
                    {sub}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Monthly Sessions Countdown Widget */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.12)',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            borderRadius: '16px',
            padding: '1rem 1.25rem',
            color: 'white',
            minWidth: '260px',
            maxWidth: '360px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
              <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#e0e7ff', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Calendar size={15} color="#fbbf24" />
                {monthName} Sessions
              </span>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.55rem',
                borderRadius: '12px',
                background: isMonthFinished ? '#10b981' : 'rgba(255, 255, 255, 0.2)',
                color: 'white'
              }}>
                {isMonthFinished ? 'All Done! 🎉' : `${remainingThisMonth} Left`}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, lineHeight: 1, color: isMonthFinished ? '#34d399' : '#ffffff' }}>
                {remainingThisMonth}
              </span>
              <span style={{ fontSize: '0.95rem', color: '#c7d2fe', fontWeight: 500 }}>
                of {monthlyQuota} sessions left
              </span>
            </div>

            {/* Progress Bar */}
            <div style={{
              width: '100%',
              height: '8px',
              background: 'rgba(255, 255, 255, 0.2)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '0.35rem'
            }}>
              <div style={{
                width: `${monthPercent}%`,
                height: '100%',
                background: isMonthFinished ? '#10b981' : '#fbbf24',
                borderRadius: '999px',
                transition: 'width 0.4s ease'
              }} />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#e0e7ff' }}>
              <span>{completedThisMonth} conducted</span>
              <span>{monthPercent}% completed</span>
            </div>
          </div>

          <div className="hero-actions no-print">
            <button
              className="btn btn-secondary btn-sm"
              onClick={handlePrint}
              style={{ background: 'rgba(255, 255, 255, 0.9)', color: '#1e1b4b', fontWeight: 700 }}
            >
              <Printer size={16} />
              Print / Save PDF Report
            </button>
            <button
              className="btn btn-primary btn-sm"
              onClick={triggerConfetti}
              style={{ background: '#f59e0b', color: '#1e1b4b', fontWeight: 700 }}
            >
              <Sparkles size={16} />
              Celebrate Progress! 🎉
            </button>
          </div>
        </div>

        {student.learningGoals && (
          <div style={{
            marginTop: '1.5rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.15)',
            fontSize: '0.9rem',
            color: '#e0e7ff',
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem'
          }}>
            <strong style={{ color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Award size={16} /> Current Focus:
            </strong>
            <span>{student.learningGoals}</span>
          </div>
        )}
      </div>

      {/* Quick KPI Stats Grid */}
      <div className="stats-grid no-print">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Calendar size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{remainingThisMonth} / {monthlyQuota}</div>
            <div className="stat-label">Sessions Left ({monthName})</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#ecfdf5', color: '#059669' }}>
            <CheckCircle2 size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{attendanceRate}%</div>
            <div className="stat-label">Attendance Rate</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fffbeb', color: '#d97706' }}>
            <Award size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{latestReport?.overallGrade || 'A (94%)'}</div>
            <div className="stat-label">Academic Rating</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f5f3ff', color: '#7c3aed' }}>
            <BookOpen size={26} />
          </div>
          <div className="stat-content">
            <div className="stat-value">{(student.subjects || []).length}</div>
            <div className="stat-label">Enrolled Subjects</div>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="tabs-container no-print">
        <button
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          <Sparkles size={18} />
          Overview & Highlights
        </button>

        <button
          className={`tab-btn ${activeTab === 'sessions' ? 'active' : ''}`}
          onClick={() => setActiveTab('sessions')}
        >
          <Calendar size={18} />
          Session Logs
          <span className="tab-badge">{totalSessions}</span>
        </button>

        <button
          className={`tab-btn ${activeTab === 'progress' ? 'active' : ''}`}
          onClick={() => setActiveTab('progress')}
        >
          <Award size={18} />
          Progress & Growth
        </button>

        <button
          className={`tab-btn ${activeTab === 'report' ? 'active' : ''}`}
          onClick={() => setActiveTab('report')}
        >
          <FileText size={18} />
          Official Report Card
          {latestReport && <span className="tab-badge">Published</span>}
        </button>
      </div>

      {/* ========================================================
          TAB 1: OVERVIEW & HIGHLIGHTS
          ======================================================== */}
      {activeTab === 'overview' && (
        <div>
          {/* Latest Session Spotlight */}
          {latestSession ? (
            <div className="card" style={{ borderLeft: '4px solid var(--primary)' }}>
              <div className="card-header">
                <div>
                  <span className="badge badge-indigo" style={{ marginBottom: '0.4rem' }}>
                    Most Recent Session • {latestSession.date}
                  </span>
                  <h3 className="card-title" style={{ fontSize: '1.35rem' }}>
                    {latestSession.topic}
                  </h3>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b' }}>
                  {[...Array(latestSession.rating || 5)].map((_, i) => (
                    <Star key={i} size={18} fill="#f59e0b" />
                  ))}
                </div>
              </div>

              <div className="session-notes-box">
                <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '0.35rem', fontSize: '0.85rem' }}>
                  Teacher's Observation & Remarks:
                </strong>
                {latestSession.tutorNotes}
              </div>

              <div className="session-footer-grid">
                <div className="footer-item">
                  <span className="footer-item-label">Subject</span>
                  <span className="footer-item-val">{latestSession.subject}</span>
                </div>
                <div className="footer-item">
                  <span className="footer-item-label">Attendance</span>
                  <span className="footer-item-val" style={{ color: '#059669' }}>
                    {latestSession.attendance}
                  </span>
                </div>
                <div className="footer-item">
                  <span className="footer-item-label">Homework Status</span>
                  <span className="footer-item-val">{latestSession.homework}</span>
                </div>
                {latestSession.nextSteps && (
                  <div className="footer-item">
                    <span className="footer-item-label">Next Lesson Focus</span>
                    <span className="footer-item-val">{latestSession.nextSteps}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <Clock size={36} color="var(--text-subtle)" style={{ margin: '0 auto 1rem' }} />
              <h3>No Sessions Logged Yet</h3>
              <p style={{ color: 'var(--text-muted)' }}>
                Your tutor will post updates after your first tutoring session!
              </p>
            </div>
          )}

          {/* Teacher Contact & Message */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '1.5rem',
            marginTop: '1.5rem'
          }}>
            <div className="card">
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <Sparkles size={18} color="var(--primary)" />
                Tutor Summary & Praise
              </h3>
              <p style={{ fontSize: '0.925rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {latestReport?.tutorSummary ||
                  `${student.preferredName || student.fullName} is demonstrating tremendous effort, engagement, and consistent focus during our tutoring sessions. We are proud of the dedication shown each week!`
                }
              </p>
            </div>

            <div className="card">
              <h3 className="card-title" style={{ fontSize: '1.1rem', marginBottom: '1rem' }}>
                <Phone size={18} color="#059669" />
                Contact Your Tutor
              </h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Have questions or need to discuss your child's schedule? Reach out directly:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <strong>Instructor:</strong> {center?.tutorName || 'Teacher Sarah'}
                </div>
                {center?.phone && (
                  <a href={`tel:${center.phone}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Phone size={15} /> {center.phone}
                  </a>
                )}
                {center?.email && (
                  <a href={`mailto:${center.email}`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--primary)', fontWeight: 600 }}>
                    <Mail size={15} /> {center.email}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: SESSION LOGS TIMELINE
          ======================================================== */}
      {activeTab === 'sessions' && (
        <div>
          {/* Monthly Sessions Allowance Status Banner */}
          <div style={{
            background: 'linear-gradient(135deg, #f0f9ff 0%, #f0fdf4 100%)',
            border: '1px solid #bae6fd',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.25rem',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'var(--primary)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <Calendar size={20} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {monthName} Sessions: {remainingThisMonth} of {monthlyQuota} Remaining
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  {completedThisMonth} session{completedThisMonth === 1 ? '' : 's'} completed this month • {isMonthFinished ? 'Monthly goal achieved! 🎉' : `${remainingThisMonth} remaining to complete`}
                </div>
              </div>
            </div>

            <div style={{
              fontWeight: 800,
              fontSize: '1.1rem',
              color: isMonthFinished ? '#059669' : 'var(--primary)',
              background: 'white',
              padding: '0.4rem 0.85rem',
              borderRadius: '999px',
              border: '1px solid #e0e7ff',
              boxShadow: '0 2px 4px rgba(0,0,0,0.03)'
            }}>
              {completedThisMonth} / {monthlyQuota} Done
            </div>
          </div>

          {/* Filter Bar */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                className={`btn btn-sm ${subjectFilter === 'All' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setSubjectFilter('All')}
              >
                All Subjects ({totalSessions})
              </button>
              {(student.subjects || []).map((sub, idx) => (
                <button
                  key={idx}
                  className={`btn btn-sm ${subjectFilter === sub ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setSubjectFilter(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>

            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredSessions.length} session{filteredSessions.length === 1 ? '' : 's'}
            </span>
          </div>

          {/* Session Cards List */}
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const sessionDate = new Date(session.date);
              const day = isNaN(sessionDate.getDate()) ? '10' : sessionDate.getDate();
              const month = isNaN(sessionDate.toLocaleString('default', { month: 'short' }))
                ? 'OCT'
                : sessionDate.toLocaleString('default', { month: 'short' }).toUpperCase();

              return (
                <div key={session.id} className="session-card">
                  <div className="session-header">
                    <div className="session-date-box">
                      <div className="date-circle">
                        <span>{day}</span>
                        {month}
                      </div>
                      <div>
                        <div className="session-topic-title">{session.topic}</div>
                        <div className="session-meta-row">
                          <span className="badge badge-indigo">{session.subject}</span>
                          <span className="badge badge-emerald">{session.attendance}</span>
                          {session.badge && (
                            <span className="badge badge-amber">
                              <Award size={12} />
                              {session.badge}
                            </span>
                          )}
                          <span style={{ fontSize: '0.8rem', color: 'var(--text-subtle)' }}>
                            {session.duration || '60 mins'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#f59e0b' }}>
                      {[...Array(session.rating || 5)].map((_, i) => (
                        <Star key={i} size={16} fill="#f59e0b" />
                      ))}
                    </div>
                  </div>

                  {session.tutorNotes && (
                    <div className="session-notes-box">
                      <strong style={{ display: 'block', color: 'var(--primary)', marginBottom: '0.25rem', fontSize: '0.8rem' }}>
                        Tutor Feedback & Skills Practiced:
                      </strong>
                      {session.tutorNotes}
                    </div>
                  )}

                  <div className="session-footer-grid">
                    <div className="footer-item">
                      <span className="footer-item-label">Homework Status</span>
                      <span className="footer-item-val">{session.homework || 'Completed'}</span>
                    </div>
                    {session.nextSteps && (
                      <div className="footer-item">
                        <span className="footer-item-label">Next Lesson Plan</span>
                        <span className="footer-item-val">{session.nextSteps}</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '3rem' }}>
              <p style={{ color: 'var(--text-muted)' }}>
                No sessions logged under "{subjectFilter}".
              </p>
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          TAB 3: ACADEMIC PROGRESS & GROWTH
          ======================================================== */}
      {activeTab === 'progress' && (
        <div>
          {/* Subject Mastery Evaluations */}
          <div className="card">
            <h3 className="card-title" style={{ marginBottom: '1.25rem' }}>
              <Award size={20} color="var(--primary)" />
              Subject Mastery & Competency Matrix
            </h3>

            {latestReport?.subjectEvaluations && latestReport.subjectEvaluations.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {latestReport.subjectEvaluations.map((item, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: '#f8fafc',
                      padding: '1.25rem',
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border-light)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>
                        {item.subject}
                      </strong>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span className="badge badge-indigo">{item.mastery || 'Proficient'}</span>
                        <span className="badge badge-emerald">{item.grade}</span>
                      </div>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                      {item.comment}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.925rem' }}>
                Subject evaluations will populate when the teacher publishes the comprehensive term report.
              </p>
            )}
          </div>

          {/* Strengths & Growth Areas */}
          {latestReport && (
            <div className="report-evaluation-section">
              <div className="eval-box">
                <h4>
                  <CheckCircle2 size={18} color="#059669" />
                  Key Strengths & Achievements
                </h4>
                <ul className="eval-list">
                  {(latestReport.strengths || []).map((s, idx) => (
                    <li key={idx}>
                      <span style={{ color: '#059669', fontWeight: 700 }}>✓</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="eval-box">
                <h4>
                  <Sparkles size={18} color="#f59e0b" />
                  Target Areas for Next Growth Phase
                </h4>
                <ul className="eval-list">
                  {(latestReport.areasForGrowth || []).map((g, idx) => (
                    <li key={idx}>
                      <span style={{ color: '#f59e0b', fontWeight: 700 }}>•</span>
                      <span>{g}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Honors & Milestones */}
          <div className="card" style={{ marginTop: '1.5rem' }}>
            <h3 className="card-title" style={{ marginBottom: '1rem' }}>
              <Sparkles size={20} color="#f59e0b" />
              Earned Badges & Milestones
            </h3>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              <div
                onClick={triggerConfetti}
                style={{
                  background: '#fffbeb',
                  border: '1px solid #fde68a',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'transform 0.2s'
                }}
                title="Click to celebrate!"
              >
                <div style={{ fontSize: '1.75rem' }}>🌟</div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#92400e' }}>
                    100% Attendance Club
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#b45309' }}>Perfect punctuality</span>
                </div>
              </div>

              <div
                onClick={triggerConfetti}
                style={{
                  background: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '1.75rem' }}>📐</div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--primary-hover)' }}>
                    Word Problem Master
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#4338ca' }}>Multi-step problem solver</span>
                </div>
              </div>

              <div
                onClick={triggerConfetti}
                style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  padding: '1rem 1.25rem',
                  borderRadius: 'var(--radius-lg)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontSize: '1.75rem' }}>🏆</div>
                <div>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#065f46' }}>
                    Homework Perfectionist
                  </strong>
                  <span style={{ fontSize: '0.75rem', color: '#047857' }}>Consistently on time</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}



      {/* ========================================================
          TAB 5: OFFICIAL PRINTABLE PROGRESS REPORT CARD
          ======================================================== */}
      {activeTab === 'report' && (
        <div>
          {/* Action Header for PDF Download / Print */}
          <div className="no-print" style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            background: 'white',
            padding: '1rem 1.5rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-light)',
            boxShadow: 'var(--shadow-sm)',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', margin: 0 }}>
                Official Student Progress Report Card
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ready to save as PDF or print. Click the button to launch your device's print dialog.
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handlePrint}
            >
              <Printer size={18} />
              Print / Save as PDF
            </button>
          </div>

          {/* The Report Card Canvas */}
          <div className="report-card-container">
            {/* Center Header */}
            <div className="report-header-banner">
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <img
                  src="/logo.png"
                  alt="Logic Lane Learning Center"
                  style={{ height: '56px', width: 'auto', objectFit: 'contain' }}
                />
                <div>
                  <div className="report-center-title">
                    {center?.name || 'Logic Lane Learning Center'}
                  </div>
                  <div className="report-center-motto">
                    {center?.tagline || 'Excellentia • Valores • Competentia'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginTop: '0.35rem' }}>
                    {center?.address} • {center?.phone} • {center?.email}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span className="report-card-pill">OFFICIAL REPORT</span>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                  {center?.activeTerm || 'Fall Term 2026'}
                </div>
              </div>
            </div>

            {/* Student Meta Details */}
            <table className="student-meta-table">
              <tbody>
                <tr>
                  <td><strong>Student Name:</strong> {student.fullName}</td>
                  <td><strong>Grade Level:</strong> {student.grade}</td>
                </tr>
                <tr>
                  <td><strong>Parent / Guardian:</strong> {student.parentName}</td>
                  <td><strong>Attendance Record:</strong> {latestReport?.attendanceRate || `${attendanceRate}%`}</td>
                </tr>
                <tr>
                  <td><strong>Enrolled Subjects:</strong> {(student.subjects || []).join(', ')}</td>
                  <td><strong>Student PIN:</strong> <span style={{ fontWeight: 800, color: 'var(--primary)', letterSpacing: '0.05em' }}>{displayPin}</span></td>
                </tr>
              </tbody>
            </table>

            {/* Subject Evaluations Table */}
            <h4 style={{ fontSize: '1.1rem', marginBottom: '0.75rem', color: '#0f172a' }}>
              Academic Subject Performance & Mastery
            </h4>
            <table className="grades-table">
              <thead>
                <tr>
                  <th style={{ width: '25%' }}>Subject</th>
                  <th style={{ width: '20%' }}>Grade</th>
                  <th style={{ width: '25%' }}>Mastery Level</th>
                  <th style={{ width: '30%' }}>Teacher Observations</th>
                </tr>
              </thead>
              <tbody>
                {latestReport?.subjectEvaluations && latestReport.subjectEvaluations.length > 0 ? (
                  latestReport.subjectEvaluations.map((evalItem, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 700 }}>{evalItem.subject}</td>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{evalItem.grade}</td>
                      <td>{evalItem.mastery}</td>
                      <td style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{evalItem.comment}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                      No evaluation entries recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Strengths & Growth Matrix */}
            <div className="report-evaluation-section">
              <div className="eval-box">
                <h4>
                  <CheckCircle2 size={16} color="#059669" />
                  Key Strengths & Competencies
                </h4>
                <ul className="eval-list">
                  {latestReport?.strengths && latestReport.strengths.length > 0 ? (
                    latestReport.strengths.map((str, i) => (
                      <li key={i}>✓ {str}</li>
                    ))
                  ) : (
                    <li>Consistently displays attentive listening and eager participation.</li>
                  )}
                </ul>
              </div>

              <div className="eval-box">
                <h4>
                  <Sparkles size={16} color="#f59e0b" />
                  Areas for Ongoing Growth
                </h4>
                <ul className="eval-list">
                  {latestReport?.areasForGrowth && latestReport.areasForGrowth.length > 0 ? (
                    latestReport.areasForGrowth.map((gro, i) => (
                      <li key={i}>• {gro}</li>
                    ))
                  ) : (
                    <li>Continue expanding independent homework completion routine.</li>
                  )}
                </ul>
              </div>
            </div>

            {/* Comprehensive Tutor Summary */}
            <div className="report-summary-box">
              <strong style={{ display: 'block', fontSize: '0.9rem', color: '#1e3a8a', marginBottom: '0.4rem' }}>
                Lead Tutor's Comprehensive Summary:
              </strong>
              <p style={{ fontSize: '0.925rem', color: '#1e293b', lineHeight: 1.6 }}>
                {latestReport?.tutorSummary ||
                  `${student.fullName} has demonstrated great enthusiasm and growth during this period. We look forward to continuing this positive academic trajectory in upcoming sessions.`}
              </p>
            </div>

            {/* Signatures */}
            <div className="report-signature-block">
              <div>
                <div className="sig-line">
                  {student?.teacher?.name || center?.tutorName || 'Teacher'}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Instructor Signature & Date: {latestReport?.issueDate || new Date().toISOString().split('T')[0]}
                </div>
              </div>

              <div>
                <div className="sig-line" style={{ borderStyle: 'dashed' }}></div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Parent / Guardian Acknowledgment
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
