import { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { lessonsApi, enrollmentApi, quizApi } from '../utils/api';
import QuizForm from '../components/QuizForm';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getYouTubeEmbedUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const u = url.trim();
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  for (const re of patterns) {
    const m = u.match(re);
    if (m) return `https://www.youtube.com/embed/${m[1]}`;
  }
  return null;
}

function isYouTubeUrl(url) {
  return getYouTubeEmbedUrl(url) != null;
}

const Lesson = () => {
  const { lessonId } = useParams();
  const { isLoggedIn } = useAuth();
  const [lesson, setLesson] = useState(null);
  const [lessonList, setLessonList] = useState([]);
  const [completed, setCompleted] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [quizPassed, setQuizPassed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!lessonId || !isLoggedIn) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const data = await lessonsApi.getById(lessonId);
        if (cancelled) return;
        setLesson(data);
        const courseId = data.courseId;
        const list = await lessonsApi.getByCourseId(courseId);
        if (cancelled) return;
        setLessonList(Array.isArray(list) ? list : []);

        setQuizLoading(true);
        try {
          const quizData = await quizApi.getByLessonId(lessonId);
          if (!cancelled) setQuiz(quizData);
        } catch {
          if (!cancelled) setQuiz(null);
        } finally {
          if (!cancelled) setQuizLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLesson(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [lessonId, isLoggedIn]);

  useEffect(() => {
    if (!lesson || !isLoggedIn) return;
    let cancelled = false;
    enrollmentApi.getMyCourses()
      .then((list) => {
        if (cancelled) return;
        const en = list.find((e) => String(e.courseId) === String(lesson.courseId));
        const completedIds = new Set((en?.completedLessons || []).map(String));
        setCompleted(completedIds.has(String(lessonId)));
        const lp = (en?.lessonProgress || []).find((x) => String(x.lessonId) === String(lessonId));
        setQuizPassed(!!lp?.isQuizPassed);
        if (lp?.quizScore != null && lp?.quizTotal != null) {
          setQuizResult({ score: lp.quizScore, total: lp.quizTotal, passed: !!lp.isQuizPassed });
        }
      })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [lesson, lessonId, isLoggedIn]);

  const handleMarkComplete = async () => {
    if (completed || completing) return;
    setCompleting(true);
    try {
      await enrollmentApi.completeLesson(lessonId);
      setCompleted(true);
    } catch (err) {
      setError(err.message || 'Failed to mark complete');
    } finally {
      setCompleting(false);
    }
  };

  const handleSubmitQuiz = async (answers) => {
    if (quizSubmitting) return;
    setQuizSubmitting(true);
    setError('');
    try {
      const r = await quizApi.submit(lessonId, answers);
      setQuizResult(r);
      setQuizPassed(!!r.passed);
    } catch (err) {
      setError(err.message || 'Failed to submit quiz');
    } finally {
      setQuizSubmitting(false);
    }
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading lesson...</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
            <div className="text-5xl sm:text-6xl mb-4">📖</div>
            <h2 className="text-text-primary mb-3 text-xl sm:text-2xl font-semibold">Lesson Not Found</h2>
            <p className="text-text-secondary mb-6 text-base sm:text-lg">{error || "The lesson you're looking for doesn't exist or you don't have access."}</p>
            <Link 
              to="/courses" 
              className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block min-h-[44px] flex items-center justify-center mx-auto"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const courseId = lesson.courseId;
  const courseTitle = lesson.courseTitle || 'Course';
  const currentIndex = lessonList.findIndex((l) => String(l._id || l.id) === String(lessonId));
  const nextLesson = currentIndex >= 0 && currentIndex < lessonList.length - 1 ? lessonList[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? lessonList[currentIndex - 1] : null;
  const nextId = nextLesson?._id || nextLesson?.id;
  const prevId = prevLesson?._id || prevLesson?.id;

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}
        <div className="mb-6 sm:mb-8">
          <Link 
            to={`/courses/${courseId}`} 
            className="text-primary no-underline mb-3 sm:mb-4 inline-block font-medium transition-all hover:text-primary-hover hover:underline hover:-translate-x-1 text-sm sm:text-base"
          >
            ← Back to Course
          </Link>
          <div className="flex gap-3 sm:gap-4 mt-2 text-xs sm:text-sm flex-wrap">
            <span className="text-text-secondary">{courseTitle}</span>
            <span className="text-primary font-semibold">
              Lesson {lesson.order != null ? lesson.order : currentIndex + 1} of {lessonList.length || 1}
            </span>
          </div>
        </div>

        <div className="bg-card-bg p-6 sm:p-8 lg:p-12 rounded-xl max-w-4xl mx-auto border border-border-color">
          <h1 className="mb-4 sm:mb-5 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">{lesson.title}</h1>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center mb-8 sm:mb-10 pb-4 sm:pb-6 border-b border-border-color">
            {completed && (
              <span className="inline-block bg-success text-white px-3 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl text-xs sm:text-sm font-medium">
                ✓ Completed
              </span>
            )}
          </div>
          <div className="leading-relaxed sm:leading-loose text-text-primary text-base sm:text-lg mb-8 sm:mb-10">
            <p className="whitespace-pre-line">{lesson.content || 'No content for this lesson.'}</p>
          </div>
          {lesson.videoUrl && (
            <div className="mb-8 sm:mb-10">
              {isYouTubeUrl(lesson.videoUrl) ? (
                <div className="relative w-full rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
                  <iframe
                    title="Lesson video"
                    src={getYouTubeEmbedUrl(lesson.videoUrl)}
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              ) : (
                <video src={lesson.videoUrl} controls className="w-full rounded-lg" />
              )}
            </div>
          )}

          <div className="mb-8 sm:mb-10">
            {quizLoading ? (
              <div className="text-text-secondary text-sm">Loading quiz...</div>
            ) : quiz ? (
              <QuizForm
                title="Lesson Quiz"
                quiz={quiz}
                onSubmit={handleSubmitQuiz}
                submitting={quizSubmitting}
                result={quizResult}
              />
            ) : (
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 text-sm text-text-primary">
                This lesson requires a quiz, but no quiz is available yet.
              </div>
            )}
          </div>
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="mb-8 sm:mb-10">
              <h3 className="text-text-primary font-semibold text-lg mb-3">Attachments</h3>
              <ul className="space-y-2">
                {lesson.attachments.map((att, i) => {
                  const href = att.url?.startsWith('http') ? att.url : `${API_BASE}${att.url}`;
                  const name = att.name || att.fileName || `Attachment ${i + 1}`;
                  const isPdf = /\.pdf$/i.test(name);
                  return (
                    <li key={i} className="flex items-center gap-2">
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium"
                      >
                        {isPdf ? '📄' : '📎'} {name}
                      </a>
                      {isPdf && (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-text-secondary text-sm hover:underline"
                        >
                          (View PDF)
                        </a>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="mb-8 sm:mb-10 text-center">
            {!completed ? (
              <button 
                onClick={handleMarkComplete} 
                disabled={completing || !quizPassed}
                className="bg-primary text-white px-6 sm:px-9 py-3 sm:py-4 rounded-lg cursor-pointer text-base sm:text-lg font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto min-h-[44px] flex items-center justify-center mx-auto disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {completing ? 'Saving...' : (!quizPassed ? 'Pass quiz to complete' : 'Mark as Completed')}
              </button>
            ) : (
              <div className="bg-success/10 border border-success/20 rounded-lg p-4 sm:p-6">
                <p className="text-success text-base sm:text-lg font-semibold">✓ You've completed this lesson!</p>
                <p className="text-text-secondary text-xs sm:text-sm mt-2">Great job! Continue to the next lesson or review this one anytime.</p>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row justify-between pt-6 sm:pt-8 border-t border-border-color gap-4">
            {prevId ? (
              <Link 
                to={`/lesson/${prevId}`} 
                className="bg-secondary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-secondary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
              >
                ← Previous Lesson
              </Link>
            ) : (
              <div />
            )}
            {nextId ? (
              <Link 
                to={`/lesson/${nextId}`} 
                className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
              >
                Next Lesson →
              </Link>
            ) : (
              <Link 
                to={`/courses/${courseId}`} 
                className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto text-center min-h-[44px] flex items-center justify-center"
              >
                Back to Course
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Lesson;
