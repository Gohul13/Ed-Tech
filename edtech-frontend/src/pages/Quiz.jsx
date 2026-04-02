import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { enrollmentApi, finalTestApi, lessonsApi } from '../utils/api';
import QuizForm from '../components/QuizForm';

const QuizPage = () => {
  const { courseId } = useParams();
  const { isLoggedIn } = useAuth();
  const [finalTest, setFinalTest] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoggedIn || !courseId) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const [myCourses, lessonList] = await Promise.all([
          enrollmentApi.getMyCourses(),
          lessonsApi.getByCourseId(courseId).catch(() => []),
        ]);

        if (cancelled) return;
        setLessons(Array.isArray(lessonList) ? lessonList : []);

        const en = (Array.isArray(myCourses) ? myCourses : []).find((e) => String(e.courseId) === String(courseId));
        setEnrollment(en || null);

        const test = await finalTestApi.getByCourseId(courseId);
        if (!cancelled) setFinalTest(test);
        if (!cancelled && en?.finalTestScore != null && en?.finalTestTotal != null) {
          setResult({ score: en.finalTestScore, total: en.finalTestTotal, passed: !!en.isFinalTestPassed });
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load final test');
          setFinalTest(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, [isLoggedIn, courseId]);

  const canTake = useMemo(() => {
    if (!enrollment) return false;
    const completed = new Set((enrollment.completedLessons || []).map(String));
    const totalLessons = lessons.length;
    return totalLessons === 0 ? true : completed.size >= totalLessons;
  }, [enrollment, lessons]);

  const handleSubmit = async (answers) => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      const r = await finalTestApi.submit(courseId, answers);
      setResult(r);
      const myCourses = await enrollmentApi.getMyCourses().catch(() => null);
      const en = (Array.isArray(myCourses) ? myCourses : []).find((e) => String(e.courseId) === String(courseId));
      if (en) setEnrollment(en);
    } catch (err) {
      setError(err.message || 'Failed to submit final test');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isLoggedIn) return <Navigate to="/login" replace />;

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading final test...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <Link to={`/courses/${courseId}`} className="text-primary no-underline font-medium hover:underline">
            ← Back to Course
          </Link>
        </div>

        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}

        {!enrollment ? (
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <h1 className="text-2xl font-semibold mb-2">Final Test</h1>
            <p className="text-text-secondary">Enroll in this course to take the final test.</p>
          </div>
        ) : !canTake ? (
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <h1 className="text-2xl font-semibold mb-2">Final Test Locked</h1>
            <p className="text-text-secondary">Complete all lessons before taking the final test.</p>
          </div>
        ) : finalTest ? (
          <QuizForm
            title="Final Course Test"
            quiz={finalTest}
            onSubmit={handleSubmit}
            submitting={submitting}
            result={result}
          />
        ) : (
          <div className="bg-card-bg border border-border-color rounded-xl p-6">
            <h1 className="text-2xl font-semibold mb-2">Final Test</h1>
            <p className="text-text-secondary">No final test is available for this course yet.</p>
          </div>
        )}

        {result?.passed && (
          <div className="mt-4 bg-success/10 border border-success/20 rounded-lg p-4 text-success text-sm">
            Course completed. You passed the final test.
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizPage;

