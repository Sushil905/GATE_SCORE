import { query } from '../config/db.js';

export async function getResources(req, res, next) {
  try {
    const { subject } = req.query;
    const rows = subject
      ? await query(
          `SELECT
             r.id,
             s.subject_name AS subject,
             r.title,
             r.resource_type AS type,
             r.resource_url AS url,
             t.topic_name,
             COALESCE(t.difficulty, 'medium') AS difficulty,
             r.is_free,
             r.created_at
           FROM resources r
           JOIN subjects s ON s.id = r.subject_id
           LEFT JOIN topics t ON t.id = r.topic_id
           WHERE s.subject_name = ?
           ORDER BY r.created_at DESC`,
          [subject]
        )
      : await query(
          `SELECT
             r.id,
             s.subject_name AS subject,
             r.title,
             r.resource_type AS type,
             r.resource_url AS url,
             t.topic_name,
             COALESCE(t.difficulty, 'medium') AS difficulty,
             r.is_free,
             r.created_at
           FROM resources r
           JOIN subjects s ON s.id = r.subject_id
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
    if (!subject || !title || !url) {
      return res.status(400).json({ message: 'Subject, title, and URL are required' });
    }

    const [subjectRow] = await query('SELECT id FROM subjects WHERE subject_name = ? LIMIT 1', [subject]);
    if (!subjectRow) return res.status(400).json({ message: 'Subject not found' });

    const resourceUrl = req.file ? `/uploads/${req.file.filename}` : url;
    await query(
      `INSERT INTO resources
       (subject_id, topic_id, title, resource_type, resource_url, is_free, uploaded_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        subjectRow.id,
        topicId || null,
        title,
        type || 'notes',
        resourceUrl,
        isPremium ? false : true,
        req.user.id
      ]
    );
    return res.status(201).json({ message: 'Resource uploaded' });
  } catch (error) {
    return next(error);
  }
}
