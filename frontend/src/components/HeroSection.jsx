import {
  BarChart3,
  BookOpenCheck,
  Bot,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Database,
  Flame,
  GraduationCap,
  PlayCircle,
  Sparkles,
  Target,
  Trophy,
  UserPlus,
  WandSparkles
} from 'lucide-react';

export function HeroSection({ setPage, prediction }) {
  const headline = ['Prepare', 'for', 'GATE', 'with', 'AI', 'mocks,', 'live', 'analytics,', 'and', 'a', 'focused', 'study', 'path.'];

  return (
    <section className="hero page">
      <div className="hero-copy">
        <span className="eyebrow"><Sparkles size={16} /> Full-stack GenAI GATE platform</span>
        <h1 className="wave-heading" aria-label="Prepare for GATE with AI mocks, live analytics, and a focused study path.">
          {headline.map((word, index) => (
            <span style={{ '--wave-index': index }} key={`${word}-${index}`}>{word}</span>
          ))}
        </h1>
        <p>Attempt real-pattern tests, store every answer in MySQL, detect weak areas with AI, and jump straight to the right resources for your branch.</p>
        <div className="button-row">
          <button className="primary" onClick={() => setPage('register')}><UserPlus size={18} /> Start learning</button>
          <button className="secondary" onClick={() => setPage('mock-test')}><Target size={18} /> Try AI mock</button>
        </div>
        <div className="hero-pills">
          <span><CheckCircle2 size={16} /> MCQ · MSQ · NAT</span>
          <span><Clock3 size={16} /> 3 hour test mode</span>
          <span><Flame size={16} /> Weakness detection</span>
        </div>
        <div className="hero-metrics">
          <div><strong>29</strong><span>GATE branches</span></div>
          <div><strong>65</strong><span>real exam questions</span></div>
          <div><strong>100</strong><span>marks pattern</span></div>
        </div>
      </div>

      <div className="hero-visual" aria-label="GATE preparation dashboard preview">
        <div className="hero-dashboard">
          <div className="hero-dashboard-head">
            <div>
              <small>GATE_SCORE Command Center</small>
              <strong>CSE Adaptive Mock</strong>
            </div>
            <span><Bot size={16} /> AI Live</span>
          </div>

          <div className="hero-score-row">
            <div className="rank-panel">
              <span>Predicted score</span>
              <strong>{prediction?.predictedScore || 67}/100</strong>
              <p>{prediction?.rankBand || 'Top 8,000'} · Confidence {prediction?.confidence || 'demo'}</p>
            </div>
            <div className="hero-timer-card">
              <Clock3 size={18} />
              <strong>02:41:18</strong>
              <span>Real test timer</span>
            </div>
          </div>

          <div className="hero-analysis-grid">
            <div>
              <BarChart3 size={18} />
              <strong>Analytics</strong>
              <span>Accuracy 74%</span>
            </div>
            <div>
              <Database size={18} />
              <strong>MySQL</strong>
              <span>Answers saved</span>
            </div>
            <div>
              <Trophy size={18} />
              <strong>Rank</strong>
              <span>Top 8,000</span>
            </div>
          </div>

          <div className="study-card">
            <div className="study-card-top">
              <div>
                <small>AI detected weak area</small>
                <strong>DBMS Normalization</strong>
              </div>
              <WandSparkles size={20} />
            </div>
            <div className="progress-track"><span style={{ width: '72%' }} /></div>
            <ul>
              <li><CheckCircle2 size={16} /> Revise 3NF and BCNF concepts</li>
              <li><PlayCircle size={16} /> Free lecture recommendation</li>
              <li><ClipboardList size={16} /> Generate adaptive retry mock</li>
            </ul>
          </div>
        </div>

        <div className="hero-feature-strip">
          <button type="button" onClick={() => setPage('courses')}>
            <GraduationCap size={18} />
            <span>Branch-wise prep</span>
          </button>
          <button type="button" onClick={() => setPage('resources')}>
            <BookOpenCheck size={18} />
            <span>Free courses</span>
          </button>
          <button type="button" onClick={() => setPage('study-plan')}>
            <Bot size={18} />
            <span>AI study plan</span>
          </button>
        </div>
      </div>
    </section>
  );
}
