import { runAi } from '../config/ai.js';
import { query } from '../config/db.js';

function buildPracticeQuestion({ id, subject, topic, difficulty, questionType }) {
  const type = questionType || 'mcq';
  const base = {
    question_text: `(${difficulty}) ${subject}: Which statement is most relevant for ${topic}?`,
    question_type: type,
    option_a: `Revise ${topic} concepts before PYQs`,
    option_b: 'Skip the topic completely',
    option_c: 'Only memorize option labels',
    option_d: 'Avoid mock test analysis',
    correct_answer: 'A',
    explanation: `${topic} should be revised conceptually and then practiced with PYQs.`,
    marks: id % 2 === 0 ? 2 : 1,
    negative_marks: type === 'mcq' ? (id % 2 === 0 ? 0.66 : 0.33) : 0,
    difficulty
  };

  if (type === 'msq') {
    return {
      ...base,
      question_text: `(${difficulty}) ${subject}: Select all useful actions for mastering ${topic}.`,
      option_a: `Revise ${topic} formulas/concepts`,
      option_b: 'Maintain an error log',
      option_c: 'Ignore wrong answers',
      option_d: 'Solve topic-wise PYQs',
      correct_answer: 'A,B,D',
      explanation: `Concept revision, error logs, and PYQs improve ${topic} accuracy.`
    };
  }

  if (type === 'nat') {
    return {
      ...base,
      question_text: `(${difficulty}) ${subject}: If a ${topic} drill has ${id + 4} questions and ${id} are wrong, enter the number of correct questions.`,
      option_a: null,
      option_b: null,
      option_c: null,
      option_d: null,
      correct_answer: '4',
      explanation: `${id + 4} total minus ${id} wrong gives 4 correct answers.`,
      negative_marks: 0
    };
  }

  return base;
}

export async function chatWithAi(req, res, next) {
  try {
    const question = req.body.question || req.body.message || req.body.prompt || '';
    if (!question.trim()) return res.status(400).json({ message: 'Question is required.' });

    const context = [
      `Branch: ${req.body.branch || req.user.branch || 'GATE'}`,
      `Subject: ${req.body.subject || 'General Aptitude'}`,
      `Topic: ${req.body.topic || 'not specified'}`,
      `Mode: ${req.body.aiMode || 'Explain Concept'}`,
      `Student doubt: ${question}`
    ].join('\n');
    const answer = await runAi(context, req.body.aiMode === 'Quick Revision' ? 'planner' : 'doubt');
    await query(
      'INSERT INTO ai_chat_history (user_id, question, ai_response, chat_type) VALUES (?, ?, ?, ?)',
      [req.user.id, context, answer, 'doubt']
    );
    return res.json({ answer });
  } catch (error) {
    return next(error);
  }
}

export async function generateStudyPlan(req, res, next) {
  try {
    if (!req.body.branch || !req.body.targetDate) {
      return res.status(400).json({ message: 'Branch and target date are required.' });
    }

    const answer = await runAi(
      `Create a GATE study plan. Branch: ${req.body.branch}. Target date: ${req.body.targetDate}. Daily hours: ${req.body.dailyHours}. Weak subjects: ${req.body.weakSubjects}.`,
      'planner'
    );
    await query(
      'INSERT INTO ai_study_plans (user_id, target_exam_date, daily_hours, weak_subjects, plan_text) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        req.body.targetDate,
        req.body.dailyHours || 4,
        String(req.body.weakSubjects || ''),
        answer
      ]
    );
    return res.json({ plan: answer });
  } catch (error) {
    return next(error);
  }
}

export async function generateQuestions(req, res, next) {
  try {
    if (!req.body.subject || !req.body.topic) {
      return res.status(400).json({ message: 'Subject and topic are required.' });
    }

    const count = Math.min(10, Math.max(1, Number(req.body.count || 5)));
    const difficulty = req.body.difficulty || 'medium';
    const questionType = req.body.questionType || 'mcq';
    const branch = req.body.branch || req.user.branch || 'Computer Science Engineering';
    const generatedQuestions = Array.from({ length: count }, (_, index) => buildPracticeQuestion({
      id: index + 1,
      subject: req.body.subject,
      topic: req.body.topic,
      difficulty,
      questionType
    }));

    const answer = await runAi(
      `Generate ${count} ${difficulty} ${questionType.toUpperCase()} GATE practice questions for ${branch}, subject ${req.body.subject}, topic ${req.body.topic}. Include answers and brief explanations.`,
      'questions'
    );

    let [branchRow] = await query('SELECT id FROM branches WHERE branch_name = ? OR branch_code = ? LIMIT 1', [branch, branch]);
    if (!branchRow) {
      const createdBranch = await query('INSERT INTO branches (branch_name, branch_code) VALUES (?, ?)', [branch, branch.slice(0, 8).toUpperCase()]);
      branchRow = { id: createdBranch.insertId };
    }
    let [subjectRow] = await query('SELECT id FROM subjects WHERE branch_id = ? AND subject_name = ? LIMIT 1', [branchRow.id, req.body.subject]);
    if (!subjectRow) {
      const createdSubject = await query(
        'INSERT INTO subjects (branch_id, subject_name, description) VALUES (?, ?, ?)',
        [branchRow.id, req.body.subject, `AI generated practice subject for ${branch}.`]
      );
      subjectRow = { id: createdSubject.insertId };
    }
    const totalMarks = generatedQuestions.reduce((sum, question) => sum + Number(question.marks), 0);
    const testResult = await query(
      `INSERT INTO tests (test_title, branch_id, subject_id, test_type, duration_minutes, total_marks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`${req.body.subject} AI Practice - ${req.body.topic}`, branchRow.id, subjectRow.id, 'practice', 30, totalMarks, req.user.id]
    );
    const storedQuestions = [];
    for (const question of generatedQuestions) {
      const inserted = await query(
        `INSERT INTO questions
         (test_id, subject_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, negative_marks, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testResult.insertId,
          subjectRow.id,
          question.question_text,
          question.question_type,
          question.option_a,
          question.option_b,
          question.option_c,
          question.option_d,
          question.correct_answer,
          question.explanation,
          question.marks,
          question.negative_marks,
          question.difficulty
        ]
      );
      storedQuestions.push({ id: inserted.insertId, subject: req.body.subject, topic: req.body.topic, ...question });
    }

    await query(
      'INSERT INTO ai_chat_history (user_id, question, ai_response, chat_type) VALUES (?, ?, ?, ?)',
      [req.user.id, `Generate questions: ${req.body.subject} - ${req.body.topic}`, answer, 'questions']
    );
    return res.json({ questions: answer, text: answer, generatedQuestions: storedQuestions, testId: testResult.insertId });
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
    if (!req.body.weakSubjects) return res.status(400).json({ message: 'Weak subjects are required.' });

    const answer = await runAi(`Recommend free GATE resources for weak subjects: ${req.body.weakSubjects}`, 'recommendation');
    await query(
      'INSERT INTO ai_chat_history (user_id, question, ai_response, chat_type) VALUES (?, ?, ?, ?)',
      [req.user.id, `Recommend resources: ${req.body.weakSubjects}`, answer, 'recommendation']
    );
    return res.json({ recommendations: answer });
  } catch (error) {
    return next(error);
  }
}
