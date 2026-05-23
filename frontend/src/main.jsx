import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  BarChart3,
  BookOpen,
  Bot,
  Brain,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  FileUp,
  Flame,
  GraduationCap,
  Home,
  LayoutDashboard,
  LineChart,
  LogIn,
  LogOut,
  MessageSquare,
  PieChart,
  PlayCircle,
  Search,
  Send,
  Shield,
  Sparkles,
  Target,
  Trophy,
  UserPlus
} from 'lucide-react';
import {
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import { PageTitle } from './components/PageTitle.jsx';
import { Stat } from './components/Stat.jsx';
import { sampleResources, sampleTest } from './data/sampleData.js';
import { api, authHeaders } from './services/api.js';
import './styles.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

const pages = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'login', label: 'Login', icon: LogIn, guest: true },
  { id: 'register', label: 'Register', icon: UserPlus, guest: true },
  { id: 'student-dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
  { id: 'resources', label: 'Resources', icon: BookOpen },
  { id: 'mock-test', label: 'Mock Test', icon: ClipboardList },
  { id: 'ai-chatbot', label: 'AI Chatbot', icon: Bot },
  { id: 'study-plan', label: 'Study Plan', icon: Brain },
  { id: 'result-analysis', label: 'Result Analysis', icon: PieChart },
  { id: 'admin-dashboard', label: 'Admin Dashboard', icon: Shield, admin: true }
];

