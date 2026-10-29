import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { enrollmentApi } from '../utils/api';
import Calendar from '../components/Calendar';

const placeholderImage = 'https://via.placeholder.com/400x250?text=Course';

const StudentDashboard = () => {
  const { userName } = useAuth();
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false; 
    enrollmentApi.getMyCourses()
      .then((list) => { if (!cancelled) setMyCourses(Array.isArray(list) ? list : []); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const enrolledCount = myCourses.length;
  const completedLessonsCount = myCourses.reduce((sum, c) => sum + (c.completedLessons?.length || 0), 0);
  const overallProgress = myCourses.length
    ? Math.round(myCourses.reduce((sum, c) => sum + (c.progressPercentage || 0), 0) / myCourses.length)
    : 0;

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
          <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">Welcome back, {userName}!</h1>
          <p className="text-text-secondary text-base sm:text-lg">{currentDate}</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Enrolled Courses</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{enrolledCount}</p>
            {enrolledCount === 0 && (
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">No enrollments yet</p>
            )}
          </div>
          <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Completed Lessons</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{completedLessonsCount}</p>
          </div>
          <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Overall Progress</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">{overallProgress}%</p>
            {enrolledCount === 0 && (
              <p className="text-text-tertiary text-xs mt-1 sm:mt-2">Enroll to start</p>
            )}
          </div>
          <div className="bg-card-bg p-4 sm:p-6 lg:p-8 rounded-xl shadow-md text-center border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-text-secondary text-xs sm:text-sm mb-2 sm:mb-3 uppercase tracking-wide font-semibold">Courses Completed</h3>
            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary m-0">
              {myCourses.filter((c) => c.isCompleted).length}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 mb-10 sm:mb-14">
          <div className="lg:col-span-1">
            <h2 className="mb-4 sm:mb-5 text-text-primary text-xl sm:text-2xl font-semibold">Calendar</h2>
            <Calendar />
          </div>

          <div className="lg:col-span-2">
            <h2 className="mb-5 sm:mb-7 text-text-primary text-2xl sm:text-3xl font-semibold">My Courses</h2>
            {myCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
                {myCourses.map((c) => {
                  const progress = c.progressPercentage ?? 0;
                  const id = c.courseId;
                  const image = c.thumbnail || placeholderImage;
                  return (
                    <div 
                      key={c.enrollmentId || id} 
                      className="bg-card-bg rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-border-color hover:-translate-y-1.5 hover:shadow-lg"
                    >
                      <div className="w-full h-[180px] sm:h-[200px] lg:h-[220px] overflow-hidden bg-bg-tertiary">
                        <img 
                          src={image} 
                          alt={c.title}
                          className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                      <div className="p-5 sm:p-6 lg:p-7">
                        <h3 className="mb-3 sm:mb-4 text-text-primary text-lg sm:text-xl font-semibold">{c.title}</h3>
                        <div className="my-4 sm:my-6">
                          <div className="w-full h-2 sm:h-2.5 bg-bg-tertiary rounded-md overflow-hidden mb-2 sm:mb-3">
                            <div 
                              className="h-full bg-success transition-all duration-400 rounded-md"
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-xs sm:text-sm text-text-secondary font-medium">{progress}% Complete</span>
                            {c.isCompleted && (
                              <span className="text-xs text-success font-medium">Course Completed</span>
                            )}
                          </div>
                        </div>
                        <Link 
                          to={`/courses/${id}`} 
                          className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block w-full text-center min-h-[44px] flex items-center justify-center"
                        >
                          {c.isCompleted ? 'Review Course' : 'Continue Learning'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
                <div className="text-5xl sm:text-6xl mb-4">📚</div>
                <h3 className="text-text-primary mb-3 text-lg sm:text-xl font-semibold">No Courses Yet</h3>
                <p className="text-text-secondary mb-6 text-base sm:text-lg max-w-md mx-auto">
                  You haven't enrolled in any courses yet. Browse our catalog and start your learning journey today!
                </p>
                <Link 
                  to="/courses" 
                  className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block min-h-[44px] flex items-center justify-center mx-auto"
                >
                  Browse Courses
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="mb-10 sm:mb-14">
          <h2 className="mb-5 sm:mb-7 text-text-primary text-2xl sm:text-3xl font-semibold">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <Link 
              to="/courses" 
              className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md no-underline text-inherit transition-all border border-border-color hover:-translate-y-1 hover:shadow-lg hover:border-primary"
            >
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">Browse Courses</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">Discover new courses to expand your skills</p>
            </Link>
            <div className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg opacity-75">
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">Learning Path</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">Coming soon - Personalized learning recommendations</p>
            </div>
            <div className="bg-card-bg p-6 sm:p-8 rounded-xl shadow-md border border-border-color transition-all hover:-translate-y-1 hover:shadow-lg opacity-75">
              <h3 className="text-text-primary mb-2 text-lg sm:text-xl font-semibold">Certificates</h3>
              <p className="text-text-secondary m-0 leading-relaxed text-sm sm:text-base">Coming soon - Earn certificates upon completion</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
