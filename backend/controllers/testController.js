import { query } from '../config/db.js';
import { runAi } from '../config/ai.js';

function normalizeAnswer(answer) {
  return String(answer || '').trim().toUpperCase();
}

function rankEstimateFromPercentage(percentage) {
  if (percentage >= 85) return 'Top 1,000';
  if (percentage >= 70) return 'Top 5,000';
  if (percentage >= 50) return 'Top 15,000';
  return 'Needs revision';
}

async function buildAiAttemptAnalysis({ branch, subject, score, totalMarks, accuracy, weakList, strongList, review }) {
  const weakText = weakList.length ? weakList.map((item) => `${item.subject}: ${item.mistakes}`).join(', ') : 'none';
  const wrongText = review
    .filter((item) => !item.isCorrect)
    .slice(0, 8)
    .map((item) => `Q${item.questionId} ${item.subject}: selected ${item.selected || 'unattempted'}, correct ${item.correctOption}. ${item.explanation || ''}`)
    .join('\n');

  const prompt = [
    `Analyze this GATE mock attempt for branch ${branch || 'GATE'} and subject ${subject || 'mixed subjects'}.`,
    `Score: ${score}/${totalMarks}. Accuracy: ${accuracy}%.`,
    `Weak subjects: ${weakText}.`,
    `Strong subjects: ${strongList.map((item) => item.subject).join(', ') || 'none yet'}.`,
    `Wrong answer notes:\n${wrongText || 'No wrong answers.'}`,
    'Return a concise mentor analysis with: summary, weaknesses, resource recommendations, and next adaptive mock difficulty.'
  ].join('\n\n');

  const aiText = await runAi(prompt, 'explanation');
  return {
    summary: aiText,
    wrongAnswerAnalysis: review
      .filter((item) => !item.isCorrect)
      .map((item) => ({
        questionId: item.questionId,
        whyWrong: item.selected ? 'Selected answer did not match the tested concept.' : 'Question was left unattempted.',
        correctConcept: item.explanation || 'Revise the concept and solve similar PYQs.',
        nextStep: `Practice 5 more questions from ${item.subject}.`
      })),
    recommendations: weakList.length
      ? weakList.map((item) => `AI recommendation: revise ${item.subject}, watch one free concept lecture, solve PYQs, then generate a fresh adaptive mock.`)
      : ['AI recommendation: move to medium/hard adaptive mocks.', 'Review bookmarked difficult questions.', 'Maintain short formula notes.']
  };
}

function calculateReview(questions, answers) {
  let score = 0;
  let correctCount = 0;
  let wrongCount = 0;
  let unattemptedCount = 0;
  const weakSubjects = {};
  const strongSubjects = {};

  const review = questions.map((question) => {
    const selected = normalizeAnswer(answers[question.sourceId || question.id]);
    const correctAnswer = normalizeAnswer(question.correct_answer);
    const isAttempted = Boolean(selected);
    const isCorrect = isAttempted && selected === correctAnswer;
    let marksObtained = 0;

    if (isCorrect) {
      marksObtained = Number(question.marks);
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
      correctOption: correctAnswer,
      isCorrect,
      marksObtained,
      explanation: question.explanation,
      subject: question.subject
    };
  });

  return { score, correctCount, wrongCount, unattemptedCount, weakSubjects, strongSubjects, review };
}

