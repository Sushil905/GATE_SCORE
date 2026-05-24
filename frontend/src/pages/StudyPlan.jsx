import { BookOpen, Brain, CalendarDays } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { gateBranches, gateBranchSubjects } from '../data/branchData.js';

export function StudyPlan({ aiForm, setAiForm, planOutput, resourceOutput, generateStudyPlan, recommendResources }) {
  const subjects = gateBranchSubjects[aiForm.branch] || [];

  return (
    <section className="page">
      <PageTitle icon={Brain} title="Study Plan" text="Generate a plan from your branch, target date, daily hours, and weak subjects." />
      <div className="split">
        <div className="panel form">
          <h2>Plan Inputs</h2>
          <div className="grid-two">
            <label>Branch<select value={aiForm.branch} onChange={(event) => setAiForm({ ...aiForm, branch: event.target.value, subject: gateBranchSubjects[event.target.value]?.[0] || '' })}>
              {gateBranches.map((branch) => (
                <option value={branch.name} key={branch.code}>{branch.name} ({branch.code})</option>
              ))}
            </select></label>
            <label>Target date<input type="date" value={aiForm.targetDate} onChange={(event) => setAiForm({ ...aiForm, targetDate: event.target.value })} /></label>
            <label>Daily hours<input type="number" value={aiForm.dailyHours} onChange={(event) => setAiForm({ ...aiForm, dailyHours: event.target.value })} /></label>
            <label>Subject<select value={aiForm.subject} onChange={(event) => setAiForm({ ...aiForm, subject: event.target.value })}>
              {subjects.map((subject) => <option value={subject} key={subject}>{subject}</option>)}
            </select></label>
          </div>
          <label>Weak subjects<input value={aiForm.weakSubjects} onChange={(event) => setAiForm({ ...aiForm, weakSubjects: event.target.value })} /></label>
          <div className="button-row">
            <button className="primary" onClick={generateStudyPlan}><CalendarDays size={18} /> Generate Plan</button>
            <button className="secondary" onClick={recommendResources}><BookOpen size={18} /> Recommend Resources</button>
          </div>
        </div>
        <pre className="ai-output">{planOutput}</pre>
      </div>
      <pre className="ai-output compact-output">{resourceOutput}</pre>
    </section>
  );
}
