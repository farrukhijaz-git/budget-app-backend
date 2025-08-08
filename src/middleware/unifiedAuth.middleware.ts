import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import admin from 'firebase-admin';
import { AuthUser } from '../@types/express';
import User from '../models/User';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

export default async function unifiedAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  console.log('[unifiedAuth] Token length:', token.length);
  console.log('[unifiedAuth] Token starts with:', token.substring(0, 50));

  try {
    // First, try to decode as a local JWT token
    try {
      console.log('[unifiedAuth] Trying JWT verification...');
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      if (decoded.id) {
        console.log('[unifiedAuth] JWT verification successful:', { id: decoded.id, email: decoded.email });
        // This is a local JWT token
        let email = decoded.email;
        let name = decoded.name;
        
        // If email is missing from token, fetch from database
        if (!email) {
          const user = await User.findById(decoded.id);
          email = user?.email || '';
          name = user?.name || name;
        }
        
        req.user = {
          uid: decoded.id,
          email: email,
          name: name || undefined,
        };
        return next();
      }
    } catch (jwtError) {
      console.log('[unifiedAuth] JWT verification failed:', jwtError instanceof Error ? jwtError.message : String(jwtError));
      // JWT verification failed, try Firebase
    }

    // If JWT verification fails, try Firebase ID token
    try {
      console.log('[unifiedAuth] Trying Firebase verification...');
      console.log('[unifiedAuth] Firebase app initialized:', !!admin.app());
      console.log('[unifiedAuth] Firebase auth available:', !!admin.auth());
      
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log('[unifiedAuth] Firebase verification successful:', { 
        uid: decodedToken.uid, 
        email: decodedToken.email,
        name: decodedToken.name 
      });
      
      if (!decodedToken.uid || !decodedToken.email) {
        return res.status(401).json({ message: 'Invalid token: missing uid or email' });
      }
      
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        name: decodedToken.name || undefined,
      };
      return next();
    } catch (firebaseError) {
      console.error('[unifiedAuth] Firebase verification failed:', firebaseError instanceof Error ? firebaseError.message : String(firebaseError));
      // Both token types failed
      return res.status(401).json({ 
        message: 'Invalid token - not a valid JWT or Firebase token',
        details: {
          jwt: 'JWT verification failed',
          firebase: firebaseError instanceof Error ? firebaseError.message : String(firebaseError)
        }
      });
    }

  } catch (error) {
    console.error('[unifiedAuth] Unexpected error:', error);
    return res.status(401).json({ message: 'Token verification failed', error });
  }
}
