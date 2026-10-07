import { useEffect, useState } from 'react';
import { academicsApi } from '../api';

export default function ObjectiveTestPage({ chapterUuid, title, subjectName, onBack }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    setResult(null);
    setAnswers({});
    academicsApi.objectiveTest(chapterUuid)
      .then((response) => {
        if (active) setQuestions(response.data?.questions || []);
      })
      .catch((requestError) => {
        if (active) setError(requestError.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [chapterUuid]);

  const resultFor = (questionId) => result?.results?.find((item) => item.uuid === questionId);

  const submit = async (event) => {
    event.preventDefault();
    const unanswered = questions.some((question) => !answers[question.uuid]);
    if (unanswered) {
      setError('Har question ka ek option choose karo.');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const response = await academicsApi.submitObjectiveTest(chapterUuid, answers);
      setResult(response.data);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="objective-test">
      <div className="objective-test-card">
        <button className="class-page-back" type="button" onClick={onBack}>
          <i className="fas fa-arrow-left"></i>
          Back to chapter
        </button>
        <p className="class-page-eyebrow">{subjectName}</p>
        <h1>{title || 'Objective test'}</h1>
        <p className="objective-test-lead">
          Saare questions objective hain. Har question ke 4 options hain.
        </p>
        {error ? <p className="auth-error" role="alert">{error}</p> : null}
        {loading ? <p>Test load ho raha hai…</p> : null}
        {!loading && questions.length === 0 ? (
          <p>Is chapter ke liye abhi koi 4-option test nahi hai. Staff dashboard se questions upload karo.</p>
        ) : null}
        {result ? (
          <p className="objective-score">
            Score: {result.score} / {result.total}
          </p>
        ) : null}
        {questions.length > 0 ? (
          <form onSubmit={submit}>
            {questions.map((question, index) => {
              const review = resultFor(question.uuid);
              return (
                <fieldset key={question.uuid} className="objective-question">
                  <legend>
                    {index + 1}. {question.prompt}
                  </legend>
                  {question.options.map((option) => {
                    const checked = answers[question.uuid] === option.key;
                    const mark = review
                      ? option.key === review.correct
                        ? ' correct'
                        : checked
                          ? ' wrong'
                          : ''
                      : '';
                    return (
                      <label
                        key={option.key}
                        className={`objective-option${checked ? ' selected' : ''}${mark}`}
                      >
                        <input
                          type="radio"
                          name={question.uuid}
                          value={option.key}
                          checked={checked}
                          disabled={Boolean(result)}
                          onChange={() =>
                            setAnswers((current) => ({ ...current, [question.uuid]: option.key }))
                          }
                        />
                        <span className="objective-option-key">{option.key}</span>
                        {option.text}
                      </label>
                    );
                  })}
                  {review?.explanation ? (
                    <p className="objective-explain">{review.explanation}</p>
                  ) : null}
                </fieldset>
              );
            })}
            {result ? null : (
              <button className="signup-btn" type="submit" disabled={submitting}>
                {submitting ? 'Checking…' : 'Submit test'}
              </button>
            )}
          </form>
        ) : null}
      </div>
    </main>
  );
}
