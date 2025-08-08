import { Request, Response, NextFunction } from 'express';
import User from '../models/User';
import { AuthUser } from '../@types/express';

interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export const getUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(req.user.uid);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: user._id,
      name: user.name,
      email: user.email,
      monthlyIncome: user.monthlyIncome || 0
    });
  } catch (error) {
    console.error('[getUserProfile] Error:', error);
    res.status(500).json({ message: 'Failed to get user profile' });
  }
};

export const updateUserProfile = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user?.uid) {
      return res.status(400).json({ message: 'User not authenticated' });
    }

    const { name, monthlyIncome } = req.body;
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.uid,
      { 
        $set: { 
          ...(name !== undefined && { name }),
          ...(monthlyIncome !== undefined && { monthlyIncome })
        }
      },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      uid: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      monthlyIncome: updatedUser.monthlyIncome || 0
    });
  } catch (error) {
    console.error('[updateUserProfile] Error:', error);
    res.status(500).json({ message: 'Failed to update user profile' });
  }
};
