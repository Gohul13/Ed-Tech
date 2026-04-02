import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { coursesApi } from '../utils/api';

const placeholderImage = 'https://via.placeholder.com/400x250?text=Course';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadCourses = () => {
    setLoading(true);
    setError('');
    let cancelled = false;
    coursesApi.getAll()
      .then((data) => { if (!cancelled) setCourses(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load courses'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  };

  useEffect(() => {
    let cancelled = false;
    coursesApi.getAll()
      .then((data) => { if (!cancelled) setCourses(Array.isArray(data) ? data : []); })
      .catch((err) => { if (!cancelled) setError(err.message || 'Failed to load courses'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading courses...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 gap-4">
        <div className="bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-center max-w-md">
          {error}
        </div>
        <button
          type="button"
          onClick={() => loadCourses()}
          className="bg-primary text-white px-5 py-2.5 rounded-lg font-medium hover:bg-primary-hover"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">All Courses</h1>
          <p className="text-text-secondary text-base sm:text-lg">Explore our comprehensive catalog of courses designed to advance your career</p>
        </div>
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {courses.map((course) => {
              const id = course._id || course.id;
              const image = course.thumbnail || placeholderImage;
              return (
                <div 
                  key={id} 
                  className="bg-card-bg rounded-xl overflow-hidden shadow-md transition-all duration-300 border border-border-color hover:-translate-y-1.5 hover:shadow-lg"
                >
                  <div className="w-full h-[180px] sm:h-[200px] lg:h-[220px] overflow-hidden bg-bg-tertiary">
                    <img 
                      src={image} 
                      alt={course.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="p-5 sm:p-6 lg:p-7">
                    <h3 className="mb-2 sm:mb-3 text-text-primary text-lg sm:text-xl font-semibold">{course.title}</h3>
                    <p className="text-text-secondary mb-3 sm:mb-4 leading-relaxed text-sm sm:text-base line-clamp-3">{course.description}</p>
                    <Link 
                      to={`/courses/${id}`} 
                      className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg no-underline text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md inline-block w-full text-center min-h-[44px] flex items-center justify-center"
                    >
                      View Course Details
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <h3 className="text-text-primary mb-3 text-lg sm:text-xl font-semibold">No Courses Available</h3>
            <p className="text-text-secondary mb-6 text-base sm:text-lg max-w-md mx-auto">
              We're currently updating our course catalog. Check back soon for new learning opportunities!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
