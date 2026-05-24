import { useEffect, useMemo, useState } from 'react';
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
import { AuthProvider } from './context/AuthContext.jsx';
import { sampleResources, sampleTest } from './data/sampleData.js';
import { DashboardLayout } from './layouts/DashboardLayout.jsx';
import { AIChat } from './pages/AIChat.jsx';
import { AdminDashboard } from './pages/AdminDashboard.jsx';
import { Courses } from './pages/Courses.jsx';
import { Dashboard } from './pages/Dashboard.jsx';
import { Home } from './pages/Home.jsx';
import { Login } from './pages/Login.jsx';
import { MockTests } from './pages/MockTests.jsx';
import { Profile } from './pages/Profile.jsx';
import { Register } from './pages/Register.jsx';
import { Resources } from './pages/Resources.jsx';
import { Results } from './pages/Results.jsx';
import { StudyPlan } from './pages/StudyPlan.jsx';
import { authHeaders, api } from './services/api.js';
import { askDoubt, createPracticeQuestions, createStudyPlan, getAiResourceRecommendations } from './services/aiService.js';
import { loginUser, registerUser } from './services/authService.js';
import { addResource, getResources } from './services/resourceService.js';
import { getTest, submitGeneratedMockTest, submitMockTest } from './services/testService.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend);

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('gate_user') || 'null');
  } catch {
    localStorage.removeItem('gate_user');
    localStorage.removeItem('gate_token');
    return null;
  }
}

function normalizeAnswer(answer) {
  return String(answer || '').trim().toUpperCase();
}

