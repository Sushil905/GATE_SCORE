import jwt from 'jsonwebtoken';

const secret = () => process.env.JWT_SECRET || 'dev-gate-score-secret';

export function signToken(user) {
  return jwt.sign({ id: user.id, email: user.email, role: user.role }, secret(), { expiresIn: '7d' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    req.user = jwt.verify(token, secret());
    return next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
}

export function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' });
  }

  return next();
}
