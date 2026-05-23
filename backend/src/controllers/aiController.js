import { runAi } from '../ai.js';
import { query } from '../db.js';

export async function chatWithAi(req, res, next) {
  try {
    const question = req.body.question || req.body.message || req.body.prompt || '';
    const answer = await runAi(`Solve this GATE doubt with steps: ${question}`, 'doubt');
    await query(
      'INSERT INTO doubt_threads (user_id, subject, topic, question, ai_answer, status) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, req.body.subject || null, req.body.topic || null, question, answer, 'resolved']
    );
    return res.json({ answer });
  } catch (error) {
    return next(error);
  }
}

export async function generateStudyPlan(req, res, next) {
  try {
    const answer = await runAi(
      `Create a GATE study plan. Branch: ${req.body.branch}. Target date: ${req.body.targetDate}. Daily hours: ${req.body.dailyHours}. Weak subjects: ${req.body.weakSubjects}.`,
      'planner'
    );
    await query(
      'INSERT INTO study_plans (user_id, title, target_date, daily_hours, weak_subjects, plan_json) VALUES (?, ?, ?, ?, ?, ?)',
      [
        req.user.id,
        `${req.body.branch || 'GATE'} Study Plan`,
        req.body.targetDate,
        req.body.dailyHours || 4,
        JSON.stringify(String(req.body.weakSubjects || '').split(',').map((item) => item.trim()).filter(Boolean)),
        JSON.stringify({ generatedPlan: answer })
      ]
    );
    return res.json({ plan: answer });
  } catch (error) {
    return next(error);
  }
}

export async function generateQuestions(req, res, next) {
  try {
    const answer = await runAi(`Generate ${req.body.count || 5} GATE practice questions for ${req.body.subject} topic ${req.body.topic}. Include answers.`, 'questions');
    return res.json({ questions: answer });
  } catch (error) {
    return next(error);
  }
}

export async function explainAnswer(req, res, next) {
  try {
    const answer = await runAi(`Explain this wrong answer for GATE prep: ${JSON.stringify(req.body)}`, 'explanation');
    return res.json({ explanation: answer });
  } catch (error) {
    return next(error);
  }
}

export async function recommendResources(req, res, next) {
  try {
    const answer = await runAi(`Recommend free GATE resources for weak subjects: ${req.body.weakSubjects}`, 'recommendation');
    return res.json({ recommendations: answer });
  } catch (error) {
    return next(error);
  }
}