export async function getTests(req, res, next) {
  try {
    const rows = await query(
      `SELECT
         t.id,
         t.test_title AS title,
         COALESCE(s.subject_name, b.branch_name) AS subject,
         t.test_type,
         t.duration_minutes,
         t.total_marks,
         t.created_at
       FROM tests t
       JOIN branches b ON b.id = t.branch_id
       LEFT JOIN subjects s ON s.id = t.subject_id
       ORDER BY t.created_at DESC`
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function getTestById(req, res, next) {
  try {
    const [test] = await query(
      `SELECT
         t.id,
         t.test_title AS title,
         COALESCE(s.subject_name, b.branch_name) AS subject,
         t.test_type,
         t.duration_minutes,
         t.total_marks,
         t.created_at
       FROM tests t
       JOIN branches b ON b.id = t.branch_id
       LEFT JOIN subjects s ON s.id = t.subject_id
       WHERE t.id = ?`,
      [req.params.id]
    );
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await query(
      `SELECT
         q.id,
         s.subject_name AS subject,
         tp.topic_name AS topic,
         q.difficulty,
         q.question_text,
         q.question_type,
         q.option_a,
         q.option_b,
         q.option_c,
         q.option_d,
         q.marks,
         q.negative_marks
       FROM questions q
       JOIN subjects s ON s.id = q.subject_id
       LEFT JOIN topics tp ON tp.id = q.topic_id
       WHERE q.test_id = ?
       ORDER BY q.id`,
      [req.params.id]
    );
    return res.json({ ...test, questions });
  } catch (error) {
    return next(error);
  }
}

export async function getPreviousYearQuestions(req, res, next) {
  try {
    const rows = await query(
      `SELECT q.*, s.subject_name AS subject, tp.topic_name AS topic
       FROM questions q
       JOIN tests t ON t.id = q.test_id
       JOIN subjects s ON s.id = q.subject_id
       LEFT JOIN topics tp ON tp.id = q.topic_id
       WHERE t.test_type = 'pyq'
       ORDER BY q.id DESC`
    );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function submitGeneratedTest(req, res, next) {
  try {
    const branch = req.body.branch || req.user.branch || 'Computer Science Engineering';
    const subject = req.body.subject || 'General Aptitude';
    const incomingQuestions = Array.isArray(req.body.questions) ? req.body.questions : [];
    const answers = req.body.answers || {};

    if (!incomingQuestions.length) {
      return res.status(400).json({ message: 'Generated questions are required.' });
    }

    let [branchRow] = await query('SELECT id, branch_name FROM branches WHERE branch_name = ? OR branch_code = ? LIMIT 1', [branch, branch]);
    if (!branchRow) {
      const createdBranch = await query('INSERT INTO branches (branch_name, branch_code) VALUES (?, ?)', [branch, branch.slice(0, 8).toUpperCase()]);
      branchRow = { id: createdBranch.insertId, branch_name: branch };
    }

    let [subjectRow] = await query(
      'SELECT id, subject_name FROM subjects WHERE branch_id = ? AND subject_name = ? LIMIT 1',
      [branchRow.id, subject]
    );
    if (!subjectRow) {
      const createdSubject = await query(
        'INSERT INTO subjects (branch_id, subject_name, description) VALUES (?, ?, ?)',
        [branchRow.id, subject, `Generated adaptive mock subject for ${branch}.`]
      );
      subjectRow = { id: createdSubject.insertId, subject_name: subject };
    }

    const totalMarks = incomingQuestions.reduce((sum, question) => sum + Number(question.marks || 1), 0);
    const testResult = await query(
      `INSERT INTO tests (test_title, branch_id, subject_id, test_type, duration_minutes, total_marks, created_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [`${subject} AI Adaptive Mock`, branchRow.id, subjectRow.id, 'practice', 180, totalMarks, req.user.id]
    );

    const insertedQuestions = [];
    for (const question of incomingQuestions) {
      const result = await query(
        `INSERT INTO questions
         (test_id, subject_id, topic_id, question_text, question_type, option_a, option_b, option_c, option_d, correct_answer, explanation, marks, negative_marks, difficulty)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          testResult.insertId,
          subjectRow.id,
          null,
          question.question_text,
          question.question_type || 'mcq',
          question.option_a || null,
          question.option_b || null,
          question.option_c || null,
          question.option_d || null,
          question.correct_answer,
          question.explanation || null,
          Number(question.marks || 1),
          Number(question.negative_marks || 0),
          question.difficulty || 'medium'
        ]
      );
      insertedQuestions.push({
        ...question,
        sourceId: question.id,
        id: result.insertId,
        subject: subjectRow.subject_name,
        correct_answer: question.correct_answer
      });
    }

    const calculated = calculateReview(insertedQuestions, answers);
    const attempt = await query(
      `INSERT INTO test_attempts
       (user_id, test_id, score, total_marks, correct_count, wrong_count, unattempted_count, time_taken_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        req.user.id,
        testResult.insertId,
        calculated.score,
        totalMarks,
        calculated.correctCount,
        calculated.wrongCount,
        calculated.unattemptedCount,
        Number(req.body.timeTakenMinutes || 0)
      ]
    );

    for (const item of calculated.review) {
      await query(
        `INSERT INTO student_answers (attempt_id, question_id, selected_answer, is_correct, marks_obtained)
         VALUES (?, ?, ?, ?, ?)`,
        [attempt.insertId, item.questionId, item.selected || null, item.isCorrect, item.marksObtained]
      );
    }

    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
      [req.user.id, 'ai_mock_submitted', `Submitted AI adaptive ${subject} mock with score ${calculated.score}/${totalMarks}`]
    );

    const accuracy = insertedQuestions.length ? Number(((calculated.correctCount / insertedQuestions.length) * 100).toFixed(2)) : 0;
    const percentage = totalMarks ? Number(((calculated.score / totalMarks) * 100).toFixed(2)) : 0;
    const weakList = Object.entries(calculated.weakSubjects).sort((a, b) => b[1] - a[1]).map(([weakSubject, mistakes]) => ({ subject: weakSubject, mistakes }));
    const strongList = Object.entries(calculated.strongSubjects).sort((a, b) => b[1] - a[1]).map(([strongSubject, correct]) => ({ subject: strongSubject, correct }));
    const aiAnalysis = await buildAiAttemptAnalysis({
      branch,
      subject,
      score: calculated.score,
      totalMarks,
      accuracy,
      weakList,
      strongList,
      review: calculated.review
    });

    await query(
      'INSERT INTO ai_chat_history (user_id, question, ai_response, chat_type) VALUES (?, ?, ?, ?)',
      [req.user.id, `Analyze AI mock: ${subject}`, aiAnalysis.summary, 'explanation']
    );

    return res.json({
      score: Number(calculated.score.toFixed(2)),
      totalMarks,
      accuracy,
      rankEstimate: rankEstimateFromPercentage(percentage),
      timeAnalysis: {
        timeTakenMinutes: Number(req.body.timeTakenMinutes || 0),
        idealMinutes: insertedQuestions.length * 2,
        pace: Number(req.body.timeTakenMinutes || 0) > insertedQuestions.length * 2 ? 'slow' : 'good'
      },
      strongSubjects: strongList,
      weakSubjects: calculated.weakSubjects,
      weakSubjectRanking: weakList,
      aiAnalysis,
      review: calculated.review
    });
  } catch (error) {
    return next(error);
  }
}

export async function submitTest(req, res, next) {
  try {
    const testId = req.params.id || req.body.testId;
    if (!testId) return res.status(400).json({ message: 'testId is required' });

    const answers = req.body.answers || {};
    const questions = await query(
      `SELECT q.*, s.subject_name AS subject
       FROM questions q
       JOIN subjects s ON s.id = q.subject_id
       WHERE q.test_id = ?
       ORDER BY q.id`,
      [testId]
    );
    if (!questions.length) return res.status(404).json({ message: 'No questions found for this test' });

    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;
    const weakSubjects = {};
    const strongSubjects = {};

    const review = questions.map((question) => {
      const selected = normalizeAnswer(answers[question.id]);
      const correctAnswer = normalizeAnswer(question.correct_answer);
      const isAttempted = Boolean(selected);
      const isCorrect = isAttempted && selected === correctAnswer;
      let marksObtained = 0;

      if (isCorrect) {
        marksObtained = Number(question.marks);
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
        correctOption: correctAnswer,
        isCorrect,
        marksObtained,
        explanation: question.explanation,
        subject: question.subject
      };
    });

    const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks), 0);
    const attempt = await query(
      `INSERT INTO test_attempts
       (user_id, test_id, score, total_marks, correct_count, wrong_count, unattempted_count, time_taken_minutes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, testId, score, totalMarks, correctCount, wrongCount, unattemptedCount, Number(req.body.timeTakenMinutes || 0)]
    );

    for (const item of review) {
      await query(
        `INSERT INTO student_answers (attempt_id, question_id, selected_answer, is_correct, marks_obtained)
         VALUES (?, ?, ?, ?, ?)`,
        [attempt.insertId, item.questionId, item.selected || null, item.isCorrect, item.marksObtained]
      );
    }

    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
      [req.user.id, 'test_submitted', `Submitted test ${testId} with score ${score}/${totalMarks}`]
    );

    const accuracy = questions.length ? Number(((correctCount / questions.length) * 100).toFixed(2)) : 0;
    const percentage = totalMarks ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
    const rankEstimate = percentage >= 85 ? 'Top 1,000' : percentage >= 70 ? 'Top 5,000' : percentage >= 50 ? 'Top 15,000' : 'Needs revision';
    const weakList = Object.entries(weakSubjects).sort((a, b) => b[1] - a[1]).map(([subject, mistakes]) => ({ subject, mistakes }));
    const strongList = Object.entries(strongSubjects).sort((a, b) => b[1] - a[1]).map(([subject, correct]) => ({ subject, correct }));
    const aiAnalysis = {
      summary: weakList.length
        ? `Focus revision on ${weakList.slice(0, 2).map((item) => item.subject).join(', ')}. Re-attempt similar questions after concept revision.`
        : 'Excellent attempt. Move to adaptive medium/hard mocks and preserve speed.',
      wrongAnswerAnalysis: review
        .filter((item) => !item.isCorrect)
        .map((item) => ({
          questionId: item.questionId,
          whyWrong: item.selected ? 'Selected option does not match the tested concept.' : 'Question was left unattempted.',
          correctConcept: item.explanation || 'Revise the underlying concept and formula.',
          nextStep: `Practice 5 more questions from ${item.subject}.`
        })),
      recommendations: weakList.length
        ? weakList.map((item) => `Revise ${item.subject} notes, solve PYQs, then attempt a sectional quiz.`)
        : ['Try a harder adaptive mock test.', 'Review bookmarked difficult questions.', 'Maintain a short formula revision sheet.']
    };

    return res.json({
      score,
      totalMarks,
      accuracy,
      rankEstimate,
      timeAnalysis: {
        timeTakenMinutes: Number(req.body.timeTakenMinutes || 0),
        idealMinutes: questions.length * 2,
        pace: Number(req.body.timeTakenMinutes || 0) > questions.length * 2 ? 'slow' : 'good'
      },
      strongSubjects: strongList,
      weakSubjects,
      weakSubjectRanking: weakList,
      aiAnalysis,
      review
    });
  } catch (error) {
    return next(error);
  }
}
