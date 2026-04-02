import { useMemo, useState } from 'react';

const QuizForm = ({
  title = 'Quiz',
  quiz,
  onSubmit,
  submitting = false,
  result,
}) => {
  const total = quiz?.questions?.length || 0;
  const [answers, setAnswers] = useState([]);

  const canSubmit = useMemo(() => {
    if (!quiz || total === 0) return false;
    return answers.filter((a) => Number.isInteger(a)).length === total;
  }, [answers, quiz, total]);

  const handlePick = (qIdx, optIdx) => {
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = optIdx;
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || submitting) return;
    await onSubmit(answers);
  };

  if (!quiz) return null;

  return (
    <div className="bg-card-bg border border-border-color rounded-xl p-5 sm:p-6">
      <h3 className="text-text-primary font-semibold text-lg mb-2">{title}</h3>
      <p className="text-text-secondary text-sm mb-4">
        Answer all questions and submit. You need at least {result?.passScorePercent ?? 60}% to pass.
      </p>

      {total === 0 ? (
        <div className="text-text-secondary text-sm">No questions available.</div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {quiz.questions.map((q, qIdx) => (
            <div key={qIdx} className="border border-border-color rounded-lg p-4">
              <div className="text-text-primary font-medium mb-3">
                {qIdx + 1}. {q.question}
              </div>
              <div className="grid gap-2">
                {q.options.map((opt, optIdx) => {
                  const picked = answers[qIdx] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer border ${
                        picked ? 'border-primary bg-primary/10' : 'border-border-color hover:bg-bg-secondary'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${qIdx}`}
                        checked={picked}
                        onChange={() => handlePick(qIdx, optIdx)}
                      />
                      <span className="text-text-primary text-sm">{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}

          {result && (
            <div className={`rounded-lg p-3 text-sm border ${result.passed ? 'bg-success/10 border-success/20 text-success' : 'bg-danger/10 border-danger/20 text-danger'}`}>
              Score: {result.score}/{result.total} ({result.percent ?? Math.round((result.score / Math.max(result.total, 1)) * 100)}%) | Pass score: {result.requiredScore ?? 0}/{result.total} ({result.passScorePercent ?? 60}%) —{' '}
              {result.passed ? 'Passed' : 'Not passed'}
            </div>
          )}

          {result?.review?.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-text-primary font-semibold text-base">Correct Answers</h4>
              {result.review.map((item, idx) => (
                <div key={idx} className={`border rounded-lg p-3 ${item.isCorrect ? 'border-success/30 bg-success/5' : 'border-danger/30 bg-danger/5'}`}>
                  <div className="text-sm font-medium text-text-primary mb-2">
                    {idx + 1}. {item.question}
                  </div>
                  <div className="text-xs text-text-secondary mb-1">
                    Your answer: {item.selectedAnswer != null ? item.options[item.selectedAnswer] : 'Not answered'}
                  </div>
                  <div className="text-xs text-text-primary">
                    Correct answer: {item.options[item.correctAnswer]}
                  </div>
                </div>
              ))}
            </div>
          )}

          <button
            type="submit"
            disabled={!canSubmit || submitting}
            className="bg-primary text-white px-5 py-3 rounded-lg font-medium hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed min-h-[44px]"
          >
            {submitting ? 'Submitting...' : 'Submit Answers'}
          </button>
        </form>
      )}
    </div>
  );
};

export default QuizForm;

