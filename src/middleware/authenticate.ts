import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const authenticate = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    if (!decodedToken.uid || !decodedToken.email) {
      return res.status(401).json({ message: 'Invalid token: missing uid or email' });
    }
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      name: decodedToken.name || undefined,
    };
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};
