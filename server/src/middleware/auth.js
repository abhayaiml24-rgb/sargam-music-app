import jwt from 'jsonwebtoken';

const read = (req) => {
  const header = req.headers.authorization || '';
  return header.startsWith('Bearer ') ? header.slice(7) : null;
};

export const auth = (req, res, next) => {
  const token = read(req);
  if (!token) return res.status(401).json({ error: 'Please log in to do that.' });
  try {
    req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    next();
  } catch {
    res.status(401).json({ error: 'Your session expired. Please log in again.' });
  }
};

// Attaches req.userId when a valid token is present, but never blocks.
export const optionalAuth = (req, _res, next) => {
  const token = read(req);
  if (token) {
    try {
      req.userId = jwt.verify(token, process.env.JWT_SECRET).id;
    } catch {
      /* ignore */
    }
  }
  next();
};

export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

export const httpError = (status, message) => Object.assign(new Error(message), { status });
