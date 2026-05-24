import { query } from '../config/db.js';

export async function getCourses(req, res, next) {
  try {
    const rows = await query(
      `SELECT
         s.id,
         s.subject_name AS title,
         s.description,
         b.branch_name AS program_name,
         COUNT(t.id) AS lesson_count,
         COALESCE(up.progress_percentage, 0) AS progress_percent
       FROM subjects s
       JOIN branches b ON b.id = s.branch_id
       LEFT JOIN topics t ON t.subject_id = s.id
       LEFT JOIN user_progress up ON up.subject_id = s.id AND up.user_id = ?
       GROUP BY s.id, b.branch_name, up.progress_percentage
       ORDER BY s.id`,
      [req.user.id]
    );
    return res.json(rows.map((row) => ({ ...row, level: 'subject', total_minutes: Number(row.lesson_count) * 45 })));
  } catch (error) {
    return next(error);
  }
}

export async function getCourseById(req, res, next) {
  try {
    const [subject] = await query(
      `SELECT s.id, s.subject_name AS title, s.description, b.branch_name AS program_name, COALESCE(up.progress_percentage, 0) AS progress_percent
       FROM subjects s
       JOIN branches b ON b.id = s.branch_id
       LEFT JOIN user_progress up ON up.subject_id = s.id AND up.user_id = ?
       WHERE s.id = ?`,
      [req.user.id, req.params.id]
    );
    if (!subject) return res.status(404).json({ message: 'Course not found' });

    const lessons = await query(
      `SELECT id, topic_name AS title, difficulty, 45 AS duration_minutes
       FROM topics
       WHERE subject_id = ?
       ORDER BY id`,
      [req.params.id]
    );
    return res.json({ ...subject, lessons });
  } catch (error) {
    return next(error);
  }
}

export async function enrollCourse(req, res, next) {
  try {
    const [summary] = await query('SELECT COUNT(*) AS total_topics FROM topics WHERE subject_id = ?', [req.params.id]);
    await query(
      `INSERT INTO user_progress (user_id, subject_id, completed_topics, total_topics, progress_percentage)
       VALUES (?, ?, 0, ?, 0)
       ON DUPLICATE KEY UPDATE total_topics = VALUES(total_topics)`,
      [req.user.id, req.params.id, Number(summary?.total_topics || 0)]
    );
    await query(
      'INSERT INTO activity_logs (user_id, activity_type, activity_description) VALUES (?, ?, ?)',
      [req.user.id, 'subject_enrolled', `Started subject track ${req.params.id}`]
    );
    return res.status(201).json({ message: 'Enrolled successfully' });
  } catch (error) {
    return next(error);
  }
}

export async function updateLessonProgress(req, res, next) {
  try {
    const [topic] = await query('SELECT id, subject_id FROM topics WHERE id = ?', [req.params.lessonId]);
    if (!topic) return res.status(404).json({ message: 'Topic not found' });

    const [summary] = await query('SELECT COUNT(*) AS total_topics FROM topics WHERE subject_id = ?', [topic.subject_id]);
    const [current] = await query('SELECT completed_topics FROM user_progress WHERE user_id = ? AND subject_id = ?', [req.user.id, topic.subject_id]);
    const totalTopics = Number(summary?.total_topics || 0);
    const completedTopics = Math.min(totalTopics, Number(current?.completed_topics || 0) + 1);
    const progress = totalTopics ? Number(((completedTopics / totalTopics) * 100).toFixed(2)) : 0;

    await query(
      `INSERT INTO user_progress (user_id, subject_id, completed_topics, total_topics, progress_percentage)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE completed_topics = VALUES(completed_topics), total_topics = VALUES(total_topics), progress_percentage = VALUES(progress_percentage)`,
      [req.user.id, topic.subject_id, completedTopics, totalTopics, progress]
    );
    return res.json({ message: 'Progress updated', progressPercent: progress, completedTopics, totalTopics });
  } catch (error) {
    return next(error);
  }
}

export async function getStudyTasks(req, res, next) {
  return res.json([]);
}

export async function updateStudyTask(req, res, next) {
  return res.json({ message: 'Task updated' });
}

export async function getRecommendations(req, res, next) {
  try {
    const resources = await query(
      `SELECT r.id, s.subject_name AS subject, r.title, r.resource_type AS type, r.resource_url AS url, COALESCE(t.difficulty, 'medium') AS difficulty
       FROM resources r
       JOIN subjects s ON s.id = r.subject_id
       LEFT JOIN topics t ON t.id = r.topic_id
       ORDER BY r.created_at DESC
       LIMIT 8`
    );
    const practiceTests = await query(
      `SELECT id, test_title AS title, test_type, duration_minutes, total_marks
       FROM tests
       ORDER BY created_at DESC
       LIMIT 4`
    );
    return res.json({
      weakSubjects: [],
      nextLessons: [],
      resources,
      practiceTests,
      advice: 'Attempt one mini mock, review weak subjects, and bookmark resources for repeated revision.'
    });
  } catch (error) {
    return next(error);
  }
}
