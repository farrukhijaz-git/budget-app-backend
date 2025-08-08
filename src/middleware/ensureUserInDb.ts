
import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const ensureUserInDb = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    console.log('[ensureUserInDb] Starting middleware...');
    
    if (!req.user) {
      console.log('[ensureUserInDb] No user in request');
      return res.status(400).json({ message: 'Missing user info from auth token.' });
    }
    
    const { uid, email, name } = req.user;
    console.log('[ensureUserInDb] User info:', { uid, email, name });
    
    if (!uid || !email) {
      console.log('[ensureUserInDb] Missing uid or email');
      return res.status(400).json({ 
        message: 'Missing user info from auth token.',
        received: { uid, email, name }
      });
    }

    console.log('[ensureUserInDb] About to check database for user...');
    
    // First, try to find user by ID
    let user = await User.findById(uid);
    console.log('[ensureUserInDb] User found by ID:', !!user);
    
    if (!user) {
      console.log('[ensureUserInDb] User not found by ID, checking by email...');
      // User doesn't exist with this ID, check if email already exists
      const existingUserByEmail = await User.findOne({ email });
      console.log('[ensureUserInDb] User found by email:', !!existingUserByEmail);
      
      if (existingUserByEmail) {
        // Email exists with different ID - this means it's a mismatch
        // For JWT tokens, we should use the existing user with this email
        console.log('[ensureUserInDb] Email exists with different ID, using existing user');
        user = existingUserByEmail;
        
        // Update the req.user.uid to match the database user
        req.user.uid = existingUserByEmail._id;
        console.log('[ensureUserInDb] Updated req.user.uid to:', existingUserByEmail._id);
      } else {
        console.log('[ensureUserInDb] Creating new user...');
        // Create new user with the provided ID
        user = await User.create({
          _id: uid,
          email,
          name: name || ''
        });
        console.log('[ensureUserInDb] Created new user:', user);
      }
    } else {
      console.log('[ensureUserInDb] User exists, checking for updates...');
      // User exists, update name/email if needed
      if (user.email !== email || user.name !== name) {
        console.log('[ensureUserInDb] Updating user info...');
        user = await User.findByIdAndUpdate(
          uid,
          { $set: { email, name: name || user.name } },
          { new: true }
        );
        console.log('[ensureUserInDb] Updated existing user:', user);
      } else {
        console.log('[ensureUserInDb] User info up to date, no changes needed');
      }
    }
    
    console.log('[ensureUserInDb] Calling next()...');
    next();
  } catch (err) {
    console.error('[ensureUserInDb] Error caught:', err);
    res.status(500).json({ 
      message: 'Failed to ensure user in DB.', 
      error: err instanceof Error ? err.message : String(err) 
    });
  }
};
