import { useState } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useTheme } from '../context/themeContext';

const PublicLayout = () => {
  const { isLoggedIn, userName, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

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
              {isLoggedIn ? (
                <>
                  <Link to="/dashboard/student" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Dashboard
                  </Link>
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
                </>
              ) : (
                <>
                  <Link to="/courses" className="text-white no-underline font-medium hover:opacity-85 transition-opacity text-sm lg:text-base">
                    Courses
                  </Link>
                  <button 
                    onClick={toggleTheme} 
                    className="bg-white/10 border border-white/20 text-white px-2.5 py-2 rounded-md cursor-pointer text-lg transition-all hover:bg-white/20 hover:scale-105 min-w-[36px] h-9 flex items-center justify-center"
                    aria-label="Toggle theme"
                  >
                    {theme === 'light' ? '🌙' : '☀️'}
                  </button>
                  <Link to="/login" className="bg-primary text-white px-3 lg:px-4 py-2 rounded-md no-underline text-xs lg:text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm">
                    Login
                  </Link>
                  <Link to="/signup" className="bg-transparent text-white border border-white/80 px-3 lg:px-4 py-2 rounded-md no-underline text-xs lg:text-sm font-medium transition-all hover:bg-white/10 hover:border-white">
                    Sign Up
                  </Link>
                </>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden bg-white/10 border border-white/20 text-white px-3 py-2 rounded-md"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-white/20 pt-4">
              <div className="flex flex-col gap-3">
                {isLoggedIn ? (
                  <>
                    <Link 
                      to="/dashboard/student" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-2"
                    >
                      Dashboard
                    </Link>
                    <span className="text-white/90 text-sm py-2">Hello, {userName}</span>
                    <button 
                      onClick={() => {
                        toggleTheme();
                        setMobileMenuOpen(false);
                      }} 
                      className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-md cursor-pointer text-base transition-all hover:bg-white/20 text-left"
                      aria-label="Toggle theme"
                    >
                      {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
                    </button>
                    <button 
                      onClick={() => {
                        handleLogout();
                        setMobileMenuOpen(false);
                      }} 
                      className="bg-danger text-white px-4 py-3 rounded-md cursor-pointer text-sm font-medium transition-all hover:bg-danger-hover text-left"
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      to="/courses" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-white no-underline font-medium hover:opacity-85 transition-opacity py-2"
                    >
                      Courses
                    </Link>
                    <button 
                      onClick={() => {
                        toggleTheme();
                        setMobileMenuOpen(false);
                      }} 
                      className="bg-white/10 border border-white/20 text-white px-4 py-3 rounded-md cursor-pointer text-base transition-all hover:bg-white/20 text-left"
                      aria-label="Toggle theme"
                    >
                      {theme === 'light' ? '🌙 Switch to Dark Mode' : '☀️ Switch to Light Mode'}
                    </button>
                    <Link 
                      to="/login" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-primary text-white px-4 py-3 rounded-md no-underline text-sm font-medium transition-all hover:bg-primary-hover text-center"
                    >
                      Login
                    </Link>
                    <Link 
                      to="/signup" 
                      onClick={() => setMobileMenuOpen(false)}
                      className="bg-transparent text-white border border-white/80 px-4 py-3 rounded-md no-underline text-sm font-medium transition-all hover:bg-white/10 hover:border-white text-center"
                    >
                      Sign Up
                    </Link>
                  </>
                )}
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

export default PublicLayout;
