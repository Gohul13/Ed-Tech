import { useEffect, useMemo, useState } from 'react';
import { adminMlApi, adminNotifyApi } from '../utils/api';

function badgeClass(level) {
  if (level === 'high') return 'bg-danger/15 text-danger border-danger/20';
  if (level === 'medium') return 'bg-primary/15 text-primary border-primary/20';
  return 'bg-success/15 text-success border-success/20';
}

function formatPercent(n) {
  if (typeof n !== 'number' || Number.isNaN(n)) return '—';
  return `${n.toFixed(2)}%`;
}

const AdminDropoutRisk = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState('enrollments'); // enrollments | students | courses
  const [query, setQuery] = useState('');
  const [minRisk, setMinRisk] = useState(0);
  const [levelFilter, setLevelFilter] = useState('all'); // all | low | medium | high

  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyRow, setNotifyRow] = useState(null);
  const [notifySubject, setNotifySubject] = useState('');
  const [notifyMessage, setNotifyMessage] = useState('');
  const [notifySending, setNotifySending] = useState(false);
  const [notifyResult, setNotifyResult] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await adminMlApi.getDropoutRiskStudents();
        if (cancelled) return;
        setRows(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load dropout risk');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  const filteredEnrollments = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows
      .filter((r) => (typeof r.riskPercent === 'number' ? r.riskPercent >= minRisk : true))
      .filter((r) => (levelFilter === 'all' ? true : r.riskLevel === levelFilter))
      .filter((r) => {
        if (!q) return true;
        const hay = `${r.student || ''} ${r.studentEmail || ''} ${r.course || ''}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => (b.riskPercent ?? 0) - (a.riskPercent ?? 0));
  }, [rows, query, minRisk, levelFilter]);

  const byStudent = useMemo(() => {
    const map = new Map();
    for (const r of filteredEnrollments) {
      const key = r.studentId || `${r.studentEmail || ''}:${r.student || ''}`;
      const prev = map.get(key);
      const risk = typeof r.riskPercent === 'number' ? r.riskPercent : 0;
      if (!prev) {
        map.set(key, {
          studentId: r.studentId,
          student: r.student,
          studentEmail: r.studentEmail,
          enrollments: 1,
          avgRisk: risk,
          maxRisk: risk,
          highRiskCourses: risk >= 70 ? 1 : 0
        });
      } else {
        const n = prev.enrollments + 1;
        prev.enrollments = n;
        prev.avgRisk = (prev.avgRisk * (n - 1) + risk) / n;
        prev.maxRisk = Math.max(prev.maxRisk, risk);
        prev.highRiskCourses += risk >= 70 ? 1 : 0;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.maxRisk - a.maxRisk);
  }, [filteredEnrollments]);

  const byCourse = useMemo(() => {
    const map = new Map();
    for (const r of filteredEnrollments) {
      const key = r.courseId || r.course;
      const prev = map.get(key);
      const risk = typeof r.riskPercent === 'number' ? r.riskPercent : 0;
      if (!prev) {
        map.set(key, {
          courseId: r.courseId,
          course: r.course,
          enrollments: 1,
          avgRisk: risk,
          maxRisk: risk,
          highRiskStudents: risk >= 70 ? 1 : 0
        });
      } else {
        const n = prev.enrollments + 1;
        prev.enrollments = n;
        prev.avgRisk = (prev.avgRisk * (n - 1) + risk) / n;
        prev.maxRisk = Math.max(prev.maxRisk, risk);
        prev.highRiskStudents += risk >= 70 ? 1 : 0;
      }
    }
    return Array.from(map.values()).sort((a, b) => b.maxRisk - a.maxRisk);
  }, [filteredEnrollments]);

  const openNotify = (row) => {
    setNotifyResult(null);
    setNotifyRow(row);
    setNotifySubject(row?.course ? `Support for your progress in ${row.course}` : 'Support for your learning progress');
    setNotifyMessage(
      `Hi ${row?.student || 'there'},\n\n` +
        `We noticed you may be at risk of dropping out from "${row?.course || 'your course'}" (risk: ${formatPercent(row?.riskPercent)}).\n\n` +
        `If you need help, reply to this email and we’ll support you.\n\n` +
        `Thanks,\nEduTech Team`
    );
    setNotifyOpen(true);
  };

  const sendNotify = async (e) => {
    e.preventDefault();
    if (!notifyRow?.studentId) {
      setNotifyResult({ ok: false, message: 'Missing studentId (cannot notify).' });
      return;
    }
    setNotifySending(true);
    setNotifyResult(null);
    try {
      const res = await adminNotifyApi.sendRiskEmail({
        studentId: notifyRow.studentId,
        courseId: notifyRow.courseId,
        riskPercent: notifyRow.riskPercent,
        subject: notifySubject,
        message: notifyMessage
      });
      setNotifyResult({
        ok: true,
        simulated: !!res.simulated,
        to: res.to,
        reason: res.reason
      });
    } catch (err) {
      setNotifyResult({ ok: false, message: err.message || 'Failed to send notification' });
    } finally {
      setNotifySending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center text-text-primary">
        <p className="text-lg">Loading dropout risk...</p>
      </div>
    );
  }

  return (
    <div className="min-h-[60vh] text-text-primary transition-colors duration-300 py-4 sm:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6 sm:mb-10">
          <h1 className="mb-2 text-text-primary text-2xl sm:text-3xl lg:text-4xl font-semibold">Admin – Dropout Risk</h1>
          <p className="text-text-secondary text-base sm:text-lg">
            View dropout risk per enrollment, per student, and per course
          </p>
        </div>

        {error && (
          <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
            {error}
          </div>
        )}

        <div className="mb-5 sm:mb-7 bg-card-bg rounded-xl shadow-md border border-border-color p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-3 lg:gap-4 items-stretch lg:items-end">
            <div className="flex-1">
              <label className="block text-text-primary font-medium text-sm mb-2">Search</label>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Student, email, or course..."
                className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="w-full lg:w-56">
              <label className="block text-text-primary font-medium text-sm mb-2">Min risk</label>
              <input
                type="number"
                min={0}
                max={100}
                value={minRisk}
                onChange={(e) => setMinRisk(Number(e.target.value || 0))}
                className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
              />
            </div>
            <div className="w-full lg:w-56">
              <label className="block text-text-primary font-medium text-sm mb-2">Risk level</label>
              <select
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
              >
                <option value="all">All</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => setTab('enrollments')}
              className={`px-3 py-2 rounded-lg text-sm font-medium border min-h-[44px] ${
                tab === 'enrollments'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-primary border-border-color hover:bg-bg-secondary'
              }`}
            >
              By Enrollment ({filteredEnrollments.length})
            </button>
            <button
              onClick={() => setTab('students')}
              className={`px-3 py-2 rounded-lg text-sm font-medium border min-h-[44px] ${
                tab === 'students'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-primary border-border-color hover:bg-bg-secondary'
              }`}
            >
              By Student ({byStudent.length})
            </button>
            <button
              onClick={() => setTab('courses')}
              className={`px-3 py-2 rounded-lg text-sm font-medium border min-h-[44px] ${
                tab === 'courses'
                  ? 'bg-primary text-white border-primary'
                  : 'bg-transparent text-text-primary border-border-color hover:bg-bg-secondary'
              }`}
            >
              By Course ({byCourse.length})
            </button>
          </div>
        </div>

        {tab === 'enrollments' && (
          <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto border border-border-color">
            <table className="w-full border-collapse min-w-[900px]">
              <thead>
                <tr>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Student</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Email</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Course</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Risk</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Level</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEnrollments.map((r) => (
                  <tr key={`${r.studentId}:${r.courseId}`} className="hover:bg-bg-secondary transition-colors">
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-medium text-sm sm:text-base">
                      {r.student || '—'}
                    </td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary text-sm">
                      {r.studentEmail || '—'}
                    </td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary text-sm sm:text-base">
                      {r.course || '—'}
                    </td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-semibold">
                      {formatPercent(r.riskPercent)}
                    </td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded border text-xs font-semibold ${badgeClass(r.riskLevel)}`}>
                        {r.riskLevel || '—'}
                      </span>
                    </td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color">
                      <button
                        onClick={() => openNotify(r)}
                        className="bg-primary text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all hover:bg-primary-hover hover:-translate-y-0.5 hover:shadow-sm min-h-[44px] inline-flex items-center justify-center"
                      >
                        Notify
                      </button>
                    </td>
                  </tr>
                ))}
                {filteredEnrollments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-secondary">
                      No results for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'students' && (
          <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto border border-border-color">
            <table className="w-full border-collapse min-w-[800px]">
              <thead>
                <tr>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Student</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Email</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Enrollments</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Avg risk</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Max risk</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">High-risk courses</th>
                </tr>
              </thead>
              <tbody>
                {byStudent.map((s) => (
                  <tr key={s.studentId || s.studentEmail} className="hover:bg-bg-secondary transition-colors">
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-medium text-sm sm:text-base">{s.student || '—'}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary text-sm">{s.studentEmail || '—'}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{s.enrollments}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-semibold">{formatPercent(s.avgRisk)}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-semibold">{formatPercent(s.maxRisk)}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{s.highRiskCourses}</td>
                  </tr>
                ))}
                {byStudent.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-6 text-center text-text-secondary">
                      No results for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'courses' && (
          <div className="bg-card-bg rounded-xl shadow-md overflow-x-auto border border-border-color">
            <table className="w-full border-collapse min-w-[700px]">
              <thead>
                <tr>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Course</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Enrollments</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Avg risk</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">Max risk</th>
                  <th className="p-3 sm:p-5 text-left border-b border-border-color bg-bg-secondary text-text-primary font-semibold uppercase text-xs tracking-wide">High-risk students</th>
                </tr>
              </thead>
              <tbody>
                {byCourse.map((c) => (
                  <tr key={c.courseId || c.course} className="hover:bg-bg-secondary transition-colors">
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-medium text-sm sm:text-base">{c.course || '—'}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{c.enrollments}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-semibold">{formatPercent(c.avgRisk)}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary font-semibold">{formatPercent(c.maxRisk)}</td>
                    <td className="p-3 sm:p-5 text-left border-b border-border-color text-text-primary">{c.highRiskStudents}</td>
                  </tr>
                ))}
                {byCourse.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-text-secondary">
                      No results for current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {notifyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-card-bg rounded-xl shadow-xl border border-border-color max-w-lg w-full p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h2 className="text-xl font-semibold text-text-primary">Notify student</h2>
                <p className="text-text-secondary text-sm mt-1">
                  {notifyRow?.student} • {notifyRow?.course} • {formatPercent(notifyRow?.riskPercent)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => { setNotifyOpen(false); setNotifyRow(null); }}
                className="px-3 py-2 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary min-h-[44px]"
              >
                Close
              </button>
            </div>

            {notifyResult?.ok && (
              <div className="mb-4 bg-success/10 text-success px-4 py-3 rounded-lg border border-success/20 text-sm">
                Sent {notifyResult.simulated ? '(simulated)' : ''} to {notifyResult.to || 'student'}{notifyResult.reason ? ` • ${notifyResult.reason}` : ''}.
              </div>
            )}
            {notifyResult && !notifyResult.ok && (
              <div className="mb-4 bg-danger/10 text-danger px-4 py-3 rounded-lg border border-danger/20 text-sm">
                {notifyResult.message || 'Failed to send.'}
              </div>
            )}

            <form onSubmit={sendNotify}>
              <div className="mb-4">
                <label className="block text-text-primary font-medium text-sm mb-2">Subject</label>
                <input
                  value={notifySubject}
                  onChange={(e) => setNotifySubject(e.target.value)}
                  className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="mb-6">
                <label className="block text-text-primary font-medium text-sm mb-2">Message</label>
                <textarea
                  value={notifyMessage}
                  onChange={(e) => setNotifyMessage(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2.5 border border-input-border rounded-lg bg-input-bg text-text-primary text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => { setNotifyOpen(false); setNotifyRow(null); }}
                  className="px-4 py-2.5 rounded-lg border border-border-color text-text-primary hover:bg-bg-secondary min-h-[44px]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={notifySending}
                  className="bg-primary text-white px-4 py-2.5 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-70 min-h-[44px]"
                >
                  {notifySending ? 'Sending...' : 'Send Email'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDropoutRisk;

