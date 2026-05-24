import { BarChart3, BookOpen, Brain, CalendarDays, ClipboardList, LayoutDashboard, MessageSquare, Trophy } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import { DashboardCard } from '../components/DashboardCard.jsx';
import { PageTitle } from '../components/PageTitle.jsx';

export function Dashboard({ user, dashboard, prediction, resources, chartData, weakData, setPage }) {
  return (
    <section className="page">
      <PageTitle icon={LayoutDashboard} title="Student Dashboard" text={`Welcome ${user?.name || 'student'}, your GATE readiness snapshot is ready.`} />
      <div className="stats-grid">
        <DashboardCard icon={BookOpen} label="Resources" value={resources.length} />
        <DashboardCard icon={BarChart3} label="Attempts" value={dashboard?.attempts || 0} />
        <DashboardCard icon={Trophy} label="Accuracy" value={`${dashboard?.averageAccuracy || 66}%`} />
        <DashboardCard icon={CalendarDays} label="Predicted" value={`${prediction?.predictedScore || 67}/100`} />
      </div>
      <div className="dashboard-grid">
        <div className="panel chart-panel">
          <h2>Score Trend</h2>
          <div className="chart-canvas">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="panel chart-panel">
          <h2>Weak Subjects</h2>
          <div className="chart-canvas">
            <Bar data={weakData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
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
