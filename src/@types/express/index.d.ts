// src/@types/express/index.d.ts
import { UserDocument } from '../../models/User'; // or whatever your user type is

declare global {
  namespace Express {
    interface Request {
      user?: UserDocument; // or use: { id: string } if simpler
    }
  }
}
