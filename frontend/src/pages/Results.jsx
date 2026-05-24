import { Bar, Line } from 'react-chartjs-2';
import { CheckCircle2, ClipboardList, LineChart, PieChart, Shield, Target, Trophy } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { Stat } from '../components/Stat.jsx';

export function Results({ result, dashboard, chartData, weakData, prediction, setPage }) {
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
          <div className="chart-canvas">
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
        <div className="panel chart-panel">
          <h2>Mistake Distribution</h2>
          <div className="chart-canvas">
            <Bar data={weakData} options={{ responsive: true, maintainAspectRatio: false }} />
          </div>
        </div>
      </div>
      <div className="panel result-block">
        {result ? (
          <>
            <div className="ai-result-panel">
              <h2>AI Test Evaluation</h2>
              <p>{result.aiAnalysis?.summary || 'AI analysis will appear after your next submission.'}</p>
              <div className="result-mini-grid">
                <span>Rank: <b>{result.rankEstimate || 'Calculating'}</b></span>
                <span>Pace: <b>{result.timeAnalysis?.pace || 'good'}</b></span>
                <span>Time: <b>{result.timeAnalysis?.timeTakenMinutes || 0} min</b></span>
              </div>
            </div>
            {result.weakSubjectRanking?.length > 0 && (
              <div className="ai-result-panel">
                <h2>Weakness Detection</h2>
                {result.weakSubjectRanking.map((item) => <p key={item.subject}>Weak in {item.subject}: {item.mistakes} issue(s)</p>)}
              </div>
            )}
            {result.aiAnalysis?.recommendations?.length > 0 && (
              <div className="ai-result-panel">
                <h2>AI Resource Recommendations</h2>
                {result.aiAnalysis.recommendations.map((item) => <p key={item}><CheckCircle2 size={16} /> {item}</p>)}
              </div>
            )}
            {result.review.map((item) => (
              <p key={item.questionId}><CheckCircle2 size={16} /> {item.isCorrect ? 'Correct' : 'Review'} Q{item.questionId}: {item.explanation}</p>
            ))}
          </>
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
