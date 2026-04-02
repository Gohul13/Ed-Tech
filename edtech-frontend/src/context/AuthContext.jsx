import { useMemo, useState } from 'react';
import { AuthContext } from './authContext';

const AUTH_KEY = 'auth';

function getInitialAuthState() {
  const saved = localStorage.getItem(AUTH_KEY);
  if (!saved) return { isLoggedIn: false, userName: '', role: null, userId: null };
  try {
    const auth = JSON.parse(saved);
    if (auth?.token && auth?.user) {
      return {
        isLoggedIn: true,
        userName: auth.user.name || '',
        role: auth.user.role || null,
        userId: auth.user.id || null,
      };
    }
  } catch {
    // ignore
  }
  localStorage.removeItem(AUTH_KEY);
  return { isLoggedIn: false, userName: '', role: null, userId: null };
}

export const AuthProvider = ({ children }) => {
  const initial = useMemo(() => getInitialAuthState(), []);
  const [isLoggedIn, setIsLoggedIn] = useState(initial.isLoggedIn);
  const [userName, setUserName] = useState(initial.userName);
  const [role, setRole] = useState(initial.role);
  const [userId, setUserId] = useState(initial.userId);

  const login = (token, user) => {
    setIsLoggedIn(true);
    setUserName(user.name);
    setRole(user.role);
    setUserId(user.id);
    localStorage.setItem(AUTH_KEY, JSON.stringify({ token, user }));
  };

  const logout = () => {
    setIsLoggedIn(false);
    setUserName('');
    setRole(null);
    setUserId(null);
    localStorage.removeItem(AUTH_KEY);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, userName, role, userId, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
