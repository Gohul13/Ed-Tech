import { useState, useEffect } from 'react';
import { adminApi } from '../utils/api';

const emptyQuestion = () => ({
  question: '',
  options: ['', ''],
  correctAnswer: 0
});

const AdminLessons = () => {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [saving, setSaving] = useState(false);
  const [createForm, setCreateForm] = useState({ courseId: '', title: '', content: '', videoUrl: '', order: 1 });
  const [editForm, setEditForm] = useState({ title: '', content: '', videoUrl: '', order: 0 });
  const [publishingId, setPublishingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [uploadingLessonId, setUploadingLessonId] = useState(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [uploadingVideoLessonId, setUploadingVideoLessonId] = useState(null);
  const [quizQuestions, setQuizQuestions] = useState([emptyQuestion()]);
  const [savingQuizLessonId, setSavingQuizLessonId] = useState(null);

  const loadAll = async () => {
    try {
      const coursesList = await adminApi.getCourses();
      const arr = Array.isArray(coursesList) ? coursesList : [];
      setCourses(arr);

      const allLessons = [];
      for (const course of arr) {
        const id = course._id || course.id;
        const lessonList = await adminApi.getLessonsByCourse(id).catch(() => []);
        const list = Array.isArray(lessonList) ? lessonList : [];
        list.forEach((l) => {
          allLessons.push({
            ...l,
            _id: l._id || l.id,
            courseId: id,
            courseTitle: course.title
          });
        });
      }
      setLessons(allLessons);
    } catch (err) {
      setError(err.message || 'Failed to load lessons');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!createForm.courseId || !createForm.title.trim()) {
      setError('Select a course and enter a title');
      return;
    }
    setCreating(true);
    setError('');
    try {
      await adminApi.createLesson(createForm.courseId, {
        title: createForm.title.trim(),
        content: createForm.content.trim() || undefined,
        videoUrl: createForm.videoUrl.trim() || undefined,
        order: Number(createForm.order) || 1
      });
      setShowCreate(false);
      setCreateForm({ courseId: courses[0]?._id || '', title: '', content: '', videoUrl: '', order: lessons.length + 1 });
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to create lesson');
    } finally {
      setCreating(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setEditForm({
      title: lesson.title || '',
      content: lesson.content || '',
      videoUrl: lesson.videoUrl || '',
      order: lesson.order ?? 0
    });
    setVideoFile(null);
    setQuizQuestions([emptyQuestion()]);
    setError('');
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingLesson) return;
    setSaving(true);
    setError('');
    try {
      await adminApi.updateLesson(editingLesson._id, {
        title: editForm.title.trim(),
        content: editForm.content.trim() || undefined,
        videoUrl: editForm.videoUrl.trim() || undefined,
        order: Number(editForm.order) || editingLesson.order
      });
      setEditingLesson(null);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to update lesson');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (lessonId) => {
    if (!window.confirm('Delete this lesson? This cannot be undone.')) return;
    setDeletingId(lessonId);
    setError('');
    try {
      await adminApi.deleteLesson(lessonId);
      setEditingLesson((prev) => (prev?._id === lessonId ? null : prev));
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to delete lesson');
    } finally {
      setDeletingId(null);
    }
  };

  const handleUploadAttachment = async () => {
    if (!editingLesson || !attachmentFile) return;
    const lessonId = editingLesson._id || editingLesson.id;
    setUploadingLessonId(lessonId);
    setError('');
    try {
      const data = await adminApi.uploadLessonFile(lessonId, attachmentFile);
      setEditingLesson((prev) => (prev && (prev._id === lessonId || prev.id === lessonId) ? { ...prev, attachments: data.file || [] } : prev));
      setAttachmentFile(null);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploadingLessonId(null);
    }
  };

  const handleUploadVideo = async () => {
    if (!editingLesson || !videoFile) return;
    const lessonId = editingLesson._id || editingLesson.id;
    setUploadingVideoLessonId(lessonId);
    setError('');
    try {
      const data = await adminApi.uploadLessonVideo(lessonId, videoFile);
      setEditingLesson((prev) => (prev && (prev._id === lessonId || prev.id === lessonId) ? { ...prev, videoUrl: data.videoUrl } : prev));
      setEditForm((f) => ({ ...f, videoUrl: data.videoUrl || f.videoUrl }));
      setVideoFile(null);
    } catch (err) {
      setError(err.message || 'Video upload failed');
    } finally {
      setUploadingVideoLessonId(null);
    }
  };

  const handleSaveQuiz = async () => {
    if (!editingLesson) return;
    const lessonId = editingLesson._id || editingLesson.id;
    setSavingQuizLessonId(lessonId);
    setError('');
    try {
      let parsed;
      parsed = quizQuestions
        .map((q) => ({
          question: q.question.trim(),
          options: q.options.map((o) => o.trim()).filter(Boolean),
          correctAnswer: Number(q.correctAnswer) || 0
        }))
        .filter((q) => q.question && q.options.length >= 2 && q.correctAnswer < q.options.length);
      if (parsed.length === 0) {
        throw new Error('Add at least one valid question with 2+ options and a correct answer.');
      }
      await adminApi.createLessonQuiz(lessonId, parsed);
    } catch (err) {
      setError(err.message || 'Failed to save quiz');
    } finally {
      setSavingQuizLessonId(null);
    }
  };

  const handleRemoveAttachment = async (index) => {
    if (!editingLesson) return;
    const lessonId = editingLesson._id || editingLesson.id;
    setError('');
    try {
      await adminApi.deleteLessonAttachment(lessonId, index);
      setEditingLesson((prev) => (prev && (prev._id === lessonId || prev.id === lessonId)
        ? { ...prev, attachments: (prev.attachments || []).filter((_, i) => i !== index) }
        : prev));
    } catch (err) {
      setError(err.message || 'Failed to remove attachment');
    }
  };

  const handleTogglePublish = async (lessonId, currentPublished) => {
    setPublishingId(lessonId);
    setError('');
    try {
      await adminApi.togglePublishLesson(lessonId, !currentPublished);
      await loadAll();
    } catch (err) {
      setError(err.message || 'Failed to update');
    } finally {
      setPublishingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading lessons...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-0 mb-4">
            <div>
              <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">Admin – Lessons</h1>
              <p className="text-text-secondary text-base sm:text-lg">
                View and manage all lessons across your courses
              </p>
              <p className="text-text-tertiary text-xs sm:text-sm mt-1">
                Each lesson must have a quiz before it can be published.
              </p>
            </div>
            <button
              onClick={() => {
                setShowCreate(true);
                setCreateForm({
                  courseId: courses[0]?._id || courses[0]?.id || '',
                  title: '',
                  content: '',
                  videoUrl: '',
                  order: lessons.length + 1
                });
              }}
              disabled={courses.length === 0}
              className="bg-primary text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] flex items-center justify-center disabled:opacity-60 disabled:cursor-not-allowed"
            >
              + Create Lesson
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}

        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Create Lesson</h2>
              <form onSubmit={handleCreate}>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Course *</label>
                  <select
                    value={createForm.courseId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, courseId: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="">Select course</option>
                    {courses.map((c) => (
                      <option key={c._id || c.id} value={c._id || c.id}>{c.title}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={createForm.title}
                    onChange={(e) => setCreateForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    placeholder="Lesson title"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Content (optional)</label>
                  <textarea
                    value={createForm.content}
                    onChange={(e) => setCreateForm((f) => ({ ...f, content: e.target.value }))}
                    rows={3}
                    placeholder="Lesson content"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Video URL (optional)</label>
                  <input
                    type="text"
                    value={createForm.videoUrl}
                    onChange={(e) => setCreateForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="YouTube link or direct video URL"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={createForm.order}
                    onChange={(e) => setCreateForm((f) => ({ ...f, order: e.target.value }))}
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

        {editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-md w-full p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Edit Lesson</h2>
              <form onSubmit={handleSaveEdit}>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Title *</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))}
                    required
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Content (optional)</label>
                  <textarea
                    value={editForm.content}
                    onChange={(e) => setEditForm((f) => ({ ...f, content: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Video URL (optional)</label>
                  <input
                    type="text"
                    value={editForm.videoUrl}
                    onChange={(e) => setEditForm((f) => ({ ...f, videoUrl: e.target.value }))}
                    placeholder="YouTube link or direct video URL"
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-text-primary font-medium text-sm mb-2">Order</label>
                  <input
                    type="number"
                    min={1}
                    value={editForm.order}
                    onChange={(e) => setEditForm((f) => ({ ...f, order: e.target.value }))}
                    className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Attachments (PDF or files)</label>
                  {(editingLesson.attachments && editingLesson.attachments.length > 0) && (
                    <ul className="mb-3 space-y-1 text-sm text-text-primary">
                      {editingLesson.attachments.map((att, i) => (
                        <li key={i} className="flex items-center justify-between gap-2">
                          <span className="truncate">{att.name || att.fileName || `File ${i + 1}`}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAttachment(i)}
                            className="text-danger hover:underline text-xs font-medium shrink-0"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,image/*"
                      onChange={(e) => setAttachmentFile(e.target.files?.[0] || null)}
                      className="text-sm text-text-primary file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleUploadAttachment}
                      disabled={!attachmentFile || uploadingLessonId === (editingLesson._id || editingLesson.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60"
                    >
                      {uploadingLessonId === (editingLesson._id || editingLesson.id) ? 'Uploading...' : 'Add file'}
                    </button>
                  </div>
                  <p className="text-text-secondary text-xs mt-1">PDF, Word, or images. Students can view/download in the lesson.</p>
                </div>

                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Upload video (local file)</label>
                  <div className="flex gap-2 flex-wrap items-center">
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                      className="text-sm text-text-primary file:mr-2 file:py-1.5 file:px-3 file:rounded file:border-0 file:bg-primary file:text-white file:text-sm"
                    />
                    <button
                      type="button"
                      onClick={handleUploadVideo}
                      disabled={!videoFile || uploadingVideoLessonId === (editingLesson._id || editingLesson.id)}
                      className="px-3 py-1.5 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-hover disabled:opacity-60"
                    >
                      {uploadingVideoLessonId === (editingLesson._id || editingLesson.id) ? 'Uploading...' : 'Upload video'}
                    </button>
                  </div>
                  <p className="text-text-secondary text-xs mt-1">
                    This uploads to local storage and sets <code className="px-1 rounded bg-bg-secondary">videoUrl</code> automatically.
                  </p>
                </div>

                <div className="mb-6">
                  <label className="block text-text-primary font-medium text-sm mb-2">Lesson quiz questions</label>
                  <div className="space-y-3">
                    {quizQuestions.map((q, qIdx) => (
                      <div key={qIdx} className="border border-border-color rounded-lg p-3">
                        <input
                          type="text"
                          value={q.question}
                          onChange={(e) => setQuizQuestions((prev) => prev.map((item, i) => i === qIdx ? { ...item, question: e.target.value } : item))}
                          placeholder={`Question ${qIdx + 1}`}
                          className="w-full mb-2 px-3 py-2 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm"
                        />
                        <div className="space-y-2">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={opt}
                                onChange={(e) => setQuizQuestions((prev) => prev.map((item, i) => (
                                  i === qIdx
                                    ? { ...item, options: item.options.map((o, oi) => oi === oIdx ? e.target.value : o) }
                                    : item
                                )))}
                                placeholder={`Option ${oIdx + 1}`}
                                className="flex-1 px-3 py-2 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm"
                              />
                              <button
                                type="button"
                                onClick={() => setQuizQuestions((prev) => prev.map((item, i) => (
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
                            onClick={() => setQuizQuestions((prev) => prev.map((item, i) => i === qIdx ? { ...item, options: [...item.options, ''] } : item))}
                            className="px-2 py-1 rounded bg-secondary text-white text-xs"
                          >
                            + Option
                          </button>
                          <button
                            type="button"
                            onClick={() => setQuizQuestions((prev) => prev.filter((_, i) => i !== qIdx))}
                            disabled={quizQuestions.length === 1}
                            className="px-2 py-1 rounded bg-danger text-white text-xs disabled:opacity-60"
                          >
                            Remove Question
                          </button>
                        </div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setQuizQuestions((prev) => [...prev, emptyQuestion()])}
                      className="px-3 py-2 rounded bg-secondary text-white text-sm"
                    >
                      + Add Question
                    </button>
                  </div>
                  <div className="flex justify-end mt-2">
                    <button
                      type="button"
                      onClick={handleSaveQuiz}
                      disabled={savingQuizLessonId === (editingLesson._id || editingLesson.id)}
                      className="px-4 py-2.5 rounded-lg bg-secondary text-white text-sm font-medium hover:opacity-90 disabled:opacity-60 min-h-[44px] flex items-center justify-center"
                    >
                      {savingQuizLessonId === (editingLesson._id || editingLesson.id) ? 'Saving...' : 'Save Quiz'}
                    </button>
                  </div>
                </div>
                <div className="flex gap-3 justify-end">
                  <button
                    type="button"
                    onClick={() => { setEditingLesson(null); setAttachmentFile(null); setVideoFile(null); }}
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

        {lessons.length > 0 ? (
          <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto border border-border-color">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Title</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Course</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Order</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Status</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lessons.map((lesson) => {
                  const id = lesson._id || lesson.id;
                  const isPublishing = publishingId === id;
                  const isDeleting = deletingId === id;
                  return (
                    <tr key={id} className="hover:bg-bg-secondary transition-colors">
                      <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-medium text-sm sm:text-base">{lesson.title}</td>
                      <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary text-xs sm:text-sm text-text-secondary">{lesson.courseTitle}</td>
                      <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{lesson.order ?? '—'}</td>
                      <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${lesson.isPublished ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}`}>
                          {lesson.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="p-3 sm:p-5 text-left border-b border-border-color">
                        <div className="flex gap-2 flex-wrap">
                          <button
                            onClick={() => handleEdit(lesson)}
                            className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] flex items-center justify-center"
                          >
                            Edit / Quiz
                          </button>
                          <button
                            onClick={() => handleTogglePublish(id, lesson.isPublished)}
                            disabled={isPublishing}
                            className="bg-secondary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:opacity-90 disabled:opacity-70 min-h-[44px] flex items-center justify-center"
                          >
                            {isPublishing ? '...' : lesson.isPublished ? 'Unpublish' : 'Publish'}
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
            <div className="text-5xl sm:text-6xl mb-4">📝</div>
            <h3 className="text-text-primary mb-3 text-lg sm:text-xl font-semibold">No Lessons Yet</h3>
            <p className="text-text-secondary mb-6 text-base sm:text-lg">
              {courses.length === 0 ? 'Create a course first, then add lessons.' : 'Create your first lesson to get started.'}
            </p>
            {courses.length > 0 && (
              <button
                onClick={() => setShowCreate(true)}
                className="bg-primary text-white px-5 sm:px-7 py-3 sm:py-3.5 rounded-lg text-sm sm:text-base font-medium transition-all hover:bg-primary-hover min-h-[44px] flex items-center justify-center mx-auto"
              >
                + Create Lesson
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminLessons;
