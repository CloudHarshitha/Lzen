import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';

export const Courses: React.FC = () => {
  const { courses, addCourse, deleteCourse, loading, error } = useCourses();
  const navigate = useNavigate();

  const [isAdding, setIsAdding] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    courseType: 'theory_joint' as 'theory_joint' | 'lab_project',
    syllabus: '',
    totalUnits: '5',
    rawExamMax: '75'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const internals = formData.courseType === 'lab_project' ? 100 : 60;
      const externals = formData.courseType === 'lab_project' ? 0 : 40;
      
      await addCourse({
        name: formData.name,
        code: formData.code,
        courseType: formData.courseType,
        internals,
        externals,
        rawExamMax: formData.courseType === 'theory_joint' ? Number(formData.rawExamMax) : undefined,
        syllabus: formData.syllabus,
        totalUnits: Number(formData.totalUnits) || 1
      });
      setIsAdding(false);
      setFormData({ name: '', code: '', courseType: 'theory_joint', syllabus: '', totalUnits: '5', rawExamMax: '75' });
    } catch (err: any) {
      setFormError(err.message || 'Failed to save course');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCourse(id);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Manage Courses</h2>
        {!isAdding && (
          <button className="btn btn-primary hover-lift" onClick={() => setIsAdding(true)}>
            + Add New Course
          </button>
        )}
      </div>

      {/* Global error from CourseContext */}
      {error && (
        <div style={{ color: 'var(--color-error)', padding: 'var(--space-3) var(--space-4)', background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', fontSize: 'var(--font-size-sm)' }}>
          {error}
        </div>
      )}

      {isAdding && (
        <div className="glass-panel" style={{ padding: 'var(--space-6)', background: 'var(--bg-surface-elevated)' }}>
          <h3 style={{ marginBottom: 'var(--space-4)' }}>Add a New Course</h3>
          
          {formError && (
            <div style={{ color: 'var(--color-error)', marginBottom: 'var(--space-4)', fontSize: 'var(--font-size-sm)' }}>
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="input-label">Course Name</label>
                <input required name="name" value={formData.name} onChange={handleChange} className="input-field" placeholder="e.g. Data Structures & Algorithms" />
              </div>
              <div>
                <label className="input-label">Course Code</label>
                <input required name="code" value={formData.code} onChange={handleChange} className="input-field" placeholder="e.g. CS201" />
              </div>
              <div>
                <label className="input-label">Course Type</label>
                <select 
                  name="courseType" 
                  value={formData.courseType} 
                  onChange={handleChange} 
                  className="input-field"
                  style={{ background: 'var(--bg-surface)' }}
                >
                  <option value="theory_joint">Theory / Joint</option>
                  <option value="lab_project">Lab / Project</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="input-label">Max Internal Marks</label>
                <input required type="number" name="internals" value={formData.courseType === 'lab_project' ? 100 : 60} disabled className="input-field" style={{ opacity: 0.7 }} />
              </div>
              <div>
                <label className="input-label">Max External Marks</label>
                <input required type="number" name="externals" value={formData.courseType === 'lab_project' ? 0 : 40} disabled className="input-field" style={{ opacity: 0.7 }} />
              </div>
              {formData.courseType === 'theory_joint' && (
                <div>
                  <label className="input-label">Raw End-Sem Marks</label>
                  <input required type="number" name="rawExamMax" value={formData.rawExamMax} onChange={handleChange} className="input-field" placeholder="e.g. 75" />
                </div>
              )}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-4)' }}>
              <div>
                <label className="input-label">Number of Units</label>
                <input required type="number" name="totalUnits" min="1" max="10" value={formData.totalUnits} onChange={handleChange} className="input-field" placeholder="e.g. 5" />
              </div>
            </div>

            <div>
              <label className="input-label">Syllabus / Description</label>
              <textarea name="syllabus" value={formData.syllabus} onChange={handleChange} className="input-field" style={{ minHeight: '100px', resize: 'vertical' }} placeholder="Paste syllabus details here..." />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
              <button type="button" className="btn" style={{ background: 'transparent', border: '1px solid var(--border-strong)', color: 'var(--text-primary)' }} onClick={() => setIsAdding(false)} disabled={submitting}>Cancel</button>
              <button type="submit" className="btn btn-primary hover-lift" disabled={submitting}>
                {submitting ? 'Saving...' : 'Save Course'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div style={{ textAlign: 'center', padding: 'var(--space-8)', color: 'var(--text-muted)' }}>
          Loading courses...
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 'var(--space-4)' }}>
        {!loading && courses.length === 0 && !isAdding && (
          <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
            <p style={{ color: 'var(--text-muted)' }}>You haven't added any courses yet.</p>
          </div>
        )}
        
        {courses.map(course => (
          <div key={course.id} className="course-card hover-lift" style={{ backgroundColor: 'var(--bg-surface-elevated)', borderLeft: '4px solid var(--color-accent)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <div style={{ fontSize: 'var(--font-size-xs)', opacity: 0.8, textTransform: 'uppercase', marginBottom: 'var(--space-1)', color: 'var(--color-accent)' }}>{course.code}</div>
                <h4 style={{ marginBottom: 'var(--space-2)' }}>{course.name}</h4>
              </div>
              <button className="icon-btn" onClick={() => handleDelete(course.id)} title="Delete Course">🗑️</button>
            </div>
            
            <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', marginBottom: 'var(--space-4)' }}>
              {course.totalUnits} Units | Internals: {course.internals} | Externals: {course.externals}
            </div>
            
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate(`/course/${course.id}`)}>Open Course</button>
          </div>
        ))}
      </div>

    </div>
  );
};