function App() {
  const [token, setToken] = useState(localStorage.getItem('gate_token') || '');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('gate_user') || 'null'));
  const [page, setPage] = useState('home');
  const [authForm, setAuthForm] = useState({ name: '', email: 'student@gatescore.dev', password: 'password123', targetExamDate: '2027-02-08' });
  const [resources, setResources] = useState(sampleResources);
  const [test, setTest] = useState(sampleTest);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [aiOutput, setAiOutput] = useState('Ask your GATE doubt and the AI mentor will explain it step by step.');
  const [planOutput, setPlanOutput] = useState('Generate a focused study plan based on your target date, weak areas, and daily hours.');
  const [aiForm, setAiForm] = useState({
    question: 'Explain paging vs segmentation with a GATE example.',
    branch: 'Computer Science',
    targetDate: '2027-02-08',
    dailyHours: 4,
    weakSubjects: 'Operating Systems, Engineering Mathematics',
    subject: 'Algorithms',
    topic: 'Graph traversal'
  });
  const [adminForm, setAdminForm] = useState({ subject: 'Algorithms', title: '', type: 'notes', difficulty: 'beginner', url: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    api('/resources').then(setResources).catch(() => setResources(sampleResources));
    api('/tests/1').then(setTest).catch(() => setTest(sampleTest));
  }, []);

  useEffect(() => {
    if (!token) return;
    api('/dashboard', { headers: authHeaders(token) }).then(setDashboard).catch(() => {});
    api('/predict-score', { headers: authHeaders(token) }).then(setPrediction).catch(() => {});
  }, [token, result]);

  const chartData = useMemo(() => {
    const trend = dashboard?.scoreTrend?.length
      ? dashboard.scoreTrend
      : [
          { test: 'Mock 1', score: 42, accuracy: 58 },
          { test: 'Mock 2', score: 51, accuracy: 66 },
          { test: 'Mock 3', score: 63, accuracy: 74 }
        ];
    return {
      labels: trend.map((item) => item.test),
      datasets: [
        {
          label: 'Score',
          data: trend.map((item) => item.score),
          borderColor: '#1f9d8a',
          backgroundColor: 'rgba(31, 157, 138, 0.18)',
          tension: 0.35
        }
      ]
    };
  }, [dashboard]);

  const weakData = useMemo(() => {
    const weak = dashboard?.weakSubjects && Object.keys(dashboard.weakSubjects).length ? dashboard.weakSubjects : { OS: 4, Math: 3, CN: 2 };
    return {
      labels: Object.keys(weak),
      datasets: [{ label: 'Mistakes', data: Object.values(weak), backgroundColor: ['#e85d4f', '#f3b43f', '#1f9d8a', '#5b7cfa'] }]
    };
  }, [dashboard]);

  async function submitAuth(event, mode) {
    event.preventDefault();
    setMessage('');
    try {
      const endpoint = mode === 'login' ? '/auth/login' : '/auth/register';
      const data = await api(endpoint, { method: 'POST', body: JSON.stringify(authForm) });
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('gate_token', data.token);
      localStorage.setItem('gate_user', JSON.stringify(data.user));
      setMessage(`Welcome, ${data.user.name}`);
      setPage(data.user.role === 'admin' ? 'admin-dashboard' : 'student-dashboard');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function submitTest() {
    if (!token) {
      setMessage('Login first to submit a mock test.');
      setPage('login');
      return;
    }
    try {
      const data = await api('/tests/submit', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ testId: test.id, answers })
      });
      setResult(data);
      setPage('result-analysis');
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function runDoubtSolver() {
    if (!token) {
      setMessage('Login first to use the AI chatbot.');
      setPage('login');
      return;
    }
    setAiOutput('Thinking...');
    try {
      const data = await api('/ai/chat', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify({ question: aiForm.question })
      });
      setAiOutput(data.answer);
    } catch (error) {
      setAiOutput(error.message);
    }
  }

  async function generateStudyPlan() {
    if (!token) {
      setMessage('Login first to generate a study plan.');
      setPage('login');
      return;
    }
    setPlanOutput('Creating your plan...');
    try {
      const data = await api('/ai/study-plan', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(aiForm)
      });
      setPlanOutput(data.plan);
    } catch (error) {
      setPlanOutput(error.message);
    }
  }

  async function uploadResource(event) {
    event.preventDefault();
    if (!token) return setMessage('Admin login required.');
    try {
      await api('/resources/add', {
        method: 'POST',
        headers: authHeaders(token),
        body: JSON.stringify(adminForm)
      });
      const rows = await api('/resources');
      setResources(rows);
      setAdminForm({ ...adminForm, title: '', url: '' });
      setMessage('Resource uploaded.');
    } catch (error) {
      setMessage(error.message);
    }
  }

  function logout() {
    setToken('');
    setUser(null);
    setPage('home');
    localStorage.removeItem('gate_token');
    localStorage.removeItem('gate_user');
  }

  const visiblePages = pages.filter((item) => {
    if (item.admin) return user?.role === 'admin';
    if (item.guest) return !user;
    return true;
  });

  return (
    <main>
      <aside className="sidebar">
        <button className="brand" onClick={() => setPage('home')}>
          <GraduationCap size={28} />
          <span>
            <strong>GATE_SCORE</strong>
            <small>Gen AI prep</small>
          </span>
        </button>
        <nav className="nav-list">
          {visiblePages.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} className={page === item.id ? 'active' : ''} onClick={() => setPage(item.id)}>
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>
        <div className="sidebar-user">
          {user ? (
            <>
              <span>{user.name}</span>
              <small>{user.role}</small>
              <button className="ghost" onClick={logout}><LogOut size={16} /> Logout</button>
            </>
          ) : (
            <>
              <span>Guest Mode</span>
              <small>Login to save progress</small>
            </>
          )}
        </div>
      </aside>

      <div className="app-content">
        {message && <div className="toast">{message}</div>}
        {page === 'home' && <HomePage setPage={setPage} prediction={prediction} />}
        {page === 'login' && <LoginPage authForm={authForm} setAuthForm={setAuthForm} submitAuth={submitAuth} setPage={setPage} />}
        {page === 'register' && <RegisterPage authForm={authForm} setAuthForm={setAuthForm} submitAuth={submitAuth} setPage={setPage} />}
        {page === 'student-dashboard' && (
          <StudentDashboard user={user} dashboard={dashboard} prediction={prediction} resources={resources} chartData={chartData} weakData={weakData} setPage={setPage} />
        )}
        {page === 'resources' && <ResourcesPage resources={resources} />}
        {page === 'mock-test' && <MockTestPage test={test} answers={answers} setAnswers={setAnswers} submitTest={submitTest} />}
        {page === 'ai-chatbot' && <AiChatbotPage aiForm={aiForm} setAiForm={setAiForm} aiOutput={aiOutput} runDoubtSolver={runDoubtSolver} />}
        {page === 'study-plan' && <StudyPlanPage aiForm={aiForm} setAiForm={setAiForm} planOutput={planOutput} generateStudyPlan={generateStudyPlan} />}
        {page === 'result-analysis' && <ResultAnalysisPage result={result} dashboard={dashboard} chartData={chartData} weakData={weakData} prediction={prediction} setPage={setPage} />}
        {page === 'admin-dashboard' && <AdminDashboard resources={resources} adminForm={adminForm} setAdminForm={setAdminForm} uploadResource={uploadResource} />}
      </div>
    </main>
  );
}

