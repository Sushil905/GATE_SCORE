import { query } from '../db.js';

export async function getDashboard(req, res, next) {
  try {
    const submissions = await query(
      'SELECT s.*, t.title, t.subject FROM submissions s JOIN tests t ON t.id = s.test_id WHERE s.user_id = ? ORDER BY s.submitted_at DESC LIMIT 10',
      [req.user.id]
    );
    const averageAccuracy = submissions.length
      ? submissions.reduce((sum, row) => sum + Number(row.accuracy), 0) / submissions.length
      : 0;
    const weakSubjectTotals = submissions.reduce((acc, row) => {
      const weak = typeof row.weak_subjects === 'string' ? JSON.parse(row.weak_subjects || '{}') : row.weak_subjects || {};
      Object.entries(weak).forEach(([subject, count]) => {
        acc[subject] = (acc[subject] || 0) + Number(count);
      });
      return acc;
    }, {});
    const enrollments = await query(
      `SELECT e.progress_percent, e.status, c.title, c.level
       FROM enrollments e
       JOIN courses c ON c.id = e.course_id
       WHERE e.user_id = ?
       ORDER BY e.enrolled_at DESC
       LIMIT 5`,
      [req.user.id]
    );
    const upcomingTasks = await query(
      `SELECT st.id, st.title, st.task_type, st.due_date, st.estimated_minutes, st.status, s.name AS subject, t.name AS topic
       FROM study_tasks st
       LEFT JOIN subjects s ON s.id = st.subject_id
       LEFT JOIN topics t ON t.id = st.topic_id
       WHERE st.user_id = ? AND st.status IN ('pending', 'in_progress')
       ORDER BY st.due_date IS NULL, st.due_date ASC, st.created_at DESC
       LIMIT 6`,
      [req.user.id]
    );

    return res.json({
      attempts: submissions.length,
      averageAccuracy: Number(averageAccuracy.toFixed(2)),
      weakSubjects: weakSubjectTotals,
      scoreTrend: submissions.reverse().map((row) => ({ test: row.title, score: Number(row.score), accuracy: Number(row.accuracy) })),
      enrollments,
      upcomingTasks
    });
  } catch (error) {
    return next(error);
  }
}

export async function predictScore(req, res, next) {
  try {
    const rows = await query('SELECT score, total_marks, accuracy FROM submissions WHERE user_id = ? ORDER BY submitted_at DESC LIMIT 5', [req.user.id]);
    const avgAccuracy = rows.length ? rows.reduce((sum, row) => sum + Number(row.accuracy), 0) / rows.length : 55;
    const predictedScore = Math.min(100, Math.max(0, Math.round(avgAccuracy * 0.82 + rows.length * 2)));
    return res.json({
      predictedScore,
      rankBand: predictedScore >= 75 ? 'Top 1,500' : predictedScore >= 55 ? 'Top 8,000' : 'Needs more mocks',
      confidence: rows.length >= 3 ? 'medium' : 'low'
    });
  } catch (error) {
    return next(error);
  }
}
