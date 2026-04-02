import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { adminApi } from '../utils/api';
import Calendar from '../components/Calendar';

const AdminDashboard = () => {
  const { userName } = useAuth();
  const [stats, setStats] = useState(null);
  const [adminCourses, setAdminCourses] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [statsData, coursesData] = await Promise.all([
          adminApi.getStats(),
          adminApi.getCourses()
        ]);
        if (cancelled) return;
        setStats(statsData);
        const list = Array.isArray(coursesData) ? coursesData : [];
        setAdminCourses(list);

        const counts = {};
        await Promise.all(
          list.map(async (c) => {
            const id = c._id || c.id;
            const lessons = await adminApi.getLessonsByCourse(id).catch(() => []);
            if (!cancelled) counts[id] = Array.isArray(lessons) ? lessons.length : 0;
          })
        );
        if (!cancelled) setLessonCounts(counts);
      } catch (err) {
        if (!cancelled) setError(err.message || 'Failed to load dashboard');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}
        <div className="mb-6 sm:mb-10">
          <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">Admin Dashboard</h1>
          <p className="text-text-secondary text-base sm:text-lg">Welcome, {userName} | {currentDate}</p>
          <p className="text-text-tertiary text-xs sm:text-sm mt-2">
            Manage courses, track platform metrics, and oversee the learning platform
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8 mb-8 sm:mb-12">
          <div className="lg:col-span-3 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Total Courses</h3>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{stats?.totalCourses ?? '—'}</p>
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">On platform</p>
            </div>
            <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Students</h3>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{stats?.totalStudents ?? '—'}</p>
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">Registered</p>
            </div>
            <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Enrollments</h3>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{stats?.totalEnrollments ?? '—'}</p>
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">Total</p>
            </div>
            <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
              <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Completed</h3>
              <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{stats?.completedCourses ?? '—'}</p>
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">Courses finished</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <h2 className="mb-4 sm:mb-5 text-text-primary text-xl sm:text-2xl font-semibold">Calendar</h2>
            <Calendar />
          </div>
        </div>

        <div className="mb-10 sm:mb-14">
          <h2 className="mb-5 sm:mb-7 text-text-primary text-xl sm:text-2xl lg:text-3xl font-semibold">Quick Links</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <Link
              to="/admin/courses"
              className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md no-underline text-inherit transition-all border border-border-color hover:-translate-y-1 hover:shadow-lg hover:border-primary"
            >
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">📚 Manage Courses</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">View and manage all courses</p>
            </Link>
            <Link
              to="/admin/lessons"
              className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md no-underline text-inherit transition-all border border-border-color hover:-translate-y-1 hover:shadow-lg hover:border-primary"
            >
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">📝 Manage Lessons</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">View and manage all lessons</p>
            </Link>
            <Link
              to="/admin/dropout-risk"
              className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md no-underline text-inherit transition-all border border-border-color hover:-translate-y-1 hover:shadow-lg hover:border-primary"
            >
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">⚠️ Dropout Risk</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">See risk per student & course, notify learners</p>
            </Link>
          </div>
        </div>

        <div className="mb-10 sm:mb-14">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-5 sm:mb-7">
            <h2 className="text-text-primary text-xl sm:text-2xl lg:text-3xl font-semibold">Your Courses</h2>
            <Link
              to="/admin/courses"
              className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] flex items-center justify-center no-underline"
            >
              View All Courses →
            </Link>
          </div>
          {adminCourses.length > 0 ? (
            <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto border border-border-color">
              <table className="w-full border-collapse min-w-[600px]">
                <thead>
                  <tr>
                    <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Title</th>
                    <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Lessons</th>
                    <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Status</th>
                    <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {adminCourses.map((course) => {
                    const id = course._id || course.id;
                    const count = lessonCounts[id] ?? '—';
                    return (
                      <tr key={id} className="hover:bg-bg-secondary transition-colors">
                        <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-medium text-sm sm:text-base">{course.title}</td>
                        <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{count}</td>
                        <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${course.isPublished ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                            {course.isPublished ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="p-3 sm:p-5 text-left border-b border-border-color">
                          <Link
                            to="/admin/courses"
                            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] inline-flex items-center justify-center no-underline"
                          >
                            Manage
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
              <div className="text-5xl sm:text-6xl mb-4">📝</div>
              <h3 className="text-text-primary mb-3 text-lg sm:text-xl font-semibold">No Courses Yet</h3>
              <p className="text-text-secondary mb-6 text-base sm:text-lg">Create your first course in Manage Courses</p>
              <Link
                to="/admin/courses"
                className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-flex items-center justify-center mx-auto no-underline"
              >
                Manage Courses
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