function HomePage({ setPage, prediction }) {
  return (
    <section className="hero page">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={16} /> AI powered GATE prep</span>
        <h1>Study smarter for GATE with a dashboard that keeps you moving.</h1>
        <p>Plan your day, solve doubts, attempt mini mocks, and see weak subjects before they become exam-day surprises.</p>
        <div className="button-row">
          <button className="primary" onClick={() => setPage('register')}><UserPlus size={18} /> Start preparing</button>
          <button className="secondary" onClick={() => setPage('mock-test')}><Target size={18} /> Try mini mock</button>
        </div>
        <div className="hero-pills">
          <span><CheckCircle2 size={16} /> Subject-wise practice</span>
          <span><Clock3 size={16} /> Daily study plan</span>
          <span><Flame size={16} /> Weak-area focus</span>
        </div>
      </div>
      <div className="hero-visual" aria-label="GATE preparation overview">
        <div className="rank-panel">
          <span>Predicted score</span>
          <strong>{prediction?.predictedScore || 67}/100</strong>
          <p>{prediction?.rankBand || 'Top 8,000'} · Confidence {prediction?.confidence || 'demo'}</p>
        </div>
        <div className="study-card">
          <div>
            <small>Today&apos;s focus</small>
            <strong>Operating Systems</strong>
          </div>
          <div className="progress-track"><span style={{ width: '72%' }} /></div>
          <ul>
            <li><CheckCircle2 size={16} /> Process scheduling notes</li>
            <li><PlayCircle size={16} /> 20 min concept revision</li>
            <li><ClipboardList size={16} /> 12 practice questions</li>
          </ul>
        </div>
      </div>
    </section>
  );
}

function LoginPage({ authForm, setAuthForm, submitAuth, setPage }) {
  return (
    <section className="auth-page">
      <PageTitle icon={LogIn} title="Welcome Back" text="Open your saved GATE prep dashboard and continue from today's targets." />
      <form className="panel form auth-card" onSubmit={(event) => submitAuth(event, 'login')}>
        <label>Email</label>
        <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
        <label>Password</label>
        <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
        <button className="primary" type="submit"><LogIn size={18} /> Login</button>
        <button className="link-button" type="button" onClick={() => setPage('register')}>Create a new account</button>
      </form>
    </section>
  );
}

function RegisterPage({ authForm, setAuthForm, submitAuth, setPage }) {
  return (
    <section className="auth-page">
      <PageTitle icon={UserPlus} title="Create Student Profile" text="Set your target exam date and build a preparation workspace around it." />
      <form className="panel form auth-card" onSubmit={(event) => submitAuth(event, 'register')}>
        <label>Name</label>
        <input placeholder="Name" value={authForm.name} onChange={(event) => setAuthForm({ ...authForm, name: event.target.value })} />
        <label>Email</label>
        <input placeholder="Email" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} />
        <label>Password</label>
        <input placeholder="Password" type="password" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} />
        <label>Target GATE date</label>
        <input type="date" value={authForm.targetExamDate} onChange={(event) => setAuthForm({ ...authForm, targetExamDate: event.target.value })} />
        <button className="primary" type="submit"><UserPlus size={18} /> Register</button>
        <button className="link-button" type="button" onClick={() => setPage('login')}>Already have an account?</button>
      </form>
    </section>
  );
}

