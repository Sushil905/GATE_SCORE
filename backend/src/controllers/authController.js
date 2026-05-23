import bcrypt from 'bcryptjs';
import { signToken } from '../auth.js';
import { query } from '../db.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, targetExamDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await query(
      'INSERT INTO users (name, email, password_hash, target_exam_date) VALUES (?, ?, ?, ?)',
      [name, email, passwordHash, targetExamDate || null]
    );
    const [user] = await query('SELECT id, name, email, role, target_exam_date FROM users WHERE email = ?', [email]);
    return res.status(201).json({ user, token: signToken(user) });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: 'Email is already registered' });
    }
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const [user] = await query('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      target_exam_date: user.target_exam_date
    };
    return res.json({ user: safeUser, token: signToken(user) });
  } catch (error) {
    return next(error);
  }
}
