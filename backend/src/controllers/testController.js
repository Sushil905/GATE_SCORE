import { query } from '../db.js';

export async function getTests(req, res, next) {
  try {
    const rows = await query('SELECT * FROM tests WHERE is_published = TRUE ORDER BY created_at DESC');
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function getTestById(req, res, next) {
  try {
    const [test] = await query('SELECT * FROM tests WHERE id = ?', [req.params.id]);
    if (!test) return res.status(404).json({ message: 'Test not found' });

    const questions = await query(
      `SELECT q.id, q.subject, q.topic, q.difficulty, q.question_text, q.option_a, q.option_b, q.option_c, q.option_d, q.marks, q.negative_marks
       FROM questions q
       JOIN test_questions tq ON tq.question_id = q.id
       WHERE tq.test_id = ?
       ORDER BY tq.display_order, q.id`,
      [req.params.id]
    );
    return res.json({ ...test, questions });
  } catch (error) {
    return next(error);
  }
}

export async function getPreviousYearQuestions(req, res, next) {
  try {
    const rows = await query('SELECT * FROM questions WHERE source = "pyq" ORDER BY year DESC');
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function submitTest(req, res, next) {
  try {
    const testId = req.params.id || req.body.testId;
    if (!testId) {
      return res.status(400).json({ message: 'testId is required' });
    }

    const answers = req.body.answers || {};
    const questions = await query(
      `SELECT q.* FROM questions q
       JOIN test_questions tq ON tq.question_id = q.id
       WHERE tq.test_id = ?
       ORDER BY tq.display_order, q.id`,
      [testId]
    );
    let score = 0;
    let correct = 0;
    const weakSubjects = {};

    const review = questions.map((question) => {
      const selected = answers[question.id];
      const isCorrect = selected === question.correct_option;
      if (isCorrect) {
        score += Number(question.marks);
        correct += 1;
      } else if (selected) {
        score -= Number(question.negative_marks || 0);
        weakSubjects[question.subject] = (weakSubjects[question.subject] || 0) + 1;
      } else {
        weakSubjects[question.subject] = (weakSubjects[question.subject] || 0) + 1;
      }
      return {
        questionId: question.id,
        selected,
        correctOption: question.correct_option,
        isCorrect,
        explanation: question.explanation,
        subject: question.subject
      };
    });

    const totalMarks = questions.reduce((sum, question) => sum + Number(question.marks), 0);
    const accuracy = questions.length ? Number(((correct / questions.length) * 100).toFixed(2)) : 0;
    await query(
      `INSERT INTO submissions
       (user_id, test_id, score, total_marks, accuracy, weak_subjects, answers, review)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, testId, score, totalMarks, accuracy, JSON.stringify(weakSubjects), JSON.stringify(answers), JSON.stringify(review)]
    );

    return res.json({ score, totalMarks, accuracy, weakSubjects, review });
  } catch (error) {
    return next(error);
  }
}
