import { useMemo, useState } from 'react';
import { Bot, CheckCircle2, Clipboard, Copy, FilePlus2, RefreshCw, Rocket, Send, Sparkles } from 'lucide-react';
import { PageTitle } from '../components/PageTitle.jsx';
import { gateBranches, gateBranchSubjects } from '../data/branchData.js';

const aiModes = ['Explain Concept', 'Generate MCQ', 'Quick Revision', 'PYQ Analysis', 'Solve Numerical'];
const promptTemplates = {
  'Explain Concept': 'Explain this topic from basics with formulas, GATE traps, and one solved example.',
  'Generate MCQ': 'Generate exam-level questions with answers and short explanations.',
  'Quick Revision': 'Create short revision notes with key points, formulas, and mistakes to avoid.',
  'PYQ Analysis': 'Analyze previous year question patterns and tell what to practice next.',
  'Solve Numerical': 'Solve this numerical step by step and explain the shortcut method.'
};

export function AIChat({ aiForm, setAiForm, runDoubtSolver, generatePracticeQuestions }) {
  const [messages, setMessages] = useState([
    {
      role: 'ai',
      text: 'Hi, I am your AI Mentor. Select branch, subject, topic, and mode, then ask a doubt or use a prompt template.'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [practiceQuestions, setPracticeQuestions] = useState([]);
  const subjects = gateBranchSubjects[aiForm.branch] || [];

  const activePrompt = useMemo(() => promptTemplates[aiForm.aiMode] || promptTemplates['Explain Concept'], [aiForm.aiMode]);

  function updateForm(patch) {
    setAiForm({ ...aiForm, ...patch });
  }

  function useTemplate() {
    updateForm({ question: `${activePrompt}\n\nTopic: ${aiForm.topic || aiForm.subject}` });
  }

  async function askAi() {
    const question = aiForm.question.trim();
    if (!question) return;

    setMessages((current) => [...current, { role: 'student', text: question }]);
    setIsTyping(true);
    try {
      const answer = await runDoubtSolver();
      setMessages((current) => [...current, { role: 'ai', text: answer }]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'ai', text: error.message }]);
    } finally {
      setIsTyping(false);
    }
  }

  async function regenerate() {
    if (!aiForm.question.trim()) return;
    await askAi();
  }

  async function copyLastAnswer() {
    const lastAnswer = [...messages].reverse().find((message) => message.role === 'ai')?.text || '';
    if (lastAnswer) await navigator.clipboard?.writeText(lastAnswer);
  }

  async function saveAsNotes() {
    const lastAnswer = [...messages].reverse().find((message) => message.role === 'ai')?.text || '';
    if (!lastAnswer) return;
    await navigator.clipboard?.writeText(`# ${aiForm.subject} - ${aiForm.topic}\n\n${lastAnswer}`);
    setMessages((current) => [...current, { role: 'ai', text: 'Saved as notes draft. The note is copied and this AI session is already stored in MySQL.' }]);
  }

  async function createPractice() {
    setIsTyping(true);
    try {
      const data = await generatePracticeQuestions();
      const generated = Array.isArray(data.generatedQuestions) ? data.generatedQuestions : [];
      setPracticeQuestions(generated);
      setMessages((current) => [
        ...current,
        { role: 'ai', text: data.text || data.questions || `Generated ${generated.length} practice questions.` }
      ]);
    } catch (error) {
      setMessages((current) => [...current, { role: 'ai', text: error.message }]);
    } finally {
      setIsTyping(false);
    }
  }

  return (
    <section className="page ai-mentor-page">
      <PageTitle icon={Bot} title="AI Mentor" text="A professional GenAI workspace for doubts, revision, PYQ analysis, numerical solving, and adaptive practice." />

      <div className="ai-mentor-layout">
        <div className="panel ai-control-panel">
          <h2>Mentor Setup</h2>
          <label>Branch<select value={aiForm.branch} onChange={(event) => {
            const branch = event.target.value;
            updateForm({ branch, subject: gateBranchSubjects[branch]?.[0] || '', topic: '' });
          }}>
            {gateBranches.map((branch) => <option key={branch.code} value={branch.name}>{branch.name} ({branch.code})</option>)}
          </select></label>
          <label>Subject<select value={aiForm.subject} onChange={(event) => updateForm({ subject: event.target.value })}>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select></label>
          <label>Topic<input value={aiForm.topic} onChange={(event) => updateForm({ topic: event.target.value })} placeholder="e.g. Normalization, Scheduling, Signals" /></label>
          <label>AI Mode<select value={aiForm.aiMode} onChange={(event) => updateForm({ aiMode: event.target.value })}>
            {aiModes.map((mode) => <option key={mode} value={mode}>{mode}</option>)}
          </select></label>
          <button className="secondary" onClick={useTemplate}><Clipboard size={16} /> Use Prompt Template</button>
        </div>

        <div className="panel ai-chat-panel">
          <div className="ai-chat-window">
            {messages.map((message, index) => (
              <div className={`chat-bubble ${message.role}`} key={`${message.role}-${index}`}>
                <span>{message.role === 'ai' ? 'AI Mentor' : 'You'}</span>
                <p>{message.text}</p>
              </div>
            ))}
            {isTyping && (
              <div className="chat-bubble ai">
                <span>AI Mentor</span>
                <p className="typing-dots"><i /> <i /> <i /></p>
              </div>
            )}
          </div>
          <div className="ai-prompt-box">
            <textarea value={aiForm.question} onChange={(event) => updateForm({ question: event.target.value })} placeholder={activePrompt} />
            <div className="ai-action-row">
              <button className="primary" onClick={askAi}><Send size={16} /> Ask AI</button>
              <button className="secondary" onClick={regenerate}><RefreshCw size={16} /> Regenerate</button>
              <button className="secondary" onClick={copyLastAnswer}><Copy size={16} /> Copy</button>
              <button className="secondary" onClick={saveAsNotes}><FilePlus2 size={16} /> Save Notes</button>
            </div>
          </div>
        </div>
      </div>

      <div className="panel practice-generator-panel">
        <div>
          <h2>Practice Generator</h2>
          <p className="muted">Generate structured MCQ, MSQ, or NAT questions and store the AI session in MySQL.</p>
        </div>
        <div className="practice-controls">
          <label>Difficulty<select value={aiForm.difficulty} onChange={(event) => updateForm({ difficulty: event.target.value })}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select></label>
          <label>Question Type<select value={aiForm.questionType} onChange={(event) => updateForm({ questionType: event.target.value })}>
            <option value="mcq">MCQ</option>
            <option value="msq">MSQ</option>
            <option value="nat">NAT</option>
          </select></label>
          <label>Count<input type="number" min="1" max="10" value={aiForm.questionCount} onChange={(event) => updateForm({ questionCount: Number(event.target.value) })} /></label>
          <button className="primary" onClick={createPractice}><Rocket size={16} /> Generate Practice</button>
        </div>
        {practiceQuestions.length > 0 && (
          <div className="mentor-question-list">
            {practiceQuestions.map((question, index) => (
              <article className="mentor-question-card" key={question.id || index}>
                <span>{question.question_type?.toUpperCase()} · {question.marks} mark · {question.difficulty}</span>
                <h3>Q{index + 1}. {question.question_text}</h3>
                {question.question_type === 'nat' ? (
                  <input placeholder="Numerical answer" />
                ) : (
                  <div className="mentor-options">
                    {['A', 'B', 'C', 'D'].map((option) => (
                      <button key={option}><b>{option}</b>{question[`option_${option.toLowerCase()}`]}</button>
                    ))}
                  </div>
                )}
                <p><CheckCircle2 size={15} /> Answer: {question.correct_answer}</p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
