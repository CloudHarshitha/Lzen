import React, { useState } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAppContext } from '../context/AppContext';
import { useCourses } from '../context/CourseContext';

export const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTime, timerRunning, setTimerRunning, timerSeconds, setTimerSeconds } = useAppContext();
  const { courses } = useCourses();
  
  const [coursesExpanded, setCoursesExpanded] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const formatTimer = (totalSeconds: number) => {
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = totalSeconds % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-grid-check" style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Left Sidebar */}
      <aside style={{ width: '250px', borderRight: '1px solid var(--border-subtle)', background: 'var(--bg-surface-glass)', backdropFilter: 'blur(12px)', padding: 'var(--space-6)', display: 'flex', flexDirection: 'column', gap: 'var(--space-8)' }}>
        <h2><span className="gradient-text">Lzen</span> Workspace</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <a href="#" className={`sidebar-link ${location.pathname === '/dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}>Dashboard</a>
          
          <div>
            <div 
              className={`sidebar-link ${location.pathname.startsWith('/course') ? 'active' : ''}`} 
              onClick={(e) => { e.preventDefault(); navigate('/courses'); setCoursesExpanded(!coursesExpanded); }}
              style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}
            >
              Courses
              <span style={{ fontSize: '0.8rem' }}>{coursesExpanded ? '▼' : '▶'}</span>
            </div>
            
            {coursesExpanded && (
              <div style={{ paddingLeft: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-1)', marginTop: 'var(--space-2)' }}>
                {courses.length === 0 ? (
                  <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)' }}>No courses added</span>
                ) : (
                  courses.map(course => (
                    <a 
                      key={course.id}
                      href="#" 
                      className={`sidebar-link ${location.pathname === `/course/${course.id}` ? 'active' : ''}`} 
                      style={{ padding: 'var(--space-2) var(--space-3)', fontSize: 'var(--font-size-sm)' }}
                      onClick={(e) => { e.preventDefault(); navigate(`/course/${course.id}`); }}
                    >
                      {course.name}
                    </a>
                  ))
                )}
              </div>
            )}
          </div>
          
          <a href="#" className="sidebar-link">Marks tracker</a>
          <a href="#" className="sidebar-link">Share box</a>
          <a href="#" className="sidebar-link">Course uploaded resources</a>
          <a href="#" className="sidebar-link">pinboard</a>
        </nav>
        <div style={{ marginTop: 'auto' }}>
          <button className="btn btn-primary hover-lift" style={{ width: '100%' }} onClick={handleLogout}>Logout</button>
        </div>
      </aside>
      
      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        
        {/* Top Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-4) var(--space-8)', borderBottom: '1px solid var(--border-subtle)', background: 'rgba(26, 26, 29, 0.8)', backdropFilter: 'blur(8px)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', borderRadius: 'var(--radius-md)', overflow: 'hidden', border: '1px solid var(--border-subtle)', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 'var(--space-2) var(--space-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', borderRight: '1px solid var(--border-subtle)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1, color: 'var(--text-primary)' }}>{currentTime.getDate()}</span>
                <span style={{ fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '1px', color: 'var(--text-muted)', marginTop: '2px' }}>{currentTime.toLocaleString('default', { month: 'short' })}</span>
              </div>
              <div style={{ background: 'transparent', padding: 'var(--space-2) var(--space-4)', display: 'flex', alignItems: 'baseline', gap: 'var(--space-1)' }}>
                <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[0]}
                </span>
                <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: 500 }}>
                  {currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).split(' ')[1].toLowerCase()}
                </span>
              </div>
            </div>

            {(timerRunning || timerSeconds > 0) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', background: 'linear-gradient(145deg, rgba(223, 109, 196, 0.15), rgba(74, 59, 87, 0.3))', padding: 'var(--space-1) var(--space-4)', borderRadius: 'var(--radius-full)', border: '1px solid rgba(223, 109, 196, 0.3)', boxShadow: '0 0 10px rgba(223, 109, 196, 0.1)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: timerRunning ? '#10b981' : '#f59e0b', boxShadow: `0 0 8px ${timerRunning ? '#10b981' : '#f59e0b'}` }}></div>
                  <span style={{ fontFamily: 'monospace', fontSize: 'var(--font-size-md)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '1px', minWidth: '65px', textAlign: 'center' }}>
                    {formatTimer(timerSeconds)}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-1)', borderLeft: '1px solid rgba(255,255,255,0.1)', paddingLeft: 'var(--space-3)' }}>
                  {!timerRunning ? (
                    <button style={{ background: 'transparent', border: 'none', color: '#DF6DC4', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} onClick={() => setTimerRunning(true)} title="Resume">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                    </button>
                  ) : (
                    <button style={{ background: 'transparent', border: 'none', color: '#DF6DC4', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }} onClick={() => setTimerRunning(false)} title="Pause">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                    </button>
                  )}
                  <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }} onClick={() => { setTimerRunning(false); setTimerSeconds(0); }} title="End Timer" onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h12v12H6z"/></svg>
                  </button>
                </div>
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
            <button className="icon-btn" title="Settings">⚙️</button>
            <div className="avatar" title={user?.name}>{user?.name?.charAt(0).toUpperCase() || 'U'}</div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main style={{ padding: 'var(--space-8)', flex: 1, overflowY: 'auto' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};
