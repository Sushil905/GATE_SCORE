import { query } from '../config/db.js';

export async function getDashboard(req, res, next) {
  try {
    const attempts = await query(
      `SELECT ta.*, t.test_title
       FROM test_attempts ta
       JOIN tests t ON t.id = ta.test_id
       WHERE ta.user_id = ?
       ORDER BY ta.submitted_at DESC
       LIMIT 10`,
      [req.user.id]
    );

    const averageAccuracy = attempts.length
      ? attempts.reduce((sum, row) => {
          const totalQuestions = Number(row.correct_count) + Number(row.wrong_count) + Number(row.unattempted_count);
          return sum + (totalQuestions ? (Number(row.correct_count) / totalQuestions) * 100 : 0);
        }, 0) / attempts.length
      : 0;

    const weakRows = await query(
      `SELECT s.subject_name, COUNT(*) AS mistakes
       FROM student_answers sa
       JOIN test_attempts ta ON ta.id = sa.attempt_id
       JOIN questions q ON q.id = sa.question_id
       JOIN subjects s ON s.id = q.subject_id
       WHERE ta.user_id = ? AND sa.is_correct = FALSE
       GROUP BY s.subject_name
       ORDER BY mistakes DESC`,
      [req.user.id]
    );
    const weakSubjects = weakRows.reduce((acc, row) => {
      acc[row.subject_name] = Number(row.mistakes);
      return acc;
    }, {});

    const progressRows = await query(
      `SELECT up.*, s.subject_name
       FROM user_progress up
       JOIN subjects s ON s.id = up.subject_id
       WHERE up.user_id = ?
       ORDER BY up.progress_percentage ASC`,
      [req.user.id]
    );

    const activity = await query(
      `SELECT activity_type, activity_description, created_at
       FROM activity_logs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT 8`,
      [req.user.id]
    );

    const scoreTrend = attempts
      .slice()
      .reverse()
      .map((row) => {
        const totalQuestions = Number(row.correct_count) + Number(row.wrong_count) + Number(row.unattempted_count);
        const accuracy = totalQuestions ? Number(((Number(row.correct_count) / totalQuestions) * 100).toFixed(2)) : 0;
        return { test: row.test_title, score: Number(row.score), accuracy };
      });

    const nextAction = weakRows[0]
      ? { type: 'revision', title: `Revise ${weakRows[0].subject_name}`, dueDate: null }
      : { type: 'mock', title: 'Attempt a mini mock to unlock deeper analytics', dueDate: null };

    return res.json({
      attempts: attempts.length,
      averageAccuracy: Number(averageAccuracy.toFixed(2)),
      weakSubjects,
      weakSubjectRanking: weakRows.map((row) => ({ subject: row.subject_name, mistakes: Number(row.mistakes) })),
      scoreTrend,
      enrollments: progressRows.map((row) => ({
        title: row.subject_name,
        progress_percent: Number(row.progress_percentage),
        status: Number(row.progress_percentage) >= 100 ? 'completed' : 'active',
        level: 'subject'
      })),
      upcomingTasks: [],
      learningSummary: {
        enrolledCourses: progressRows.length,
        averageCourseProgress: progressRows.length
          ? Number((progressRows.reduce((sum, row) => sum + Number(row.progress_percentage), 0) / progressRows.length).toFixed(2))
          : 0,
        completedLessons: progressRows.reduce((sum, row) => sum + Number(row.completed_topics), 0),
        touchedLessons: progressRows.reduce((sum, row) => sum + Number(row.total_topics), 0),
        openTasks: 0,
        completedTasks: 0
      },
      nextAction,
      recentActivity: activity,
      announcements: []
    });
  } catch (error) {
    return next(error);
  }
}

export async function predictScore(req, res, next) {
  try {
    const rows = await query(
      'SELECT score, total_marks, correct_count, wrong_count, unattempted_count FROM test_attempts WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 5',
      [req.user.id]
    );
    const [progress] = await query(
      'SELECT COALESCE(AVG(progress_percentage), 0) AS average_progress FROM user_progress WHERE user_id = ?',
      [req.user.id]
    );
    const avgAccuracy = rows.length
      ? rows.reduce((sum, row) => {
          const totalQuestions = Number(row.correct_count) + Number(row.wrong_count) + Number(row.unattempted_count);
          return sum + (totalQuestions ? (Number(row.correct_count) / totalQuestions) * 100 : 0);
        }, 0) / rows.length
      : 55;
    const predictedScore = Math.min(100, Math.max(0, Math.round(avgAccuracy * 0.78 + rows.length * 2 + Number(progress?.average_progress || 0) * 0.08)));

    return res.json({
      predictedScore,
      rankBand: predictedScore >= 75 ? 'Top 1,500' : predictedScore >= 55 ? 'Top 8,000' : 'Needs more mocks',
      confidence: rows.length >= 3 ? 'medium' : 'low',
      inputs: {
        recentMocks: rows.length,
        averageAccuracy: Number(avgAccuracy.toFixed(2)),
        averageCourseProgress: Number(Number(progress?.average_progress || 0).toFixed(2))
      }
    });
  } catch (error) {
    return next(error);
  }
}