function evaluateGeneratedMock(questions, answers, meta = {}) {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  const weakSubjects = {};
  const strongSubjects = {};

  const review = questions.map((question) => {
    const selected = normalizeAnswer(answers[question.id]);
    const correctOption = normalizeAnswer(question.correct_answer);
    const isAttempted = Boolean(selected);
    const isCorrect = isAttempted && selected === correctOption;
    let marksObtained = 0;

    if (isCorrect) {
      marksObtained = Number(question.marks || 1);
      score += marksObtained;
      correctCount += 1;
      strongSubjects[question.subject] = (strongSubjects[question.subject] || 0) + 1;
    } else if (isAttempted) {
      marksObtained = question.question_type === 'mcq' ? -Number(question.negative_marks || 0) : 0;
      score += marksObtained;
      wrongCount += 1;
      weakSubjects[question.subject] = (weakSubjects[question.subject] || 0) + 1;
    } else {
      unattemptedCount += 1;
      weakSubjects[question.subject] = (weakSubjects[question.subject] || 0) + 1;
    }

    return {
      questionId: question.id,
      selected,
      correctOption,
      isCorrect,
      marksObtained,
      explanation: question.explanation,
      subject: question.subject
    };
  });

  const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks || 1), 0);
  const accuracy = questions.length ? Number(((correctCount / questions.length) * 100).toFixed(2)) : 0;
  const percentage = totalMarks ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
  const weakSubjectRanking = Object.entries(weakSubjects)
    .sort((a, b) => b[1] - a[1])
    .map(([subject, mistakes]) => ({ subject, mistakes }));
  const strongSubjectRanking = Object.entries(strongSubjects)
    .sort((a, b) => b[1] - a[1])
    .map(([subject, correct]) => ({ subject, correct }));

  return {
    score: Number(score.toFixed(2)),
    totalMarks,
    accuracy,
    rankEstimate: percentage >= 85 ? 'Top 1,000' : percentage >= 70 ? 'Top 5,000' : percentage >= 50 ? 'Top 15,000' : 'Needs revision',
    timeAnalysis: {
      timeTakenMinutes: Number(meta.timeTakenMinutes || 0),
      idealMinutes: questions.length * 2,
      pace: Number(meta.timeTakenMinutes || 0) > questions.length * 2 ? 'slow' : 'good'
    },
    strongSubjects: strongSubjectRanking,
    weakSubjects,
    weakSubjectRanking,
    aiAnalysis: {
      summary: weakSubjectRanking.length
        ? `AI detected weak areas in ${weakSubjectRanking.map((item) => item.subject).join(', ')}. Revise concepts, then generate a new adaptive mock.`
        : 'Excellent attempt. Generate a harder adaptive mock next.',
      recommendations: weakSubjectRanking.length
        ? weakSubjectRanking.map((item) => `Revise ${item.subject}, solve 10 PYQs, then retry a fresh AI mock.`)
        : ['Try a harder mock.', 'Practice bookmarked questions.', 'Revise formula notes.']
    },
    review
  };
}

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('gate_token') || '');
  const [user, setUser] = useState(getStoredUser);
  const [page, setPage] = useState('home');
  const [authForm, setAuthForm] = useState({
    name: '',
    email: 'student@gatescore.dev',
    password: 'password123',
    branch: 'Computer Science Engineering',
    targetExamDate: '2027-02-08'
  });
  const [resources, setResources] = useState(sampleResources);
  const [test, setTest] = useState(sampleTest);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [prediction, setPrediction] = useState(null);
  const [aiOutput, setAiOutput] = useState('Ask your GATE doubt and the AI mentor will explain it step by step.');
  const [planOutput, setPlanOutput] = useState('Generate a focused study plan based on your target date, weak areas, and daily hours.');
  const [questionOutput, setQuestionOutput] = useState('Generate topic-wise GATE practice questions with answers when you are ready.');
  const [resourceOutput, setResourceOutput] = useState('Get free resource recommendations for your weak subjects.');
  const [aiForm, setAiForm] = useState({
    question: 'Explain paging vs segmentation with a GATE example.',
    branch: 'Computer Science Engineering',
    targetDate: '2027-02-08',
    dailyHours: 4,
    weakSubjects: 'Operating Systems, Engineering Mathematics',
    subject: 'Algorithms',
    topic: 'Graph traversal',
    aiMode: 'Explain Concept',
    difficulty: 'medium',
    questionType: 'mcq',
    questionCount: 5
  });
  const [adminForm, setAdminForm] = useState({ subject: 'Algorithms', title: '', type: 'notes', difficulty: 'beginner', url: '' });
  const [message, setMessage] = useState('');

  useEffect(() => {
    getResources().then(setResources).catch(() => setResources(sampleResources));
    getTest(1).then(setTest).catch(() => setTest(sampleTest));
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
      const data = mode === 'login' ? await loginUser(authForm) : await registerUser(authForm);
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

  async function submitTest(meta = {}) {
    if (meta.generatedQuestions?.length) {
      if (!token) {
        setMessage('Login first so your test attempt is stored in MySQL and dashboard analytics update.');
        setPage('login');
        return;
      }

      try {
        const data = await submitGeneratedMockTest(token, {
          branch: meta.branch,
          subject: meta.subject,
          questions: meta.generatedQuestions,
          answers,
          timeTakenMinutes: meta.timeTakenMinutes
        });
        setResult(data);
        setPage('result-analysis');
      } catch (error) {
        const data = evaluateGeneratedMock(meta.generatedQuestions, answers, meta);
        setResult(data);
        setPage('result-analysis');
        setMessage(`Stored analytics failed, showing local analysis: ${error.message}`);
      }
      return;
    }

    if (!token) {
      setMessage('Login first to submit a mock test.');
      setPage('login');
      return;
    }
    try {
      const data = await submitMockTest(token, test.id, answers, meta);
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
      const data = await askDoubt(token, aiForm);
      setAiOutput(data.answer);
      return data.answer;
    } catch (error) {
      setAiOutput(error.message);
      throw error;
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
      const data = await createStudyPlan(token, aiForm);
      setPlanOutput(data.plan);
    } catch (error) {
      setPlanOutput(error.message);
    }
  }

  async function generatePracticeQuestions() {
    if (!token) {
      setMessage('Login first to generate practice questions.');
      setPage('login');
      return;
    }
    setQuestionOutput('Generating practice questions...');
    try {
      const data = await createPracticeQuestions(token, {
        branch: aiForm.branch,
        subject: aiForm.subject,
        topic: aiForm.topic,
        difficulty: aiForm.difficulty,
        questionType: aiForm.questionType,
        count: aiForm.questionCount
      });
      const output = data.text || data.questions;
      setQuestionOutput(output);
      return data;
    } catch (error) {
      setQuestionOutput(error.message);
      throw error;
    }
  }

  async function recommendResources() {
    if (!token) {
      setMessage('Login first to get AI recommendations.');
      setPage('login');
      return;
    }
    setResourceOutput('Finding focused resources...');
    try {
      const data = await getAiResourceRecommendations(token, aiForm.weakSubjects);
      setResourceOutput(data.recommendations);
    } catch (error) {
      setResourceOutput(error.message);
    }
  }

  async function uploadResource(event) {
    event.preventDefault();
    if (!token) return setMessage('Admin login required.');
    try {
      await addResource(token, adminForm);
      const rows = await getResources();
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

  const screen = {
    home: <Home setPage={setPage} prediction={prediction} />,
    login: <Login authForm={authForm} setAuthForm={setAuthForm} submitAuth={submitAuth} setPage={setPage} />,
    register: <Register authForm={authForm} setAuthForm={setAuthForm} submitAuth={submitAuth} setPage={setPage} />,
    'student-dashboard': <Dashboard user={user} dashboard={dashboard} prediction={prediction} resources={resources} chartData={chartData} weakData={weakData} setPage={setPage} />,
    courses: <Courses />,
    resources: <Resources resources={resources} />,
    'mock-test': <MockTests test={test} answers={answers} setAnswers={setAnswers} submitTest={submitTest} />,
    'ai-chatbot': <AIChat aiForm={aiForm} setAiForm={setAiForm} aiOutput={aiOutput} questionOutput={questionOutput} runDoubtSolver={runDoubtSolver} generatePracticeQuestions={generatePracticeQuestions} />,
    'study-plan': <StudyPlan aiForm={aiForm} setAiForm={setAiForm} planOutput={planOutput} resourceOutput={resourceOutput} generateStudyPlan={generateStudyPlan} recommendResources={recommendResources} />,
    'result-analysis': <Results result={result} dashboard={dashboard} chartData={chartData} weakData={weakData} prediction={prediction} setPage={setPage} />,
    profile: <Profile user={user} dashboard={dashboard} prediction={prediction} chartData={chartData} weakData={weakData} resources={resources} setPage={setPage} />,
    'admin-dashboard': <AdminDashboard resources={resources} adminForm={adminForm} setAdminForm={setAdminForm} uploadResource={uploadResource} />
  }[page];

  return (
    <AuthProvider value={{ token, user, setPage, logout }}>
      <DashboardLayout page={page} setPage={setPage} user={user} logout={logout} message={message}>
        {screen || <Home setPage={setPage} prediction={prediction} />}
      </DashboardLayout>
    </AuthProvider>
  );
}