function StudentDashboard({ user, dashboard, prediction, resources, chartData, weakData, setPage }) {
  return (
    <section className="page">
      <PageTitle icon={LayoutDashboard} title="Student Dashboard" text={`Welcome ${user?.name || 'student'}, your GATE readiness snapshot is ready.`} />
      <div className="stats-grid">
        <Stat icon={BookOpen} label="Resources" value={resources.length} />
        <Stat icon={BarChart3} label="Attempts" value={dashboard?.attempts || 0} />
        <Stat icon={Trophy} label="Accuracy" value={`${dashboard?.averageAccuracy || 66}%`} />
        <Stat icon={CalendarDays} label="Predicted" value={`${prediction?.predictedScore || 67}/100`} />
      </div>
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <h2>Score Trend</h2>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="panel chart-panel">
          <h2>Weak Subjects</h2>
          <Bar data={weakData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="panel action-panel">
          <h2>Next Actions</h2>
          <button className="action-card" onClick={() => setPage('mock-test')}><ClipboardList size={20} /><span>Attempt mock test</span><small>Build speed and accuracy</small></button>
          <button className="action-card" onClick={() => setPage('study-plan')}><Brain size={20} /><span>Generate study plan</span><small>Turn weak areas into a routine</small></button>
          <button className="action-card" onClick={() => setPage('ai-chatbot')}><MessageSquare size={20} /><span>Ask AI doubt</span><small>Get step-by-step explanations</small></button>
        </div>
      </div>
    </section>
  );
}

function ResourcesPage({ resources }) {
  return (
    <section className="page">
      <PageTitle icon={BookOpen} title="Study Resources" text="Subject-wise notes, videos, articles, and practice links for fast revision." />
      <div className="resource-toolbar">
        <div><Search size={18} /> Search by subject, topic, or type</div>
        <span>{resources.length} curated resources</span>
      </div>
      <div className="resource-grid">
        {resources.map((resource) => (
          <a className="resource-card" href={resource.url} target="_blank" rel="noreferrer" key={resource.id}>
            <span>{resource.subject}</span>
            <strong>{resource.title}</strong>
            <small>{resource.type} · {resource.difficulty}</small>
          </a>
        ))}
      </div>
    </section>
  );
}

function MockTestPage({ test, answers, setAnswers, submitTest }) {
  return (
    <section className="page">
      <PageTitle icon={ClipboardList} title="Mini Mock Test" text={`${test.title} · ${test.duration_minutes} minutes · answer and submit for analysis`} />
      <div className="panel test-panel">
        <div className="question-list">
          {test.questions.map((question, index) => (
            <div className="question" key={question.id}>
              <span>Question {index + 1} · {question.subject} · {question.topic}</span>
              <strong>{question.question_text}</strong>
              {['a', 'b', 'c', 'd'].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name={`q-${question.id}`}
                    checked={answers[question.id] === option.toUpperCase()}
                    onChange={() => setAnswers({ ...answers, [question.id]: option.toUpperCase() })}
                  />
                  {question[`option_${option}`]}
                </label>
              ))}
            </div>
          ))}
        </div>
        <button className="primary" onClick={submitTest}><Send size={18} /> Submit Test</button>
      </div>
    </section>
  );
}

function AiChatbotPage({ aiForm, setAiForm, aiOutput, runDoubtSolver }) {
  return (
    <section className="page split">
      <div className="panel form">
        <PageTitle icon={Bot} title="AI Doubt Solver" text="Ask a GATE doubt and get an exam-focused explanation." />
        <label>Your doubt</label>
        <textarea value={aiForm.question} onChange={(event) => setAiForm({ ...aiForm, question: event.target.value })} />
        <button className="primary" onClick={runDoubtSolver}><Sparkles size={18} /> Ask AI</button>
      </div>
      <pre className="ai-output">{aiOutput}</pre>
    </section>
  );
}

function StudyPlanPage({ aiForm, setAiForm, planOutput, generateStudyPlan }) {
  return (
    <section className="page split">
      <div className="panel form">
        <PageTitle icon={Brain} title="Study Plan" text="Generate a plan from your branch, target date, daily hours, and weak subjects." />
        <div className="grid-two">
          <label>Branch<input value={aiForm.branch} onChange={(event) => setAiForm({ ...aiForm, branch: event.target.value })} /></label>
          <label>Target date<input type="date" value={aiForm.targetDate} onChange={(event) => setAiForm({ ...aiForm, targetDate: event.target.value })} /></label>
          <label>Daily hours<input type="number" value={aiForm.dailyHours} onChange={(event) => setAiForm({ ...aiForm, dailyHours: event.target.value })} /></label>
          <label>Subject<input value={aiForm.subject} onChange={(event) => setAiForm({ ...aiForm, subject: event.target.value })} /></label>
        </div>
        <label>Weak subjects<input value={aiForm.weakSubjects} onChange={(event) => setAiForm({ ...aiForm, weakSubjects: event.target.value })} /></label>
        <button className="primary" onClick={generateStudyPlan}><CalendarDays size={18} /> Generate Plan</button>
      </div>
      <pre className="ai-output">{planOutput}</pre>
    </section>
  );
}

