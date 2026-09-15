import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourses } from '../context/CourseContext';
import type { CourseResource, SyllabusTopic } from '../context/CourseContext';

export const CourseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { courses, updateCourse } = useCourses();
  
  const course = courses.find(c => c.id === id);
  
  const [activeTab, setActiveTab] = useState<'syllabus' | 'resources' | 'notes' | 'pyq'>('syllabus');
  const [calcInternals, setCalcInternals] = useState<string>('');

  // Filters
  const [resourceUnitFilter, setResourceUnitFilter] = useState<number | 'All'>('All');
  const [noteUnitFilter, setNoteUnitFilter] = useState<number | 'All'>('All');
  const [pyqUnitFilter, setPyqUnitFilter] = useState<number | 'All'>('All');
  const [pyqDifficultyFilter, setPyqDifficultyFilter] = useState<'All' | 'Easy' | 'Medium' | 'Hard'>('All');
  
  // New PYQ Redesign State
  const [pyqYearFilter, setPyqYearFilter] = useState<number | 'All'>('All');
  const [pyqSearchQuery, setPyqSearchQuery] = useState('');
  
  const [showPyqModal, setShowPyqModal] = useState(false);
  const [newPyqData, setNewPyqData] = useState({
    name: '',
    year: new Date().getFullYear(),
    unitNum: 1,
    difficulty: 'Medium' as 'Easy' | 'Medium' | 'Hard',
    questionType: 'MCQ' as 'MCQ' | 'Numerical' | 'Subjective',
    fileUrl: ''
  });
  
  const [viewingFileUrl, setViewingFileUrl] = useState<string | null>(null);
  
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

  const STUDY_NOTES_TEMPLATE = `# 📚 Study Notes Template

---

## 🗓️ Class Info
- **Course:** 
- **Date:** 
- **Topic / Lecture #:** 
- **Professor:** 

---

## 🎯 Today's Learning Objectives
- [ ] 
- [ ] 
- [ ] 

---

## 📝 Main Notes
*(Write your notes here as you listen/read. Keep it in your own words where possible — it helps retention.)*

- 
- 
- 

### 🔑 Key Terms & Definitions

| Term | Definition |
|---|---|
| | |
| | |
| | |

---

## ❓ Questions & Confusions
*(Anything you didn't fully follow — flag it here to ask the professor, a classmate, or look up later.)*

- [ ] 
- [ ] 

---

## 💡 Summary — In My Own Words
*(3–5 sentences, written after class, no peeking at your notes. This is the single most useful section for actually remembering the material.)*

1. 
2. 
3. 

---

## 🔗 Related Notes
*(Link to previous lectures, textbook chapters, or related topics — use \`@\` or \`[[ ]]\` in Notion to link pages.)*

- 

---

## ✅ Review Checklist
- [ ] Reviewed within 24 hours
- [ ] Reviewed within 1 week
- [ ] Made flashcards / practice problems
- [ ] Could explain this topic to someone else without notes
`;

  if (!course) {
    return (
      <div style={{ textAlign: 'center', marginTop: 'var(--space-8)' }}>
        <h3>Course not found</h3>
        <button className="btn btn-primary" onClick={() => navigate('/courses')} style={{ marginTop: 'var(--space-4)' }}>Go back to Courses</button>
      </div>
    );
  }

  const handleCreateNote = () => {
    const newResource: CourseResource = {
      id: Date.now().toString(),
      name: `Lecture Notes - ${new Date().toLocaleDateString()}`,
      type: 'note',
      unitNum: noteUnitFilter !== 'All' ? noteUnitFilter : undefined,
      dateAdded: new Date().toLocaleDateString(),
      isPinned: false,
      content: STUDY_NOTES_TEMPLATE
    };
    updateCourse(course.id, { resources: [...(course.resources || []), newResource] });
    setEditingNoteId(newResource.id);
  };

  const handleOpenNote = (id: string) => {
    setEditingNoteId(id);
    setLastOpened(id);
  };
  
  const handleAddPyq = () => {
    if (!newPyqData.name.trim()) return;
    const newResource: CourseResource = {
      id: Date.now().toString(),
      name: newPyqData.name,
      type: 'pyq',
      unitNum: newPyqData.unitNum,
      year: newPyqData.year,
      difficulty: newPyqData.difficulty,
      questionType: newPyqData.questionType,
      fileUrl: newPyqData.fileUrl,
      dateAdded: new Date().toLocaleDateString(),
      isPinned: false
    };
    updateCourse(course.id, { resources: [...(course.resources || []), newResource] });
    setShowPyqModal(false);
    setNewPyqData({ ...newPyqData, name: '', fileUrl: '' });
  };
  
  const handleJumpToPyq = (unitNum: number) => {
    setPyqUnitFilter(unitNum);
    setActiveTab('pyq');
  };

  // Auto-generate some syllabus topics if empty (for template demo purposes)
  const handleGenerateSyllabus = () => {
    const generated: SyllabusTopic[] = [];
    for (let i = 1; i <= course.totalUnits; i++) {
      generated.push({ id: `t${i}-1`, unitNum: i, title: `Introduction to Unit ${i} Concepts`, status: 'Not started' });
      generated.push({ id: `t${i}-2`, unitNum: i, title: `Advanced Topics in Unit ${i}`, status: 'Not started' });
      generated.push({ id: `t${i}-3`, unitNum: i, title: `Practical Applications and Case Studies`, status: 'Not started' });
    }
    updateCourse(course.id, { topics: generated });
  };

  const topics = course.topics || [];
  const resources = course.resources || [];
  const unitsArray = Array.from({ length: course.totalUnits }, (_, i) => i + 1);

  // Derived state: Course Completion %
  const totalTopics = topics.length;
  const completedTopics = topics.filter(t => t.status === 'Done').length;
  const completionPercentage = totalTopics === 0 ? 0 : Math.round((completedTopics / totalTopics) * 100);

  // Last opened resource
  const lastOpened = resources.find(r => r.id === course.lastOpenedResourceId);

  const toggleTopicStatus = (topicId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Not started' ? 'Revising' : currentStatus === 'Revising' ? 'Done' : 'Not started';
    const newTopics = topics.map(t => t.id === topicId ? { ...t, status: nextStatus as any } : t);
    updateCourse(course.id, { topics: newTopics });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'unit' | 'note' | 'pyq', unitNum?: number, difficulty?: 'Easy'|'Medium'|'Hard') => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newResource: CourseResource = {
        id: Date.now().toString(),
        name: file.name,
        type,
        unitNum: unitNum || (type !== 'unit' ? (type === 'note' && noteUnitFilter !== 'All' ? noteUnitFilter : pyqUnitFilter !== 'All' ? pyqUnitFilter : undefined) : undefined),
        difficulty,
        dateAdded: new Date().toLocaleDateString(),
        isPinned: false
      };
      
      updateCourse(course.id, {
        resources: [...resources, newResource]
      });
      e.target.value = '';
    }
  };

  const togglePin = (resourceId: string) => {
    const newRes = resources.map(r => r.id === resourceId ? { ...r, isPinned: !r.isPinned } : r);
    updateCourse(course.id, { resources: newRes });
  };

  const setLastOpened = (resourceId: string) => {
    updateCourse(course.id, { lastOpenedResourceId: resourceId });
  };

  // SRM Marks Calculator Logic
  // Target total out of 100: O 91-100 (10pts), A+ 81-90 (9pts), A 71-80 (8pts),
  // B+ 61-70 (7pts), B 56-60 (6pts), C 50-55 (5pts), F <50 (0pts)
  
  const currentInt = Math.min(course.internals, Math.max(0, Number(calcInternals) || 0));

  const gradeBands = [
    { label: 'O', L: 91, pts: 10 },
    { label: 'A+', L: 81, pts: 9 },
    { label: 'A', L: 71, pts: 8 },
    { label: 'B+', L: 61, pts: 7 },
    { label: 'B', L: 56, pts: 6 },
    { label: 'C', L: 50, pts: 5 }
  ];

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 'var(--space-6)', paddingBottom: 'var(--space-12)' }}>
      
      {/* Top Section: Header & Calculator Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 'var(--space-6)' }}>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
          <div style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '1px' }}>{course.code}</div>
          <h2 style={{ fontSize: 'var(--font-size-3xl)', margin: 0, fontWeight: 700, color: 'var(--text-primary)' }}>{course.name}</h2>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)' }}>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              {course.totalUnits} Units
            </div>
            <div style={{ background: 'var(--bg-surface-elevated)', padding: '4px 12px', borderRadius: 'var(--radius-full)', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              Int: {course.internals} {course.courseType === 'theory_joint' && `| Ext: ${course.externals}`}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', background: 'rgba(143, 163, 173, 0.1)', border: '1px solid var(--color-accent)', padding: '4px 12px', borderRadius: 'var(--radius-full)' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: completionPercentage === 100 ? 'var(--color-success)' : 'var(--color-accent)', boxShadow: `0 0 6px ${completionPercentage === 100 ? 'var(--color-success)' : 'var(--color-accent)'}` }} />
              <span style={{ fontSize: 'var(--font-size-sm)', fontWeight: 600, color: completionPercentage === 100 ? 'var(--color-success)' : 'var(--color-accent)' }}>
                {completionPercentage}% Syllabus Complete
              </span>
            </div>
          </div>
        </div>

        {/* Marks Calculator */}
        <div className="glass-panel" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-2)' }}>
            <h4 style={{ margin: 0, fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>Marks Calculator</h4>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', border: '1px solid var(--border-strong)', padding: '2px 6px', borderRadius: '4px' }}>
              {course.courseType === 'lab_project' ? 'Lab/Project' : 'Theory/Joint'}
            </span>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', marginBottom: 'var(--space-3)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>My Internals:</span>
            <input 
              type="number" 
              className="input-field" 
              style={{ padding: '4px 8px', width: '80px', fontSize: 'var(--font-size-sm)' }} 
              placeholder={`/${course.internals}`} 
              value={calcInternals}
              onChange={e => {
                const val = Number(e.target.value);
                if (val <= course.internals) setCalcInternals(e.target.value);
                else setCalcInternals(course.internals.toString());
              }}
              max={course.internals}
              min="0"
            />
          </div>
          
          {course.courseType === 'lab_project' ? (
            (() => {
              const getGrade = (score: number) => {
                for (let b of gradeBands) if (score >= b.L) return b;
                return { label: 'F', pts: 0 };
              };
              const grade = getGrade(currentInt);
              return (
                <div style={{ textAlign: 'center', marginTop: 'var(--space-4)', padding: 'var(--space-2)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 'var(--font-size-2xl)', fontWeight: 700, color: grade.label === 'F' ? 'var(--color-error)' : 'var(--color-success)' }}>
                    Grade: {grade.label}
                  </div>
                  <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
                    {grade.pts} Points Secured
                  </div>
                </div>
              );
            })()
          ) : (
            (() => {
              const maxPossibleTotal = currentInt + course.externals;
              const passRisk = maxPossibleTotal < 50;
              const rawMax = course.rawExamMax || 75;
              const extMax = course.externals;

              return (
                <>
                  {passRisk && (
                    <div style={{ color: 'var(--color-error)', fontSize: '0.7rem', marginBottom: 'var(--space-3)', textAlign: 'center', background: 'rgba(239,68,68,0.1)', padding: '6px', borderRadius: '4px' }}>
                      ⚠️ Pass risk: Even with full external marks, you cannot reach 50% total.
                    </div>
                  )}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px', fontSize: 'var(--font-size-xs)' }}>
                    {gradeBands.map(band => {
                      const neededScaled = band.L - currentInt;
                      let content;
                      let color = 'var(--text-primary)';
                      if (neededScaled <= 0) {
                        content = "Secured";
                        color = 'var(--color-success)';
                      } else if (neededScaled > extMax) {
                        content = "N/A";
                        color = 'var(--color-error)';
                      } else {
                        const scaled = Math.ceil(neededScaled);
                        if (rawMax !== extMax && extMax > 0) {
                          const rawNeeded = ((scaled / extMax) * rawMax).toFixed(1);
                          content = (
                            <>
                              <div style={{ fontSize: '1.1em' }}>{scaled} / {extMax}</div>
                              <div style={{ fontSize: '0.85em', opacity: 0.7, marginTop: '2px' }}>~{rawNeeded}/{rawMax} raw</div>
                            </>
                          );
                        } else {
                          content = `${scaled} / ${extMax}`;
                        }
                      }

                      return (
                        <div key={band.label} style={{ textAlign: 'center', background: 'var(--bg-surface-elevated)', padding: '6px 2px', borderRadius: '4px' }}>
                          <div style={{ color: 'var(--text-muted)' }}>{band.label} <span style={{opacity: 0.5}}>({band.pts}p)</span></div>
                          <div style={{ fontWeight: 600, color, marginTop: '4px', fontSize: '0.8rem' }}>{content}</div>
                        </div>
                      );
                    })}
                  </div>
                  {rawMax !== extMax && (
                    <div style={{ marginTop: 'var(--space-3)', fontSize: '0.65rem', color: 'var(--text-muted)', textAlign: 'center', opacity: 0.7, lineHeight: 1.2 }}>
                      * SRM doesn't publish its exact {rawMax}→{extMax} rounding rule — this assumes a straight linear scale and rounds up, so treat the raw-mark target as a close estimate, not a guarantee.
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>

      {/* Last Opened Strip */}
      {lastOpened && (
        <div className="hover-lift" style={{ background: 'var(--bg-surface-elevated)', borderLeft: '3px solid var(--color-accent)', padding: 'var(--space-2) var(--space-4)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>Resume</span>
            <span style={{ fontSize: 'var(--font-size-sm)' }}>{lastOpened.name}</span>
          </div>
          <span style={{ fontSize: '1rem' }}>→</span>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-4)' }}>
        {(['syllabus', 'resources', 'notes', 'pyq'] as const).map(tab => (
          <button 
            key={tab}
            className={`pill-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'pyq' ? 'Previous Year Questions' : tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Derived Data for PYQ Tab */}
      {(() => {
        const allPyqs = resources.filter(r => r.type === 'pyq');
        const preDiffFiltered = allPyqs.filter(r => 
          (pyqYearFilter === 'All' || r.year === pyqYearFilter) &&
          (pyqUnitFilter === 'All' || r.unitNum === pyqUnitFilter) &&
          (r.name.toLowerCase().includes(pyqSearchQuery.toLowerCase()))
        );
        
        const countAll = preDiffFiltered.length;
        const countEasy = preDiffFiltered.filter(r => r.difficulty === 'Easy').length;
        const countMedium = preDiffFiltered.filter(r => r.difficulty === 'Medium').length;
        const countHard = preDiffFiltered.filter(r => r.difficulty === 'Hard').length;
        
        const finalPyqs = preDiffFiltered.filter(r => 
          pyqDifficultyFilter === 'All' || r.difficulty === pyqDifficultyFilter
        );
        
        // Collect unique years for dropdown
        const availableYears = Array.from(new Set(allPyqs.map(r => r.year).filter(Boolean))) as number[];
        availableYears.sort((a, b) => b - a);

        return (
          <div style={{ marginTop: 'var(--space-2)' }}>
        
        {/* SYLLABUS TAB */}
        {activeTab === 'syllabus' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            {topics.length === 0 ? (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-lg)' }}>
                <p>No syllabus topics defined.</p>
                <button className="btn btn-primary" onClick={handleGenerateSyllabus}>Auto-generate sample topics</button>
              </div>
            ) : (
              unitsArray.map(unitNum => {
                const unitTopics = topics.filter(t => t.unitNum === unitNum);
                const uDone = unitTopics.filter(t => t.status === 'Done').length;
                const uPerc = unitTopics.length === 0 ? 0 : Math.round((uDone / unitTopics.length) * 100);

                const unitPyqsCount = resources.filter(r => r.type === 'pyq' && r.unitNum === unitNum).length;

                return (
                  <div key={unitNum} className="glass-panel" style={{ padding: 'var(--space-6)', background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-4)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)' }}>
                        <h3 style={{ margin: 0 }}>Unit {unitNum}</h3>
                        {unitPyqsCount > 0 && (
                          <span onClick={() => handleJumpToPyq(unitNum)} className="hover-lift" style={{ cursor: 'pointer', background: 'var(--bg-surface-elevated)', border: '1px solid var(--border-color)', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px' }}>
                            PYQs ({unitPyqsCount})
                          </span>
                        )}
                      </div>
                      <div style={{ width: '150px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.65rem', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase' }}>
                          <span>Completion</span>
                          <span>{uPerc}%</span>
                        </div>
                        <div className="progress-bar-bg">
                          <div className="progress-bar-fill" style={{ width: `${uPerc}%`, background: uPerc === 100 ? 'var(--color-success)' : 'var(--color-accent)' }} />
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {unitTopics.map(t => (
                        <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--space-2) var(--space-4)', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-sm)' }}>
                          <span style={{ fontSize: 'var(--font-size-sm)', color: t.status === 'Done' ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: t.status === 'Done' ? 'line-through' : 'none' }}>
                            {t.title}
                          </span>
                          <button 
                            className={`topic-toggle ${t.status.replace(' ', '-')}`}
                            onClick={() => toggleTopicStatus(t.id, t.status)}
                          >
                            {t.status === 'Not started' && '⚪ Not Started'}
                            {t.status === 'Revising' && '🔄 Revising'}
                            {t.status === 'Done' && '✅ Done'}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* RESOURCES TAB */}
        {activeTab === 'resources' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className={`filter-chip ${resourceUnitFilter === 'All' ? 'active' : ''}`} onClick={() => setResourceUnitFilter('All')}>All Units</span>
                {unitsArray.map(u => (
                  <span key={u} className={`filter-chip ${resourceUnitFilter === u ? 'active' : ''}`} onClick={() => setResourceUnitFilter(u)}>Unit {u}</span>
                ))}
              </div>
            </div>

            {unitsArray.filter(u => resourceUnitFilter === 'All' || resourceUnitFilter === u).map(unitNum => {
              const unitRes = resources.filter(r => r.type === 'unit' && r.unitNum === unitNum);
              return (
                <div key={unitNum} className="glass-panel" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface-elevated)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: unitRes.length > 0 ? 'var(--space-4)' : 0 }}>
                    <h4 style={{ margin: 0 }}>Unit {unitNum}</h4>
                    <label className="btn btn-primary hover-lift" style={{ padding: '4px 12px', cursor: 'pointer', margin: 0, fontSize: '0.75rem' }}>
                      Upload
                      <input type="file" hidden onChange={(e) => handleFileUpload(e, 'unit', unitNum)} />
                    </label>
                  </div>
                  
                  {unitRes.length === 0 ? (
                    <p style={{ margin: 'var(--space-2) 0 0 0', color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>No resources uploaded.</p>
                  ) : (
                    <ul style={{ listStyleType: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                      {unitRes.map(res => (
                        <li key={res.id} onClick={() => setLastOpened(res.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-2) var(--space-4)', background: 'var(--bg-base)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                          <button className={`pin-btn ${res.isPinned ? 'pinned' : ''}`} onClick={(e) => { e.stopPropagation(); togglePin(res.id); }} title="Pin to board">📌</button>
                          <span style={{ fontSize: 'var(--font-size-sm)' }}>{res.name}</span>
                          <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{res.dateAdded}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* NOTES TAB */}
        {activeTab === 'notes' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <span className={`filter-chip ${noteUnitFilter === 'All' ? 'active' : ''}`} onClick={() => setNoteUnitFilter('All')}>All Units</span>
                {unitsArray.map(u => (
                  <span key={u} className={`filter-chip ${noteUnitFilter === u ? 'active' : ''}`} onClick={() => setNoteUnitFilter(u)}>Unit {u}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button className="btn btn-primary hover-lift" onClick={handleCreateNote}>
                  Create Note
                </button>
              </div>
            </div>
            
            {editingNoteId ? (
              <div className="glass-panel" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)', height: '600px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <input 
                    value={resources.find(r => r.id === editingNoteId)?.name || ''} 
                    onChange={e => {
                      const updated = resources.map(r => r.id === editingNoteId ? {...r, name: e.target.value} : r);
                      updateCourse(course.id, { resources: updated });
                    }} 
                    className="input-field" 
                    style={{ fontSize: '1.2rem', fontWeight: 600, width: '50%' }} 
                  />
                  <button className="btn btn-primary" onClick={() => setEditingNoteId(null)}>Done</button>
                </div>
                <textarea 
                  className="input-field" 
                  style={{ flex: 1, fontFamily: 'monospace', padding: 'var(--space-4)', resize: 'none' }}
                  placeholder="Type here..."
                  value={resources.find(r => r.id === editingNoteId)?.content || ''}
                  onChange={e => {
                      const updated = resources.map(r => r.id === editingNoteId ? {...r, content: e.target.value} : r);
                      updateCourse(course.id, { resources: updated });
                  }}
                />
              </div>
            ) : (
              <div className="glass-panel" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)' }}>
                {resources.filter(r => r.type === 'note' && (noteUnitFilter === 'All' || r.unitNum === noteUnitFilter)).length === 0 ? (
                  <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>No notes uploaded for this filter.</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                    {resources.filter(r => r.type === 'note' && (noteUnitFilter === 'All' || r.unitNum === noteUnitFilter)).map(res => (
                      <div key={res.id} onClick={() => res.content !== undefined ? handleOpenNote(res.id) : setLastOpened(res.id)} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                        <button className={`pin-btn ${res.isPinned ? 'pinned' : ''}`} onClick={(e) => { e.stopPropagation(); togglePin(res.id); }} title="Pin to board">📌</button>
                        <div>
                          <div style={{ fontSize: 'var(--font-size-sm)' }}>{res.name} {res.content !== undefined && '📝'}</div>
                          {res.unitNum && <div style={{ fontSize: '0.65rem', color: 'var(--color-accent)', textTransform: 'uppercase' }}>Unit {res.unitNum}</div>}
                        </div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'auto' }}>{res.dateAdded}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* PYQ TAB */}
        {activeTab === 'pyq' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            
            {/* Top Bar Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
              <div style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'center' }}>
                <input 
                  type="text" 
                  className="input-field" 
                  placeholder="Search questions..." 
                  value={pyqSearchQuery}
                  onChange={e => setPyqSearchQuery(e.target.value)}
                  style={{ width: '200px' }}
                />
                <select className="input-field" value={pyqYearFilter} onChange={e => setPyqYearFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
                  <option value="All">All Years</option>
                  {availableYears.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="input-field" value={pyqUnitFilter} onChange={e => setPyqUnitFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}>
                  <option value="All">All Units</option>
                  {unitsArray.map(u => <option key={u} value={u}>Unit {u}</option>)}
                </select>
              </div>
              <button className="btn btn-primary hover-lift" onClick={() => setShowPyqModal(true)}>
                + Add Question
              </button>
            </div>

            {/* Difficulty Pills */}
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
              <span className={`filter-chip ${pyqDifficultyFilter === 'All' ? 'active' : ''}`} onClick={() => setPyqDifficultyFilter('All')}>All ({countAll})</span>
              <span className={`filter-chip ${pyqDifficultyFilter === 'Easy' ? 'active' : ''}`} onClick={() => setPyqDifficultyFilter('Easy')}>Easy ({countEasy})</span>
              <span className={`filter-chip ${pyqDifficultyFilter === 'Medium' ? 'active' : ''}`} onClick={() => setPyqDifficultyFilter('Medium')}>Medium ({countMedium})</span>
              <span className={`filter-chip ${pyqDifficultyFilter === 'Hard' ? 'active' : ''}`} onClick={() => setPyqDifficultyFilter('Hard')}>Hard ({countHard})</span>
            </div>
            
            {/* Question List */}
            <div className="glass-panel" style={{ padding: 'var(--space-4)', background: 'var(--bg-surface)' }}>
              {finalPyqs.length === 0 ? (
                <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ marginBottom: 'var(--space-3)' }}>No questions found for {pyqDifficultyFilter !== 'All' ? pyqDifficultyFilter : 'these'} filters {pyqYearFilter !== 'All' ? `· ${pyqYearFilter}` : ''}.</div>
                  <button className="btn btn-primary" onClick={() => setShowPyqModal(true)}>Be the first to upload one</button>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
                  {finalPyqs.map(res => {
                    const diffColor = res.difficulty === 'Easy' ? 'var(--color-success)' : res.difficulty === 'Medium' ? 'var(--color-warning)' : 'var(--color-error)';
                    return (
                      <div key={res.id} onClick={() => {
                        setLastOpened(res.id);
                        if (res.fileUrl) setViewingFileUrl(res.fileUrl);
                      }} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-surface-elevated)', borderRadius: 'var(--radius-sm)', cursor: 'pointer', borderLeft: `3px solid ${diffColor}` }}>
                        <button className={`pin-btn ${res.isPinned ? 'pinned' : ''}`} onClick={(e) => { e.stopPropagation(); togglePin(res.id); }} title="Pin to board">📌</button>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 'var(--font-size-sm)' }}>{res.name}</div>
                          <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: '4px' }}>
                            {res.unitNum && <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-base)' }}>Unit {res.unitNum}</span>}
                            {res.year && <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-base)' }}>{res.year}</span>}
                            {res.questionType && <span className="badge" style={{ fontSize: '0.65rem', background: 'var(--bg-base)' }}>{res.questionType}</span>}
                          </div>
                        </div>
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: diffColor }}>{res.difficulty}</div>
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginLeft: 'var(--space-4)' }}>{res.dateAdded}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Add PYQ Modal */}
            {showPyqModal && (
              <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                <div className="glass-panel" style={{ background: 'var(--bg-surface)', padding: 'var(--space-6)', width: '400px', maxWidth: '90%', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
                  <h3>Add Question</h3>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Question Summary / Name</label>
                    <input className="input-field" style={{ width: '100%' }} value={newPyqData.name} onChange={e => setNewPyqData({...newPyqData, name: e.target.value})} placeholder="e.g. 2023 End Sem Q4" />
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Year</label>
                      <input type="number" className="input-field" style={{ width: '100%' }} value={newPyqData.year} onChange={e => setNewPyqData({...newPyqData, year: Number(e.target.value)})} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Unit / Topic</label>
                      <select className="input-field" style={{ width: '100%' }} value={newPyqData.unitNum} onChange={e => setNewPyqData({...newPyqData, unitNum: Number(e.target.value)})}>
                        {unitsArray.map(u => <option key={u} value={u}>Unit {u}</option>)}
                      </select>
                    </div>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-4)' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Difficulty</label>
                      <select className="input-field" style={{ width: '100%' }} value={newPyqData.difficulty} onChange={e => setNewPyqData({...newPyqData, difficulty: e.target.value as any})}>
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                      </select>
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Question Type</label>
                      <select className="input-field" style={{ width: '100%' }} value={newPyqData.questionType} onChange={e => setNewPyqData({...newPyqData, questionType: e.target.value as any})}>
                        <option value="MCQ">MCQ</option>
                        <option value="Numerical">Numerical</option>
                        <option value="Subjective">Subjective</option>
                      </select>
                    </div>
                  </div>
                  
                  <div>
                    <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>Upload Image/PDF</label>
                    <input type="file" className="input-field" style={{ width: '100%' }} onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const url = URL.createObjectURL(file);
                        setNewPyqData({...newPyqData, fileUrl: url});
                      }
                    }} />
                  </div>
                  
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
                    <button className="btn hover-lift" onClick={() => setShowPyqModal(false)}>Cancel</button>
                    <button className="btn btn-primary hover-lift" onClick={handleAddPyq} disabled={!newPyqData.name.trim()}>Save Question</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

          </div>
        );
      })()}
      
      {/* File Viewer Modal */}
      {viewingFileUrl && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ width: '90%', height: '90%', position: 'relative' }}>
            <button 
              style={{ position: 'absolute', top: '-40px', right: 0, background: 'none', border: 'none', color: 'white', fontSize: '24px', cursor: 'pointer' }}
              onClick={() => setViewingFileUrl(null)}
            >
              ✕ Close
            </button>
            <iframe src={viewingFileUrl} style={{ width: '100%', height: '100%', border: 'none', background: 'white', borderRadius: 'var(--radius-lg)' }} />
          </div>
        </div>
      )}
      
    </div>
  );
};
