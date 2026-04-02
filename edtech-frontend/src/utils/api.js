/**
 * API client for edtech backend.
 * All requests use the token from localStorage when available.
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function getToken() {
  const auth = localStorage.getItem('auth');
  if (!auth) return null;
  try {
    const { token } = JSON.parse(auth);
    return token;
  } catch {
    return null;
  }
}

async function request(path, options = {}) {
  const url = path.startsWith('http') ? path : `${BASE_URL}${path}`;
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  let res;
  try {
    res = await fetch(url, { ...options, headers });
  } catch (err) {
    const msg = err.message || 'Network error';
    if (msg.includes('fetch') || msg.includes('Failed to fetch') || msg.includes('NetworkError')) {
      throw new Error('Cannot reach server. Is the backend running at ' + BASE_URL + '?');
    }
    throw new Error(msg);
  }

  let data = {};
  const contentType = res.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    data = await res.json().catch(() => ({}));
  }

  if (!res.ok) {
    const message = data.message || data.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data;
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
};

// Auth
export const authApi = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (name, email, password, role = 'student') =>
    api.post('/auth/register', { name, email, password, role }),
};

// Courses (public)
export const coursesApi = {
  getAll: () => api.get('/courses'),
  getById: (id) => api.get(`/courses/${id}`),
};

// Lessons (authenticated)
export const lessonsApi = {
  getByCourseId: (courseId) => api.get(`/courses/${courseId}/lessons`),
  getById: (lessonId) => api.get(`/courses/lesson/${lessonId}`),
};

// Enrollment (authenticated)
export const enrollmentApi = {
  enroll: (courseId) => api.post(`/enroll/${courseId}`),
  getMyCourses: () => api.get('/my-courses'),
  completeLesson: (lessonId) => api.post(`/lessons/${lessonId}/complete`),
};

// Quizzes (lesson-level)
export const quizApi = {
  getByLessonId: (lessonId) => api.get(`/lessons/${lessonId}/quiz`),
  submit: (lessonId, answers) => api.post(`/lessons/${lessonId}/quiz/submit`, { answers }),
};

// Final Test (course-level)
export const finalTestApi = {
  getByCourseId: (courseId) => api.get(`/courses/${courseId}/final-test`),
  submit: (courseId, answers) => api.post(`/courses/${courseId}/final-test/submit`, { answers }),
};

// Admin – courses & lessons (require admin role)
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getCourses: () => api.get('/admin/courses'),
  createCourse: (body) => api.post('/admin/courses', body),
  updateCourse: (id, body) => api.put(`/admin/courses/${id}`, body),
  deleteCourse: (id) => api.delete(`/admin/courses/${id}`),
  togglePublishCourse: (id, isPublished) =>
    api.patch(`/admin/courses/${id}/publish`, { isPublished }),
  getLessonsByCourse: (courseId) => api.get(`/admin/courses/${courseId}/lessons`),
  createLesson: (courseId, body) => api.post(`/admin/courses/${courseId}/lessons`, body),
  updateLesson: (lessonId, body) => api.put(`/admin/lessons/${lessonId}`, body),
  deleteLesson: (lessonId) => api.delete(`/admin/lessons/${lessonId}`),
  togglePublishLesson: (lessonId, isPublished) =>
    api.patch(`/admin/lessons/${lessonId}/publish`, { isPublished }),
  uploadLessonFile: (lessonId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/admin/lessons/${lessonId}/upload`, {
      method: 'POST',
      body: formData,
    });
  },
  uploadLessonVideo: (lessonId, videoFile) => {
    const formData = new FormData();
    formData.append('video', videoFile);
    return request(`/admin/lessons/${lessonId}/upload-video`, {
      method: 'POST',
      body: formData,
    });
  },
  createLessonQuiz: (lessonId, questions) => api.post(`/admin/lessons/${lessonId}/quiz`, { questions }),
  createFinalTest: (courseId, questions) => api.post(`/admin/courses/${courseId}/final-test`, { questions }),
  deleteLessonAttachment: (lessonId, index) =>
    api.delete(`/admin/lessons/${lessonId}/attachments/${index}`),
};

// Admin – ML
export const adminMlApi = {
  getDropoutRiskStudents: () => api.get('/admin/ml/dropout-risk-students'),
  predictDropout: (params) => {
    const qs = new URLSearchParams(params);
    return api.get(`/admin/ml/predict-dropout?${qs.toString()}`);
  },
};

// Admin – Notifications
export const adminNotifyApi = {
  sendRiskEmail: (body) => api.post('/admin/notifications/risk', { ...body, channel: 'email' }),
};

export default api;