function ResultAnalysisPage({ result, dashboard, chartData, weakData, prediction, setPage }) {
  return (
    <section className="page">
      <PageTitle icon={PieChart} title="Result Analysis" text="Review your score, weak subjects, AI explanations, and score prediction." />
      <div className="stats-grid">
        <Stat icon={Trophy} label="Last Score" value={result ? `${result.score}/${result.totalMarks}` : 'No test'} />
        <Stat icon={Target} label="Accuracy" value={result ? `${result.accuracy}%` : `${dashboard?.averageAccuracy || 66}%`} />
        <Stat icon={LineChart} label="Prediction" value={`${prediction?.predictedScore || 67}/100`} />
        <Stat icon={Shield} label="Rank Band" value={prediction?.rankBand || 'Top 8,000'} />
      </div>
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <h2>Score Trend</h2>
          <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
        <div className="panel chart-panel">
          <h2>Mistake Distribution</h2>
          <Bar data={weakData} options={{ responsive: true, maintainAspectRatio: false }} />
        </div>
      </div>
      <div className="panel result-block">
        {result ? (
          result.review.map((item) => (
            <p key={item.questionId}><CheckCircle2 size={16} /> {item.isCorrect ? 'Correct' : 'Review'} Q{item.questionId}: {item.explanation}</p>
          ))
        ) : (
          <>
            <p>No submitted result yet. Attempt a mock test to unlock detailed analysis.</p>
            <button className="primary" onClick={() => setPage('mock-test')}><ClipboardList size={18} /> Go to Mock Test</button>
          </>
        )}
      </div>
    </section>
  );
}

function AdminDashboard({ resources, adminForm, setAdminForm, uploadResource }) {
  return (
    <section className="page">
      <PageTitle icon={Shield} title="Admin Dashboard" text="Upload resources and manage student preparation content." />
      <div className="stats-grid">
        <Stat icon={BookOpen} label="Resources" value={resources.length} />
        <Stat icon={ClipboardList} label="Tests" value="1" />
        <Stat icon={Bot} label="AI Tools" value="5" />
        <Stat icon={Trophy} label="Status" value="Live" />
      </div>
      <div className="split">
        <form className="panel form" onSubmit={uploadResource}>
          <h2>Upload Resource</h2>
          <div className="grid-two">
            <label>Subject<input placeholder="Subject" value={adminForm.subject} onChange={(event) => setAdminForm({ ...adminForm, subject: event.target.value })} /></label>
            <label>Title<input placeholder="Title" value={adminForm.title} onChange={(event) => setAdminForm({ ...adminForm, title: event.target.value })} /></label>
            <label>Type<select value={adminForm.type} onChange={(event) => setAdminForm({ ...adminForm, type: event.target.value })}>
              <option>notes</option>
              <option>pdf</option>
              <option>video</option>
              <option>article</option>
            </select></label>
            <label>Difficulty<select value={adminForm.difficulty} onChange={(event) => setAdminForm({ ...adminForm, difficulty: event.target.value })}>
              <option>beginner</option>
              <option>intermediate</option>
              <option>advanced</option>
            </select></label>
          </div>
          <label>URL<input placeholder="URL" value={adminForm.url} onChange={(event) => setAdminForm({ ...adminForm, url: event.target.value })} /></label>
          <button className="primary" type="submit"><FileUp size={18} /> Upload Resource</button>
        </form>
        <div className="panel table-panel">
          <h2>Recent Resources</h2>
          {resources.slice(0, 6).map((resource) => (
            <div className="table-row" key={resource.id}>
              <span>{resource.subject}</span>
              <strong>{resource.title}</strong>
              <small>{resource.type}</small>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

createRoot(document.getElementById('root')).render(<App />);
