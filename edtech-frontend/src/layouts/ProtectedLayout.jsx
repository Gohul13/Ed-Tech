import { useState } from 'react';
import { Link, Outlet, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';

const ProtectedLayout = () => {
  const { isLoggedIn, userName, role, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-bg-secondary transition-colors duration-300">
      <header className="bg-header-bg text-white shadow-md transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link to="/" className="text-white no-underline hover:opacity-90 transition-opacity">
              <h1 className="m-0 text-xl sm:text-2xl font-semibold">EduTech</h1>
            </Link>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex gap-4 lg:gap-6 items-center">
              <Link to="/courses" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                Courses
              </Link>
              {role === 'student' && (
                <Link to="/dashboard/student" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                  My Dashboard
                </Link>
              )}
              {role === 'admin' && (
                <>
                  <Link to="/dashboard/admin" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Admin Dashboard
                  </Link>
                  <Link to="/admin/courses" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Manage Courses
                  </Link>
                  <Link to="/admin/lessons" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Manage Lessons
                  </Link>
                  <Link to="/admin/dropout-risk" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Dropout Risk
                  </Link>
                </>
              )}
              <span className="text-white/90 text-xs lg:text-sm hidden lg:inline">Hello, {userName}</span>
              <button 
                onClick={toggleTheme} 
                className="bg-white/10 border border-white/20 text-white px-2.5 py-2 rounded-md cursor-pointer text-lg transition-all hover:bg-white/20 hover:scale-105 min-w-[36px] h-9 flex items-center justify-center"
                aria-label="Toggle theme"
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <button 
                onClick={handleLogout} 
                className="bg-danger text-white px-3 py-2 rounded-md cursor-pointer text-xs lg:text-sm font-medium transition-all hover:bg-danger-hover hover:-translate-y-0.5 hover:shadow-sm"
              >
                Logout
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col gap-3">
                <Link 
                  to="/courses" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                >
                  Courses
                </Link>
                {role === 'student' && (
                  <Link 
                    to="/dashboard/student" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                  >
                    My Dashboard
                  </Link>
                )}
                {role === 'admin' && (
                  <>
                    <Link 
                      to="/dashboard/admin" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                    >
                      Admin Dashboard
                    </Link>
                    <Link 
                      to="/admin/courses" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                    >
                      Manage Courses
                    </Link>
                    <Link 
                      to="/admin/lessons" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                    >
                      Manage Lessons
                    </Link>
                    <Link 
                      to="/admin/dropout-risk" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-3 min-h-[44px] flex items-center"
                    >
                      Dropout Risk
                    </Link>
                  </>
                )}
                <span className="text-white/90 text-sm py-3 min-h-[44px] flex items-center">Hello, {userName}</span>
                <button 
                  onClick={() => {
                    toggleTheme();
                    setMobileMenuOpen(false);
                  }} 
                  className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-md cursor-pointer text-base transition-all hover:bg-white/20 text-left min-h-[44px]"
                  aria-label="Toggle theme"
                >
                  {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
                </button>
                <button 
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }} 
                  className="bg-danger text-white px-4 py-3 rounded-md cursor-pointer text-sm font-medium transition-all hover:bg-danger-hover text-left min-h-[44px]"
                >
                  Logout
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>
      <main className="flex-1 py-4 sm:py-6 lg:py-8 bg-bg-secondary transition-colors duration-300">
        <Outlet />
      </main>
      <footer className="bg-footer-bg text-white/90 py-4 sm:py-6 mt-auto transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="m-0 text-sm sm:text-base">&copy; 2024 EduTech. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default ProtectedLayout;
