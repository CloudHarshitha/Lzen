import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { useCourses } from '../context/CourseContext';

export const Dashboard: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const { currentTime, timerRunning, setTimerRunning, timerSeconds, setTimerSeconds } = useAppContext();
  const { courses } = useCourses();
  
  const [loading, setLoading] = useState(true);

  // Note State for Calendar
  const [displayDate, setDisplayDate] = useState(new Date());
  const [selectedDateObj, setSelectedDateObj] = useState<{key: string, label: string} | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/dashboard/summary', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          // const json = await response.json();
        } else {
          console.error('Failed to fetch dashboard data');
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (token) fetchDashboard();
  }, [token]);

  const handleDayClick = (day: number) => {
    const key = `${displayDate.getFullYear()}-${displayDate.getMonth()}-${day}`;
    const label = `${displayDate.toLocaleString('default', { month: 'long' })} ${day}, ${displayDate.getFullYear()}`;
    setSelectedDateObj({ key, label });
    setNoteInput(notes[key] || '');
  };

  const handleSaveNote = () => {
    if (selectedDateObj !== null) {
      setNotes(prev => ({ ...prev, [selectedDateObj.key]: noteInput }));
      setSelectedDateObj(null);
    }
  };

  // Calendar Logic
  const currentYear = displayDate.getFullYear();
  const currentMonth = displayDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();
  const monthName = displayDate.toLocaleString('default', { month: 'long' });

  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = d === currentTime.getDate() && currentMonth === currentTime.getMonth() && currentYear === currentTime.getFullYear();
    const key = `${currentYear}-${currentMonth}-${d}`;
    const dayNote = notes[key];
    calendarDays.push(
      <div key={`day-${d}`} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => handleDayClick(d)}>
        {d}
        {dayNote && <div className="note-indicator">{dayNote}</div>}
      </div>
    );
  }

  const cardColors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6'];

  if (loading) return <div style={{ display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center' }}>Loading...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      {/* QUOTE BANNER */}
      <section className="stagger-1 hover-lift">
        <div className="glass-panel" style={{ padding: 'var(--space-6)', textAlign: 'center', borderLeft: '4px solid var(--color-accent)' }}>
          <h3 style={{ fontSize: 'var(--font-size-2xl)', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: 'var(--space-2)' }}>
            "The beautiful thing about learning is that no one can take it away from you."
          </h3>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>- B.B. King</p>
        </div>
      </section>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 'var(--space-6)' }}>
        
        {/* LEFT COLUMN: CALENDAR */}
        <section className="stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: 'var(--font-size-xl)', margin: 0 }}>{monthName} {currentYear}</h3>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <button className="icon-btn" onClick={() => setDisplayDate(new Date(currentYear, currentMonth - 1, 1))}>&lt;</button>
              <button className="icon-btn" onClick={() => setDisplayDate(new Date(currentYear, currentMonth + 1, 1))}>&gt;</button>
            </div>
          </div>
          <div className="calendar-grid">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="calendar-header-day">{day}</div>
            ))}
            {calendarDays}
          </div>
        </section>

        {/* RIGHT COLUMN: PERF & COURSES */}
        <section className="stagger-3" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
          
          {/* LARGE FOCUS TIMER */}
          <div style={{ background: '#2B1E38', borderRadius: 'var(--radius-xl)', padding: 'var(--space-8)', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: 'var(--shadow-md)' }}>
            <h4 style={{ color: 'var(--text-primary)', opacity: 0.9, fontSize: 'var(--font-size-sm)', marginBottom: 'var(--space-6)', fontWeight: 600 }}>Focus Timer</h4>
            
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', gap: 'var(--space-4)', marginBottom: 'var(--space-8)' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '4rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{Math.floor(timerSeconds / 3600).toString().padStart(2, '0')}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: '#A39AA8', marginTop: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Hours</span>
              </div>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#fff', lineHeight: 1, position: 'relative', top: '-4px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '4rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{Math.floor((timerSeconds % 3600) / 60).toString().padStart(2, '0')}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: '#A39AA8', marginTop: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Minutes</span>
              </div>
              <span style={{ fontSize: '3.5rem', fontWeight: 700, color: '#fff', lineHeight: 1, position: 'relative', top: '-4px' }}>:</span>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span style={{ fontSize: '4rem', fontWeight: 700, color: '#fff', lineHeight: 1 }}>{(timerSeconds % 60).toString().padStart(2, '0')}</span>
                <span style={{ fontSize: 'var(--font-size-xs)', color: '#A39AA8', marginTop: 'var(--space-2)', textTransform: 'uppercase', letterSpacing: '1px' }}>Seconds</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 'var(--space-4)' }}>
              {!timerRunning ? (
                <button className="btn hover-lift" style={{ background: '#DF6DC4', color: '#fff', border: 'none', padding: 'var(--space-3) var(--space-8)', borderRadius: 'var(--radius-full)', fontWeight: 600, minWidth: '120px' }} onClick={() => setTimerRunning(true)}>Start</button>
              ) : (
                <button className="btn hover-lift" style={{ background: '#DF6DC4', color: '#fff', border: 'none', padding: 'var(--space-3) var(--space-8)', borderRadius: 'var(--radius-full)', fontWeight: 600, minWidth: '120px' }} onClick={() => setTimerRunning(false)}>Pause</button>
              )}
              <button className="btn hover-lift" style={{ background: '#4A3B57', color: '#fff', border: 'none', padding: 'var(--space-3) var(--space-8)', borderRadius: 'var(--radius-full)', fontWeight: 600, minWidth: '120px' }} onClick={() => { setTimerRunning(false); setTimerSeconds(0); }}>Reset</button>
            </div>
          </div>

          {/* COURSES (From Context) */}
          <div>
            <h3 style={{ fontSize: 'var(--font-size-xl)', marginBottom: 'var(--space-4)' }}>Your Courses</h3>
            <div style={{ display: 'flex', gap: 'var(--space-4)', flexWrap: 'wrap' }}>
              {courses.length > 0 ? (
                courses.slice(0, 3).map((s, idx) => (
                  <div key={s.id} className="course-card hover-lift" style={{ backgroundColor: cardColors[idx % cardColors.length], flex: '1 1 calc(33.333% - var(--space-4))', minWidth: '140px' }}>
                    <div>
                      <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, textTransform: 'uppercase', marginBottom: 'var(--space-1)' }}>Course {idx + 1}</div>
                      <h4>{s.name}</h4>
                    </div>
                    <button className="btn" style={{ backgroundColor: 'rgba(0,0,0,0.2)', color: '#fff', width: '100%', marginTop: 'var(--space-4)' }} onClick={() => navigate(`/course/${s.id}`)}>Continue</button>
                  </div>
                ))
              ) : (
                <div className="course-card" style={{ backgroundColor: 'var(--bg-surface-elevated)', flex: 1 }}>
                  <p style={{ margin: 0, color: 'var(--text-muted)' }}>No courses allocated yet.</p>
                </div>
              )}
            </div>
          </div>

        </section>
      </div>

      {selectedDateObj !== null && (
        <div className="modal-overlay" onClick={() => setSelectedDateObj(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h3 style={{ marginBottom: 'var(--space-4)' }}>Note for {selectedDateObj.label}</h3>
            <textarea 
              className="input-field" 
              style={{ minHeight: '100px', marginBottom: 'var(--space-4)', resize: 'vertical' }}
              placeholder="Write your note or reminder here..."
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              autoFocus
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)' }}>
              <button className="btn" style={{ border: '1px solid var(--border-strong)', color: 'var(--text-primary)', background: 'transparent' }} onClick={() => setSelectedDateObj(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSaveNote}>Save Note</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
