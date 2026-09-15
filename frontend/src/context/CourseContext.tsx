import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from './AuthContext';

// ---------- Types for sub-entities (kept in React state only for now) ----------
export interface CourseResource {
  id: string;
  name: string;
  type: 'unit' | 'note' | 'pyq';
  unitNum?: number;
  dateAdded: string;
  isPinned?: boolean;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  content?: string; // For rich text / markdown notes
  year?: number;
  questionType?: 'MCQ' | 'Numerical' | 'Subjective';
}

export interface SyllabusTopic {
  id: string;
  unitNum: number;
  title: string;
  status: 'Not started' | 'Revising' | 'Done';
}

// ---------- Course type ----------
export interface Course {
  id: string;          // DB id (number), stored as string for frontend compatibility
  name: string;
  code: string;
  internals: number;
  externals: number;
  syllabus: string;
  totalUnits: number;
  courseType?: 'theory_joint' | 'lab_project';
  rawExamMax?: number;
  // Client-side only sub-entities (not persisted to DB yet)
  resources?: CourseResource[];
  topics?: SyllabusTopic[];
  lastOpenedResourceId?: string;
}

// ---------- Context type ----------
interface CourseContextType {
  courses: Course[];
  loading: boolean;
  error: string | null;
  addCourse: (course: Omit<Course, 'id'>) => Promise<void>;
  updateCourse: (id: string, course: Partial<Course>) => void;
  deleteCourse: (id: string) => Promise<void>;
  loadCourses: () => Promise<void>;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const API_BASE = 'http://localhost:8080/api/courses';

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ---------- Load courses from backend ----------
  const loadCourses = useCallback(async () => {
    if (!token) {
      setCourses([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to load courses (${res.status})`);
      }
      const data = await res.json();
      // Map backend response to frontend Course shape
      const mapped: Course[] = data.map((c: any) => ({
        id: String(c.id),
        name: c.name,
        code: c.code,
        internals: c.internals,
        externals: c.externals,
        syllabus: c.syllabus || '',
        totalUnits: c.totalUnits,
        courseType: c.courseType || 'theory_joint',
        rawExamMax: c.rawExamMax || 75,
        resources: [],
        topics: [],
      }));
      setCourses(mapped);
    } catch (err: any) {
      console.error('[CourseContext] loadCourses error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Load courses whenever token changes (login/logout)
  useEffect(() => {
    if (token) {
      loadCourses();
    } else {
      setCourses([]);
      setError(null);
    }
  }, [token, loadCourses]);

  // ---------- Add course via backend ----------
  const addCourse = async (courseData: Omit<Course, 'id'>) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setError(null);
    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          name: courseData.name,
          code: courseData.code,
          internals: courseData.internals,
          externals: courseData.externals,
          syllabus: courseData.syllabus,
          totalUnits: courseData.totalUnits,
          courseType: courseData.courseType,
          rawExamMax: courseData.rawExamMax,
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to create course (${res.status})`);
      }
      // Reload from DB to get the authoritative state
      await loadCourses();
    } catch (err: any) {
      console.error('[CourseContext] addCourse error:', err);
      setError(err.message);
      throw err; // Re-throw so the form can show the error
    }
  };

  // ---------- Update course (client-side for sub-entities, DB for core fields) ----------
  const updateCourse = (id: string, updatedFields: Partial<Course>) => {
    // For sub-entities (resources, topics, lastOpenedResourceId), update locally
    // For core fields, we'd call PUT /api/courses/:id — but for now, local update is fine
    setCourses(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
  };

  // ---------- Delete course via backend ----------
  const deleteCourse = async (id: string) => {
    if (!token) {
      setError('Not authenticated');
      return;
    }
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok && res.status !== 204) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Failed to delete course (${res.status})`);
      }
      // Reload from DB
      await loadCourses();
    } catch (err: any) {
      console.error('[CourseContext] deleteCourse error:', err);
      setError(err.message);
    }
  };

  return (
    <CourseContext.Provider value={{ courses, loading, error, addCourse, updateCourse, deleteCourse, loadCourses }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourses = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourses must be used within a CourseProvider');
  }
  return context;
};
