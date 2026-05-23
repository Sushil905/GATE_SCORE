import { query } from '../db.js';

export async function getResources(req, res, next) {
  try {
    const { subject } = req.query;
    const rows = subject
      ? await query(
          `SELECT r.*, t.name AS topic_name
           FROM resources r
           LEFT JOIN topics t ON t.id = r.topic_id
           WHERE r.subject = ?
           ORDER BY r.created_at DESC`,
          [subject]
        )
      : await query(
          `SELECT r.*, t.name AS topic_name
           FROM resources r
           LEFT JOIN topics t ON t.id = r.topic_id
           ORDER BY r.created_at DESC`
        );
    return res.json(rows);
  } catch (error) {
    return next(error);
  }
}

export async function addResource(req, res, next) {
  try {
    const { subject, topicId, title, description, type, url, difficulty, provider, estimatedMinutes, isPremium } = req.body;
    const resourceUrl = req.file ? `/uploads/${req.file.filename}` : url;
    await query(
      `INSERT INTO resources
       (subject, topic_id, title, description, type, url, difficulty, provider, estimated_minutes, is_premium, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        subject,
        topicId || null,
        title,
        description || null,
        type || 'notes',
        resourceUrl,
        difficulty || 'beginner',
        provider || 'GATE_SCORE',
        estimatedMinutes || 30,
        Boolean(isPremium),
        req.user.id
      ]
    );
    return res.status(201).json({ message: 'Resource uploaded' });
  } catch (error) {
    return next(error);
  }
}
