import bcrypt from 'bcryptjs';
import { query } from '../config/db.js';
import { signToken } from '../middleware/authMiddleware.js';

export async function register(req, res, next) {
  try {
    const { name, email, password, branch, targetExamDate } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const targetYear = targetExamDate ? new Date(targetExamDate).getFullYear() : new Date().getFullYear() + 1;
    await query(
      'INSERT INTO users (full_name, email, password, branch, target_year) VALUES (?, ?, ?, ?, ?)',
      [name, email, passwordHash, branch || 'Computer Science Engineering', targetYear]
    );
    const [user] = await query(
      'SELECT id, full_name AS name, email, role, branch, target_year FROM users WHERE email = ?',
      [email]
    );
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
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const safeUser = {
      id: user.id,
      name: user.full_name,
      email: user.email,
      role: user.role,
      branch: user.branch,
      target_year: user.target_year
    };
    return res.json({ user: safeUser, token: signToken(user) });
  } catch (error) {
    return next(error);
  }
}
