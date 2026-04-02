import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { coursesApi, enrollmentApi, lessonsApi } from '../utils/api';

const placeholderImage = 'https://via.placeholder.com/400x250?text=Course';

const CourseDetails = () => {
  const { courseId } = useParams();
  const { isLoggedIn } = useAuth();
  const [course, setCourse] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const courseData = await coursesApi.getById(courseId);
        if (cancelled) return;
        setCourse(courseData);
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setCourse(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [courseId]);

  useEffect(() => {
    if (!isLoggedIn || !courseId) return;
    let cancelled = false;
    enrollmentApi.getMyCourses()
      .then((list) => {
        if (cancelled) return;
        const en = list.find((e) => String(e.courseId) === String(courseId));
        setEnrollment(en || null);
      })
      .catch(() => { if (!cancelled) setEnrollment(null); });
    return () => { cancelled = true; };
  }, [isLoggedIn, courseId]);

  useEffect(() => {
    if (!isLoggedIn || !enrollment || !courseId) {
      setLessons([]);
      return;
    }
    let cancelled = false;
    lessonsApi.getByCourseId(courseId)
      .then((list) => { if (!cancelled) setLessons(Array.isArray(list) ? list : []); })
      .catch(() => { if (!cancelled) setLessons([]); });
    return () => { cancelled = true; };
  }, [isLoggedIn, enrollment, courseId]);

  const handleEnroll = async () => {
    if (!isLoggedIn) {
      alert('Please login to enroll in courses');
      return;
    }
    setEnrolling(true);
    setError('');
    try {
      await enrollmentApi.enroll(courseId);
      const list = await enrollmentApi.getMyCourses();
      const en = list.find((e) => String(e.courseId) === String(courseId));
      setEnrollment(en || null);
      const lessonList = await lessonsApi.getByCourseId(courseId);
      setLessons(Array.isArray(lessonList) ? lessonList : []);
    } catch (err) {
      setError(err.message || 'Enrollment failed');
    } finally {
      setEnrolling(false);
    }
  };

  const isEnrolled = !!enrollment;
  const progress = enrollment?.progressPercentage ?? 0;
  const completedLessonIds = new Set((enrollment?.completedLessons || []).map(String));
  const allLessonsCompleted = lessons.length > 0 && completedLessonIds.size >= lessons.length;
  const isCourseCompleted = !!enrollment?.isCompleted;

  const isLessonCompleted = (lessonId) => completedLessonIds.has(String(lessonId));

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
            <div className="text-5xl sm:text-6xl mb-4">🔍</div>
            <h2 className="text-text-primary mb-3 text-xl sm:text-2xl font-semibold">Course Not Found</h2>
            <p className="text-text-secondary mb-6 text-base sm:text-lg">{error || "The course you're looking for doesn't exist or has been removed."}</p>
            <Link 
              to="/courses" 
              className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block min-h-[44px] flex items-center justify-center mx-auto"
            >
              Browse All Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const image = course.thumbnail || placeholderImage;

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.5fr] gap-6 sm:gap-8 lg:gap-10 mb-8 sm:mb-12 bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md border border-border-color">
          <div className="course-header-image">
            <img src={image} alt={course.title} className="w-full rounded-xl" />
          </div>
          <div className="course-header-content">
            <h1 className="mb-3 sm:mb-4 text-text-primary text-2xl sm:text-3xl font-semibold">{course.title}</h1>
            <p className="text-text-secondary mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base">{course.description}</p>
            {isEnrolled && (
              <div className="my-4 sm:my-6">
                <div className="w-full h-2 sm:h-2.5 bg-bg-tertiary rounded-md overflow-hidden mb-2 sm:mb-3">
                  <div 
                    className="h-full bg-success transition-all duration-400 rounded-md"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="text-xs sm:text-sm text-text-secondary font-medium">{progress}% Complete</span>
              </div>
            )}
            {!isEnrolled ? (
              <button 
                onClick={handleEnroll} 
                disabled={enrolling}
                className="bg-primary text-white px-6 sm:px-9 py-3 sm:py-4 rounded-lg cursor-pointer text-base sm:text-lg font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto min-h-[44px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {enrolling ? 'Enrolling...' : 'Enroll in Course'}
              </button>
            ) : (
              <p className="inline-block bg-success text-white px-4 sm:px-5 py-2 sm:py-2.5 rounded-lg mt-3 sm:mt-4 font-medium text-sm sm:text-base">✓ Enrolled</p>
            )}
          </div>
        </div>

        <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md border border-border-color">
          <h2 className="mb-6 sm:mb-8 text-text-primary text-2xl sm:text-3xl font-semibold">Course Lessons</h2>
          {lessons.length > 0 ? (
            <div className="flex flex-col gap-4 sm:gap-5">
              {lessons.map((lesson) => {
                const lessonId = lesson._id || lesson.id;
                const completed = isLessonCompleted(lessonId);
                return (
                  <div 
                    key={lessonId} 
                    className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 p-5 sm:p-7 border border-border-color rounded-lg transition-all bg-card-bg hover:bg-bg-secondary hover:border-primary sm:hover:translate-x-1"
                  >
                    <div className="flex-1">
                      <span className="inline-block bg-primary text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl text-xs sm:text-sm mb-2 sm:mb-3 font-medium">
                        Lesson {lesson.order != null ? lesson.order : '-'}
                      </span>
                      <h3 className="my-2 sm:my-3 text-text-primary text-base sm:text-lg font-semibold">{lesson.title}</h3>
                      <p className="text-text-secondary text-xs sm:text-sm">
                        {completed && (
                          <span className="inline-block bg-success text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl text-xs sm:text-sm mr-2 font-medium">
                            ✓ Completed
                          </span>
                        )}
                      </p>
                    </div>
                    {isEnrolled ? (
                      <Link 
                        to={`/lesson/${lessonId}`} 
                        className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
                      >
                        {completed ? 'Review Lesson' : 'Start Lesson'}
                      </Link>
                    ) : (
                      <button 
                        disabled 
                        className="bg-bg-tertiary text-text-tertiary cursor-not-allowed opacity-60 px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium w-full sm:w-auto min-h-[44px] flex items-center justify-center"
                      >
                        Enroll to Access
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 sm:py-12 px-4 sm:px-8">
              <div className="text-4xl sm:text-5xl mb-4">📝</div>
              <p className="text-text-secondary text-base sm:text-lg">
                {isEnrolled ? 'No lessons available for this course yet.' : 'Enroll to see lessons.'}
              </p>
            </div>
          )}

          {isEnrolled && (
            <div className="mt-8 pt-6 border-t border-border-color">
              <h3 className="text-text-primary font-semibold text-lg mb-2">Final Course Test</h3>
              {isCourseCompleted ? (
                <div className="bg-success/10 border border-success/20 rounded-lg p-4 text-success text-sm">
                  ✓ Course completed (final test passed)
                </div>
              ) : allLessonsCompleted ? (
                <Link
                  to={`/courses/${courseId}/final-test`}
                  className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block min-h-[44px] flex items-center justify-center w-full sm:w-auto"
                >
                  Start Final Test
                </Link>
              ) : (
                <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-text-primary text-sm">
                  Complete all lessons to unlock the final test.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
