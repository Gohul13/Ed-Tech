import { useEffect, useMemo, useState } from 'react';
import { LearningContext } from './learningContext';

export const LearningProvider = ({ children }) => {
  const initial = useMemo(() => {
    const savedLearning = localStorage.getItem('learning');
    if (!savedLearning) return { enrolledCourses: [], completedLessons: [] };
    try {
      const learning = JSON.parse(savedLearning);
      return {
        enrolledCourses: learning?.enrolledCourses || [],
        completedLessons: learning?.completedLessons || []
      };
    } catch {
      localStorage.removeItem('learning');
      return { enrolledCourses: [], completedLessons: [] };
    }
  }, []);

  const [enrolledCourses, setEnrolledCourses] = useState(initial.enrolledCourses);
  const [completedLessons, setCompletedLessons] = useState(initial.completedLessons);

  // Save to localStorage whenever state changes
  useEffect(() => {
    localStorage.setItem('learning', JSON.stringify({
      enrolledCourses,
      completedLessons
    }));
  }, [enrolledCourses, completedLessons]);

  const enrollInCourse = (courseId) => {
    if (!enrolledCourses.includes(courseId)) {
      setEnrolledCourses([...enrolledCourses, courseId]);
    }
  };

  const markLessonComplete = (lessonId) => {
    if (!completedLessons.includes(lessonId)) {
      setCompletedLessons([...completedLessons, lessonId]);
    }
  };

  const isLessonCompleted = (lessonId) => {
    return completedLessons.includes(lessonId);
  };

  const getCourseProgress = (courseId, courseLessons) => {
    if (!courseLessons || courseLessons.length === 0) return 0;
    const courseLessonIds = courseLessons.map(lesson => lesson.id);
    const completedCount = courseLessonIds.filter(id => completedLessons.includes(id)).length;
    return Math.round((completedCount / courseLessonIds.length) * 100);
  };

  return (
    <LearningContext.Provider value={{
      enrolledCourses,
      completedLessons,
      enrollInCourse,
      markLessonComplete,
      isLessonCompleted,
      getCourseProgress
    }}>
      {children}
    </LearningContext.Provider>
  );
};
