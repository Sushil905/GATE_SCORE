import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ClipboardList, Expand, Flag, Moon, RefreshCw, Save, Send, Sun } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { gateBranches, gateBranchSubjects } from '../data/branchData.js';
import { generateMockQuestions } from '../data/mockQuestionBank.js';

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(rest).padStart(2, '0')}`;
}

export function MockTests({ test, answers, setAnswers, submitTest }) {
  const [selectedBranch, setSelectedBranch] = useState('Computer Science Engineering');
  const [selectedSubject, setSelectedSubject] = useState('Algorithms');
  const [activeIndex, setActiveIndex] = useState(0);
  const [marked, setMarked] = useState({});
  const [visited, setVisited] = useState({});
  const [darkMode, setDarkMode] = useState(false);
  const [questionSeed, setQuestionSeed] = useState(Date.now());
  const [remainingSeconds, setRemainingSeconds] = useState((test.duration_minutes || 30) * 60);
  const questions = useMemo(
    () => generateMockQuestions(selectedBranch, selectedSubject, questionSeed),
    [questionSeed, selectedBranch, selectedSubject]
  );
  const activeQuestion = questions[activeIndex] || {};
  const subjects = gateBranchSubjects[selectedBranch] || [];
  const answerValue = answers[activeQuestion.id] || '';
  const durationSeconds = (test.duration_minutes || 30) * 60;
  const generatedTotalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 1), 0);

  useEffect(() => {
    setRemainingSeconds((test.duration_minutes || 30) * 60);
  }, [test.duration_minutes]);

  useEffect(() => {
    setActiveIndex(0);
    setMarked({});
    setVisited({});
    setAnswers({});
    setRemainingSeconds((test.duration_minutes || 30) * 60);
  }, [questionSeed, selectedBranch, selectedSubject, setAnswers, test.duration_minutes]);

  useEffect(() => {
    if (!questions.length) return undefined;
    const timer = setInterval(() => {
      setRemainingSeconds((seconds) => {
        if (seconds <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return seconds - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions.length]);

  useEffect(() => {
    if (activeQuestion.id) setVisited((current) => ({ ...current, [activeQuestion.id]: true }));
  }, [activeQuestion.id]);

  const stats = useMemo(() => {
    const answered = questions.filter((question) => answers[question.id]).length;
    const review = questions.filter((question) => marked[question.id]).length;
    const notVisited = questions.filter((question) => !visited[question.id]).length;
    return { answered, review, notVisited, unanswered: questions.length - answered };
  }, [answers, marked, questions, visited]);

  function selectAnswer(option) {
    if (activeQuestion.question_type === 'msq') {
      const current = String(answerValue).split(',').filter(Boolean);
      const next = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option].sort();
      setAnswers({ ...answers, [activeQuestion.id]: next.join(',') });
      return;
    }
    setAnswers({ ...answers, [activeQuestion.id]: option });
  }

  function setNatAnswer(value) {
    setAnswers({ ...answers, [activeQuestion.id]: value });
  }

  function saveAndNext() {
    setActiveIndex((index) => Math.min(index + 1, questions.length - 1));
  }

  function handleSubmit() {
    const timeTakenMinutes = Math.max(1, Math.ceil((durationSeconds - remainingSeconds) / 60));
    submitTest({
      branch: selectedBranch,
      subject: selectedSubject,
      generatedQuestions: questions,
      timeTakenMinutes
    });
  }

  function refreshQuestions() {
    setQuestionSeed(Date.now());
  }

  function markForReview() {
    setMarked({ ...marked, [activeQuestion.id]: !marked[activeQuestion.id] });
    saveAndNext();
  }

  function goFullscreen() {
    document.documentElement.requestFullscreen?.();
  }

  return (
    <section className={`page mock-shell ${darkMode ? 'mock-dark' : ''}`}>
      <PageTitle icon={ClipboardList} title="GATE Mock Test Interface" text="Select branch and subject, then attempt questions in a real exam-style workspace." />
      <div className="mock-setup panel">
        <label>Branch<select value={selectedBranch} onChange={(event) => {
          setSelectedBranch(event.target.value);
          setSelectedSubject(gateBranchSubjects[event.target.value]?.[0] || '');
          setQuestionSeed(Date.now());
        }}>
          {gateBranches.map((branch) => <option value={branch.name} key={branch.code}>{branch.name} ({branch.code})</option>)}
        </select></label>
        <label>Subject / Topic<select value={selectedSubject} onChange={(event) => {
          setSelectedSubject(event.target.value);
          setQuestionSeed(Date.now());
        }}>
          {subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
        </select></label>
        <div className="mock-ai-chip"><CheckCircle2 size={16} /> AI loaded {questions.length} questions</div>
      </div>

      <div className="gate-pattern-strip">
        <div><small>Current Questions</small><strong>{questions.length}</strong></div>
        <div><small>Current Marks</small><strong>{generatedTotalMarks}</strong></div>
        <div><small>Duration</small><strong>3 Hours</strong></div>
        <div><small>GA Section</small><strong>10Q · 15M</strong></div>
        <div><small>Core + Math</small><strong>55Q · 85M</strong></div>
      </div>

      <div className="mock-topbar">
        <strong>{selectedSubject} Adaptive Mock</strong>
        <span className={remainingSeconds < 300 ? 'timer danger' : 'timer'}>{formatTime(remainingSeconds)}</span>
        <button className="secondary" onClick={refreshQuestions}><RefreshCw size={16} /> New AI Questions</button>
        <button className="secondary" onClick={goFullscreen}><Expand size={16} /> Fullscreen</button>
        <button className="secondary" onClick={() => setDarkMode(!darkMode)}>{darkMode ? <Sun size={16} /> : <Moon size={16} />} Mode</button>
      </div>

      <div className="mock-layout">
        <div className="panel mock-question-card">
          <div className="question-meta">
            <span>Question {activeIndex + 1} of {questions.length}</span>
            <small>{activeQuestion.question_type?.toUpperCase() || 'MCQ'} · {activeQuestion.marks} mark · {activeQuestion.subject} · {activeQuestion.topic}</small>
          </div>
          <h2>{activeQuestion.question_text}</h2>
          {activeQuestion.question_type === 'nat' ? (
            <label className="nat-answer">
              Numerical Answer
              <input value={answerValue} onChange={(event) => setNatAnswer(event.target.value)} placeholder="Enter numeric answer" />
            </label>
          ) : (
            <div className="mock-options">
              {['A', 'B', 'C', 'D'].map((option) => (
                <button
                  className={String(answerValue).split(',').includes(option) ? 'selected-option' : ''}
                  key={option}
                  onClick={() => selectAnswer(option)}
                >
                  <b>{option}</b>
                  <span>{activeQuestion[`option_${option.toLowerCase()}`]}</span>
                </button>
              ))}
            </div>
          )}
          <div className="mock-actions">
            <button className="secondary" disabled={activeIndex === 0} onClick={() => setActiveIndex(activeIndex - 1)}>Previous</button>
            <button className="secondary" onClick={markForReview}><Flag size={16} /> Mark for Review</button>
            <button className="primary" onClick={saveAndNext}><Save size={16} /> Save & Next</button>
            <button className="primary" onClick={handleSubmit}><Send size={16} /> Submit Test</button>
          </div>
        </div>

        <aside className="panel palette-panel">
          <h2>Question Palette</h2>
          <div className="marking-box">
            <strong>Marking Scheme</strong>
            <span>1 mark MCQ: +1 / -0.33</span>
            <span>2 mark MCQ: +2 / -0.66</span>
            <span>No negative for NAT/MSQ</span>
          </div>
          <div className="palette-stats">
            <span><b>{stats.answered}</b> Answered</span>
            <span><b>{stats.unanswered}</b> Unanswered</span>
            <span><b>{stats.review}</b> Review</span>
            <span><b>{stats.notVisited}</b> Not Visited</span>
          </div>
          <div className="question-palette">
            {questions.map((question, index) => {
              const status = answers[question.id] ? 'answered' : marked[question.id] ? 'review' : visited[question.id] ? 'visited' : 'fresh';
              return (
                <button className={`${status} ${index === activeIndex ? 'current' : ''}`} key={question.id} onClick={() => setActiveIndex(index)}>
                  {index + 1}
                </button>
              );
            })}
          </div>
        </aside>
      </div>
    </section>
  );
}
