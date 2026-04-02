import { Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';

const Home = () => {
  const { isLoggedIn } = useAuth();

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white py-12 sm:py-16 lg:py-20 text-center transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl mb-4 font-bold px-4">Transform Your Career with EduTech</h1>
          <p className="text-base sm:text-lg lg:text-xl mb-8 sm:mb-10 opacity-95 max-w-2xl mx-auto leading-relaxed px-4">
            Master in-demand skills through expert-led courses. Track your progress, 
            learn at your pace, and unlock your potential with our comprehensive learning platform.
          </p>
          {!isLoggedIn ? (
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center px-4">
              <Link 
                to="/login" 
                className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg no-underline text-base sm:text-lg font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md w-full sm:w-auto min-h-[44px] flex items-center justify-center"
              >
                Start Learning
              </Link>
              <Link 
                to="/courses" 
                className="bg-white/10 text-white border border-white/30 px-6 sm:px-8 py-3 sm:py-4 rounded-lg no-underline text-base sm:text-lg font-medium transition-all hover:bg-white/20 hover:-translate-y-0.5 w-full sm:w-auto min-h-[44px] flex items-center justify-center"
              >
                Browse Courses
              </Link>
            </div>
          ) : (
            <div className="flex justify-center px-4">
              <Link 
                to="/courses" 
                className="bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg no-underline text-base sm:text-lg font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md min-h-[44px] flex items-center justify-center"
              >
                Continue Learning
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="py-12 sm:py-16 lg:py-20 bg-bg-secondary transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-4 text-2xl sm:text-3xl lg:text-4xl font-semibold text-text-primary">Why Choose EduTech?</h2>
          <p className="text-center mb-8 sm:mb-12 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto px-4">
            A modern learning platform built with industry best practices
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md text-center transition-all duration-300 border border-border-color hover:-translate-y-1 hover:shadow-lg">
              <div className="text-3xl sm:text-4xl mb-4">👨‍🏫</div>
              <h3 className="text-text-primary mb-4 text-lg sm:text-xl font-semibold">Expert Instructors</h3>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base">Learn from industry professionals with years of real-world experience.</p>
            </div>
            <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md text-center transition-all duration-300 border border-border-color hover:-translate-y-1 hover:shadow-lg">
              <div className="text-3xl sm:text-4xl mb-4">⏰</div>
              <h3 className="text-text-primary mb-4 text-lg sm:text-xl font-semibold">Flexible Learning</h3>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base">Study at your own pace, anytime, anywhere. No deadlines, no pressure.</p>
            </div>
            <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md text-center transition-all duration-300 border border-border-color hover:-translate-y-1 hover:shadow-lg">
              <div className="text-3xl sm:text-4xl mb-4">📊</div>
              <h3 className="text-text-primary mb-4 text-lg sm:text-xl font-semibold">Progress Tracking</h3>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base">Monitor your learning journey with detailed progress analytics and insights.</p>
            </div>
            <div className="bg-card-bg p-6 sm:p-8 lg:p-10 rounded-xl shadow-md text-center transition-all duration-300 border border-border-color hover:-translate-y-1 hover:shadow-lg">
              <div className="text-3xl sm:text-4xl mb-4">🎯</div>
              <h3 className="text-text-primary mb-4 text-lg sm:text-xl font-semibold">Role-Based Access</h3>
              <p className="text-text-secondary leading-relaxed text-sm sm:text-base">Student and admin dashboards with secure authentication and authorization.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack Section - Portfolio Credibility */}
      <div className="py-12 sm:py-16 lg:py-20 bg-card-bg border-t border-border-color transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center mb-4 text-2xl sm:text-3xl font-semibold text-text-primary">Built With Modern Technologies</h2>
          <p className="text-center mb-8 sm:mb-12 text-text-secondary text-base sm:text-lg max-w-2xl mx-auto px-4">
            This portfolio project demonstrates proficiency in modern frontend development
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-bg-secondary p-5 sm:p-6 rounded-lg border border-border-color">
              <h3 className="text-text-primary mb-3 text-base sm:text-lg font-semibold">Frontend Framework</h3>
              <ul className="text-text-secondary space-y-2 text-xs sm:text-sm">
                <li>• React 19 with Hooks</li>
                <li>• React Router for navigation</li>
                <li>• Context API for state management</li>
                <li>• Functional components only</li>
              </ul>
            </div>
            <div className="bg-bg-secondary p-5 sm:p-6 rounded-lg border border-border-color">
              <h3 className="text-text-primary mb-3 text-base sm:text-lg font-semibold">Styling & UI</h3>
              <ul className="text-text-secondary space-y-2 text-xs sm:text-sm">
                <li>• Tailwind CSS utility-first</li>
                <li>• Dark/Light theme support</li>
                <li>• Responsive design (mobile-first)</li>
                <li>• Smooth transitions & animations</li>
              </ul>
            </div>
            <div className="bg-bg-secondary p-5 sm:p-6 rounded-lg border border-border-color md:col-span-2 lg:col-span-1">
              <h3 className="text-text-primary mb-3 text-base sm:text-lg font-semibold">Key Features</h3>
              <ul className="text-text-secondary space-y-2 text-xs sm:text-sm">
                <li>• Protected routes & authentication</li>
                <li>• Role-based access (Student/Admin)</li>
                <li>• Progress tracking & analytics</li>
                <li>• LocalStorage persistence</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
