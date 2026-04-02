import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/authContext';
import PublicLayout from './layouts/PublicLayout';
import ProtectedLayout from './layouts/ProtectedLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import StudentDashboard from './pages/StudentDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminLessons from './pages/AdminLessons';
import AdminDropoutRisk from './pages/AdminDropoutRisk';
import Lesson from './pages/Lesson';
import Quiz from './pages/Quiz';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useAuth();
  return isLoggedIn ? children : <Navigate to="/login" replace />;
};

// Admin-only Route Component
const AdminRoute = ({ children }) => {
  const { isLoggedIn, role } = useAuth();
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'admin') {
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};

// Public Route Component (redirects if logged in)
const PublicRoute = ({ children }) => {
  const { isLoggedIn, role } = useAuth();
  if (isLoggedIn) {
    if (role === 'admin') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    return <Navigate to="/dashboard/student" replace />;
  }
  return children;
};
function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<PublicLayout />}>
          <Route index element={<Home />} />
          <Route path="login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/:courseId" element={<CourseDetails />} />
        </Route>

        {/* Protected Routes */}
        <Route path="/dashboard" element={<ProtectedLayout />}>
          <Route path="student" element={
            <ProtectedRoute>
              <StudentDashboard />
            </ProtectedRoute>
          } />
          <Route path="admin" element={
            <ProtectedRoute>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedRoute>
          } />
        </Route>

        {/* Admin-only Routes */}
        <Route path="/admin" element={<ProtectedLayout />}>
          <Route path="courses" element={
            <AdminRoute>
              <AdminCourses />
            </AdminRoute>
          } />
          <Route path="lessons" element={
            <AdminRoute>
              <AdminLessons />
            </AdminRoute>
          } />
          <Route path="dropout-risk" element={
            <AdminRoute>
              <AdminDropoutRisk />
            </AdminRoute>
          } />
        </Route>

        <Route path="/lesson" element={<ProtectedLayout />}>
          <Route path=":lessonId" element={
            <ProtectedRoute>
              <Lesson />
            </ProtectedRoute>
          } />
        </Route>

        <Route path="/courses" element={<ProtectedLayout />}>
          <Route path=":courseId/final-test" element={
            <ProtectedRoute>
              <Quiz />
            </ProtectedRoute>
          } />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
