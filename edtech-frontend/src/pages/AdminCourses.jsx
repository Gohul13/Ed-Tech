import { useState, useEffect } from 'react';
import { adminApi } from '../utils/api';

const emptyQuestion = () => ({
  question: '',
  options: ['', ''],
  correctAnswer: 0
});

const AdminCourses = () => {
  const [courses, setCourses] = useState([]);
  const [lessonCounts, setLessonCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createForm, setCreateForm] = useState({ title: '', description: '', thumbnail: '' });
  const [editingCourse, setEditingCourse] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', description: '', thumbnail: '' });
  const [saving, setSaving] = useState(false);
  const [publishingId, setPublishingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [finalTestCourse, setFinalTestCourse] = useState(null);
  const [finalTestQuestions, setFinalTestQuestions] = useState([emptyQuestion()]);
  const [savingFinalTestId, setSavingFinalTestId] = useState(null);

  const loadCourses = async () => {
    try {
      const list = await adminApi.getCourses();
      const arr = Array.isArray(list) ? list : [];
      setCourses(arr);
      const counts = {};
      await Promise.all(
        arr.map(async (c) => {
          const id = c._id || c.id;
          const lessons = await adminApi.getLessonsByCourse(id).catch(() => []);
          counts[id] = Array.isArray(lessons) ? lessons.length : 0;
        })
      );
      setLessonCounts(counts);
    } catch (err) {
      setError(err.message || 'Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCourses();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.description.trim()) {
      setError('Title and description are required');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await adminApi.createCourse({
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        thumbnail: createForm.thumbnail.trim() || undefined
      });
      setShowCreate(false);
      setCreateForm({ title: '', description: '', thumbnail: '' });
      await loadCourses();
    } catch (err) {
      setError(err.message || 'Failed to create course');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (course) => {
    setEditingCourse(course);
    setEditForm({
      title: course.title || '',
      description: course.description || '',
      thumbnail: course.thumbnail || ''
    });
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingCourse) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.updateCourse(editingCourse._id || editingCourse.id, {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        thumbnail: editForm.thumbnail.trim() || ''
      });
      setEditingCourse(null);
      await loadCourses();
    } catch (err) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? All its lessons and enrollments will be removed. This cannot be undone.')) return;
    setDeletingId(id);
    setError('');
    try {
      await adminApi.deleteCourse(id);
      setEditingCourse((prev) => (prev && (prev._id === id || prev.id === id) ? null : prev));
      await loadCourses();
    } catch (err) {
      setError(err.message || 'Failed to delete course');
    } finally {
      setDeletingId(null);
    }
  };

  const handleTogglePublish = async (id, currentPublished) => {
    setPublishingId(id);
    setError('');
    try {
      await adminApi.togglePublishCourse(id, !currentPublished);
      await loadCourses();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setPublishingId(null);
    }
  };

  const handleOpenFinalTest = (course) => {
    setFinalTestCourse(course);
    setFinalTestQuestions([emptyQuestion()]);
    setError('');
  };

  const handleSaveFinalTest = async () => {
    if (!finalTestCourse) return;
    const id = finalTestCourse._id || finalTestCourse.id;
    setSavingFinalTestId(id);
    setError('');
    try {
      let parsed;
      parsed = finalTestQuestions
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctAnswer: Number(q.correctAnswer) || 0
        }))
        .filter((q) => q.question && q.options.length >= 2 && q.correctAnswer < q.options.length);
      if (parsed.length === 0) {
        throw new Error('Add at least one valid test question with 2+ options and a correct answer.');
      }
      await adminApi.createFinalTest(id, parsed);
      setFinalTestCourse(null);
    } catch (err) {
      setError(err.message || 'Failed to save final test');
    } finally {
      setSavingFinalTestId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading courses...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
            <div>
              <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">Admin – Courses</h1>
              <p className="text-text-secondary text-base sm:text-lg">
                View and manage your courses
              </p>
              <p className="text-text-tertiary text-xs sm:text-sm mt-1">
                Publish requires quizzes for all lessons and a final test for the course.
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] flex items-center justify-center"
            >
              + Create Course
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}

        {finalTestCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-text-primary mb-2">Final Test Questions</h2>
              <p className="text-text-secondary text-sm mb-4">{finalTestCourse.title}</p>
              <div className="space-y-3">
                {finalTestQuestions.map((q, qIdx) => (
                  <div key={qIdx} className="border border-border-color rounded-lg p-3">
                    <input
                      type="text"
                      value={q.question}
                      onChange={(e) => setFinalTestQuestions((prev) => prev.map((item, i) => i === qIdx ? { ...item, question: e.target.value } : item))}
                      placeholder={`Question ${qIdx + 1}`}
                      className="w-full mb-2 px-3 py-2 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm"
                    />
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => (
                        <div key={oIdx} className="flex gap-2">
                          <input
                            type="text"
                            value={opt}
                            onChange={(e) => setFinalTestQuestions((prev) => prev.map((item, i) => (
                              i === qIdx
                                ? { ...item, options: item.options.map((o, oi) => oi === oIdx ? e.target.value : o) }
                                : item
                            )))}
                            placeholder={`Option ${oIdx + 1}`}
                            className="flex-1 px-3 py-2 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setFinalTestQuestions((prev) => prev.map((item, i) => (
                              i === qIdx ? { ...item, correctAnswer: oIdx } : item
                            )))}
                            className={`px-2 py-1 rounded text-xs ${q.correctAnswer === oIdx ? 'bg-success text-white' : 'bg-bg-secondary text-text-primary'}`}
                          >
                            Correct
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => setFinalTestQuestions((prev) => prev.map((item, i) => i === qIdx ? { ...item, options: [...item.options, ''] } : item))}
                        className="px-2 py-1 rounded bg-secondary text-white text-xs"
                      >
                        + Option
                      </button>
                      <button
                        type="button"
                        onClick={() => setFinalTestQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                        disabled={finalTestQuestions.length === 1}
                        className="px-2 py-1 rounded bg-danger text-white text-xs disabled:opacity-60"
                      >
                        Remove Question
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setFinalTestQuestions((prev) => [...prev, emptyQuestion()])}
                  className="px-3 py-2 rounded bg-secondary text-white text-sm"
                >
                  + Add Question
                </button>
              </div>
              <div className="flex gap-3 justify-end mt-4">
                <button
                  type="button"
                  onClick={() => setFinalTestCourse(null)}
                  className="px-4 py-2.5 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFinalTest}
                  disabled={savingFinalTestId === (finalTestCourse._id || finalTestCourse.id)}
                  className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70"
                >
                  {savingFinalTestId === (finalTestCourse._id || finalTestCourse.id) ? 'Saving...' : 'Save Final Test'}
                </button>
              </div>
            </div>
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-md w-full p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Create Course</h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="Course title"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Description *</label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Course description"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Thumbnail URL (optional)</label>
                  <input
                    type="text"
                    value={createForm.thumbnail}
                    onChange={(e) => setCreateForm((f) => ({ ...f, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setShowCreate(false); setError(''); }}
                    className="px-4 py-2.5 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70"
                  >
                    {creating ? 'Creating...' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-md w-full p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Edit Course</h2>
              <form onSubmit={handleSaveEdit}>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="Course title"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Description *</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                    required
                    rows={3}
                    placeholder="Course description"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Thumbnail URL (optional)</label>
                  <input
                    type="text"
                    value={editForm.thumbnail}
                    onChange={(e) => setEditForm((f) => ({ ...f, thumbnail: e.target.value }))}
                    placeholder="https://..."
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingCourse(null)}
                    className="px-4 py-2.5 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70"
                  >
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {courses.length > 0 ? (
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
                {courses.map((course) => {
                  const id = course._id || course.id;
                  const count = lessonCounts[id] ?? 0;
                  const isPublishing = publishingId === id;
                  const isDeleting = deletingId === id;
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
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(course)}
                            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] flex items-center justify-center"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleOpenFinalTest(course)}
                            className="bg-secondary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:opacity-90 min-h-[44px] flex items-center justify-center"
                          >
                            Final Test
                          </button>
                          <button
                            onClick={() => handleTogglePublish(id, course.isPublished)}
                            disabled={isPublishing}
                            className="bg-secondary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-70 min-h-[44px] flex items-center justify-center"
                          >
                            {isPublishing ? '...' : course.isPublished ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => handleDelete(id)}
                            disabled={isDeleting}
                            className="bg-danger text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:bg-danger-hover disabled:opacity-70 min-h-[44px] flex items-center justify-center"
                          >
                            {isDeleting ? '...' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 sm:py-16 px-4 sm:px-8 bg-card-bg rounded-xl shadow-md border border-border-color">
            <div className="text-5xl sm:text-6xl mb-4">📚</div>
            <h3 className="text-text-primary mb-3 text-lg sm:text-xl font-semibold">No Courses Yet</h3>
            <p className="text-text-secondary mb-6 text-base sm:text-lg">Create your first course to get started</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover min-h-[44px] flex items-center justify-center mx-auto"
            >
              + Create Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
