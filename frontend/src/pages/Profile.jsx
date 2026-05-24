import { Bar, Line } from 'react-chartjs-2';
import { useState } from 'react';
import {
  Award,
  Bookmark,
  Bot,
  Brain,
  CalendarDays,
  Camera,
  CheckCircle2,
  Clock3,
  Edit3,
  Flame,
  GraduationCap,
  Medal,
  MessageSquareText,
  Palette,
  Star,
  Target,
  Trophy,
  UserPlus,
  Zap
} from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';

const activityDays = Array.from({ length: 49 }, (_, index) => ({
  day: index + 1,
  level: [0, 1, 2, 3, 4][(index * 7 + 3) % 5]
}));

const badges = [
  { icon: Flame, title: '14 Day Streak', text: 'Consistent daily prep' },
  { icon: Medal, title: '250 Questions', text: 'Solved milestone' },
  { icon: Trophy, title: 'Top Accuracy', text: 'Above 75% in mocks' },
  { icon: Star, title: 'AI Power User', text: 'Used mentor sessions' }
];

export function Profile({ user, dashboard, prediction, chartData, weakData, resources, setPage }) {
  const [theme, setTheme] = useState('teal');
  const [darkAnalytics, setDarkAnalytics] = useState(false);
  const [compactCards, setCompactCards] = useState(false);
  const weakSubject = dashboard?.weakSubjectRanking?.[0]?.subject || 'Operating Systems';
  const strongSubject = dashboard?.scoreTrend?.length ? 'Algorithms' : 'DBMS';
  const attempts = dashboard?.attempts || 0;
  const accuracy = dashboard?.averageAccuracy || 66;
  const predictedScore = prediction?.predictedScore || 67;
  const expectedAir = predictedScore >= 75 ? '1,200 - 2,000' : predictedScore >= 60 ? '4,000 - 8,000' : '10,000+';
  const subjectAccuracy = {
    labels: ['Math', 'DSA', 'OS', 'DBMS', 'CN'],
    datasets: [{
      label: 'Accuracy',
      data: [72, 81, 58, 76, 68],
      backgroundColor: ['#1f9d8a', '#1e81b0', '#e85d4f', '#f3b43f', '#5b7cfa']
    }]
  };
  const studyTimeData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [{
      label: 'Study Hours',
      data: [2.5, 3, 2, 4, 3.5, 5, 4],
      borderColor: '#f3b43f',
      backgroundColor: 'rgba(243, 180, 63, 0.18)',
      tension: 0.35
    }]
  };

  return (
    <section className={`page profile-dashboard theme-${theme} ${darkAnalytics ? 'profile-dark' : ''} ${compactCards ? 'profile-compact' : ''}`}>
      <PageTitle icon={UserPlus} title="AI Student Profile" text="Your personalized GATE performance, preparation health, and AI mentor insights." />

      <div className="profile-hero panel">
        <div className="profile-identity">
          <div className="profile-avatar">
            <span>{(user?.name || 'G').slice(0, 1).toUpperCase()}</span>
            <button title="Update profile image" onClick={() => setPage?.('profile')}><Camera size={16} /></button>
          </div>
          <div>
            <h2>{user?.name || 'Guest Student'}</h2>
            <p>{user?.email || 'Login to sync your performance dashboard'}</p>
            <div className="profile-tags">
              <button onClick={() => setPage?.('courses')}><GraduationCap size={15} /> {user?.branch || 'Computer Science Engineering'}</button>
              <button onClick={() => setPage?.('study-plan')}><CalendarDays size={15} /> GATE {user?.target_year || 2027}</button>
              <button onClick={() => setPage?.('student-dashboard')}><Flame size={15} /> 14 day streak</button>
            </div>
          </div>
        </div>
        <div className="profile-rank-grid">
          <button onClick={() => setPage?.('result-analysis')}><small>Predicted GATE Score</small><strong>{predictedScore}/100</strong></button>
          <button onClick={() => setPage?.('result-analysis')}><small>Expected AIR</small><strong>{expectedAir}</strong></button>
          <button onClick={() => setPage?.('student-dashboard')}><small>Percentile</small><strong>92.4%</strong></button>
        </div>
        <button className="primary profile-edit-btn" onClick={() => setPage?.('register')}><Edit3 size={16} /> Edit Profile</button>
      </div>

      <div className="profile-overview-grid">
        <button className="profile-metric-card" onClick={() => setPage?.('mock-test')}><ClipboardIcon /><span>Tests Attempted</span><strong>{attempts}</strong></button>
        <button className="profile-metric-card" onClick={() => setPage?.('result-analysis')}><Target size={20} /><span>Average Score</span><strong>{predictedScore - 8}/100</strong></button>
        <button className="profile-metric-card" onClick={() => setPage?.('result-analysis')}><Zap size={20} /><span>Accuracy</span><strong>{accuracy}%</strong></button>
        <button className="profile-metric-card" onClick={() => setPage?.('courses')}><Trophy size={20} /><span>Strongest</span><strong>{strongSubject}</strong></button>
        <button className="profile-metric-card" onClick={() => setPage?.('study-plan')}><Brain size={20} /><span>Weakest</span><strong>{weakSubject}</strong></button>
      </div>

      <div className="profile-main-grid">
        <div className="panel profile-ai-card">
          <h2><Bot size={20} /> AI Mentor Insights</h2>
          <div className="insight-list">
            <p><CheckCircle2 size={16} /> Weak topic detected: revise {weakSubject} before your next full mock.</p>
            <p><CheckCircle2 size={16} /> Recommended test: 30-minute adaptive mock on DBMS + OS mixed concepts.</p>
            <p><CheckCircle2 size={16} /> Best study window: 7:00 PM - 10:00 PM based on recent activity.</p>
            <p><CheckCircle2 size={16} /> Improvement tip: spend 20 minutes on error-log revision after every test.</p>
          </div>
          <button className="secondary" onClick={() => setPage?.('ai-chatbot')}>Open AI Mentor</button>
        </div>

        <div className="panel profile-info-card">
          <h2>Exam Information</h2>
          <div className="profile-info-grid">
            <button onClick={() => setPage?.('courses')}>Branch <b>{user?.branch || 'Computer Science Engineering'}</b></button>
            <button onClick={() => setPage?.('study-plan')}>Target Year <b>{user?.target_year || 2027}</b></button>
            <button onClick={() => setPage?.('register')}>College <b>Not added</b></button>
            <button onClick={() => setPage?.('study-plan')}>Daily Hours <b>4 hrs</b></button>
            <button onClick={() => setPage?.('study-plan')}>Target Score <b>75+</b></button>
            <button onClick={() => setPage?.('mock-test')}>Level <b>Intermediate</b></button>
          </div>
        </div>

        <div className="panel chart-panel">
          <h2>Weekly Score Trend</h2>
          <div className="chart-canvas profile-chart">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="panel chart-panel">
          <h2>Subject-wise Accuracy</h2>
          <div className="chart-canvas profile-chart">
            <Bar data={subjectAccuracy} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="panel chart-panel">
          <h2>Study-time Tracking</h2>
          <div className="chart-canvas profile-chart">
            <Line data={studyTimeData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="panel chart-panel">
          <h2>Weak Subject Distribution</h2>
          <div className="chart-canvas profile-chart">
            <Bar data={weakData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>

      <div className="profile-section-grid">
        <div className="panel">
          <h2>Consistency Heatmap</h2>
          <div className="heatmap-grid">
            {activityDays.map((item) => <button className={`heat-${item.level}`} key={item.day} title={`Day ${item.day}`} onClick={() => setPage?.('student-dashboard')} />)}
          </div>
        </div>
        <div className="panel">
          <h2>Rank Comparison</h2>
          <div className="comparison-list">
            <button onClick={() => setPage?.('result-analysis')}>Your percentile <b>92.4%</b></button>
            <button onClick={() => setPage?.('student-dashboard')}>Above peers <b>78%</b></button>
            <button onClick={() => setPage?.('result-analysis')}>National rank band <b>{expectedAir}</b></button>
            <button onClick={() => setPage?.('mock-test')}>Accuracy gap to topper <b>+9%</b></button>
          </div>
        </div>
        <div className="panel theme-card">
          <h2><Palette size={18} /> Theme Personalization</h2>
          <div className="theme-swatches">
            <button className="teal" title="Teal" onClick={() => setTheme('teal')} />
            <button className="blue" title="Blue" onClick={() => setTheme('blue')} />
            <button className="amber" title="Amber" onClick={() => setTheme('amber')} />
            <button className="dark" title="Dark" onClick={() => setTheme('dark')} />
          </div>
          <label><input type="checkbox" checked={darkAnalytics} onChange={(event) => setDarkAnalytics(event.target.checked)} /> Dark analytics mode</label>
          <label><input type="checkbox" checked={compactCards} onChange={(event) => setCompactCards(event.target.checked)} /> Compact dashboard cards</label>
        </div>
      </div>

      <div className="profile-section-grid">
        <div className="panel">
          <h2>Study Activity Timeline</h2>
          <div className="timeline-list">
            {(dashboard?.recentActivity?.length ? dashboard.recentActivity : [
              { activity_type: 'mock', activity_description: 'Completed AI Adaptive DBMS Mock' },
              { activity_type: 'plan', activity_description: 'Generated personalized study plan' },
              { activity_type: 'questions', activity_description: 'Solved 25 practice questions' }
            ]).map((item, index) => (
              <button className="timeline-item" key={`${item.activity_type}-${index}`} onClick={() => setPage?.('student-dashboard')}>
                <span />
                <div><strong>{item.activity_type.replaceAll('_', ' ')}</strong><p>{item.activity_description}</p></div>
              </button>
            ))}
          </div>
        </div>
        <div className="panel">
          <h2>Achievements</h2>
          <div className="badge-grid">
            {badges.map(({ icon: Icon, title, text }) => (
              <button className="badge-card" key={title} onClick={() => setPage?.('student-dashboard')}>
                <Icon size={20} />
                <strong>{title}</strong>
                <span>{text}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="profile-section-grid">
        <div className="panel saved-card">
          <h2><MessageSquareText size={18} /> Recent AI Sessions</h2>
          <button onClick={() => setPage?.('ai-chatbot')}>DBMS Normalization doubt solved with AI mentor.</button>
          <button onClick={() => setPage?.('ai-chatbot')}>Generated OS scheduling revision notes.</button>
          <button onClick={() => setPage?.('mock-test')}>Created adaptive practice for Algorithms.</button>
        </div>
        <div className="panel saved-card">
          <h2><Bookmark size={18} /> Bookmarked Questions</h2>
          <button onClick={() => setPage?.('mock-test')}>TCP reliable byte stream question.</button>
          <button onClick={() => setPage?.('mock-test')}>Virtual memory MSQ.</button>
          <button onClick={() => setPage?.('mock-test')}>Dynamic programming properties.</button>
        </div>
        <div className="panel saved-card">
          <h2><Award size={18} /> Saved AI Notes</h2>
          <button onClick={() => setPage?.('resources')}>{resources?.[0]?.title || 'Linear Algebra quick notes'}</button>
          <button onClick={() => setPage?.('resources')}>OS scheduling traps and shortcuts.</button>
          <button onClick={() => setPage?.('resources')}>GATE formula revision sheet.</button>
        </div>
      </div>
    </section>
  );
}

function ClipboardIcon() {
  return <Clock3 size={20} />;
}
