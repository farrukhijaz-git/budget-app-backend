import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (!decoded.id) {
      return res.status(401).json({ message: 'Invalid token: missing user id' });
    }
    req.user = {
      uid: decoded.id,
      email: decoded.email || '', // Make email optional for backwards compatibility
      name: decoded.name || undefined,
    };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};
