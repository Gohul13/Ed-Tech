import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { authApi } from '../utils/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isLoggedIn, role } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      if (role === 'admin') navigate('/dashboard/admin', { replace: true });
      else navigate('/dashboard/student', { replace: true });
    }
  }, [isLoggedIn, role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      login(data.token, data.user);
      if (data.user.role === 'admin') {
        navigate('/dashboard/admin', { replace: true });
      } else {
        navigate('/dashboard/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[70vh] py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-card-bg p-6 sm:p-8 lg:p-12 rounded-xl shadow-lg max-w-md mx-auto w-full border border-border-color transition-all duration-300">
          <h2 className="mb-2 text-text-primary text-2xl sm:text-3xl font-semibold">Login</h2>
          <p className="text-text-secondary text-xs sm:text-sm mb-6 sm:mb-8 leading-relaxed">
            Sign in with your account
          </p>
          <form onSubmit={handleSubmit}>
            <div className="mb-5 sm:mb-6">
              <label htmlFor="email" className="block mb-2 text-text-primary font-medium text-xs sm:text-sm">
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter your email"
                className="w-full px-3 sm:px-3.5 py-3 sm:py-3.5 border border-input-border rounded-lg text-sm sm:text-base bg-input-bg text-text-primary transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[44px]"
              />
            </div>
            <div className="mb-5 sm:mb-6">
              <label htmlFor="password" className="block mb-2 text-text-primary font-medium text-xs sm:text-sm">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-3 sm:px-3.5 py-3 sm:py-3.5 border border-input-border rounded-lg text-sm sm:text-base bg-input-bg text-text-primary transition-all focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 min-h-[44px]"
              />
            </div>
            {error && (
              <div className="bg-danger/10 text-danger px-3 sm:px-3.5 py-3 sm:py-3.5 rounded-lg mb-4 text-xs sm:text-sm border border-danger/20">
                {error}
              </div>
            )}
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg cursor-pointer text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-md min-h-[44px] flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
          <p className="text-center mt-5 sm:mt-6 text-text-secondary text-xs sm:text-sm">
            Don't have an account? <Link to="/signup" className="text-primary no-underline font-medium transition-colors hover:text-primary-hover hover:underline">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
