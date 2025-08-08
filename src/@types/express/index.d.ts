// src/@types/express/index.d.ts

// src/@types/express/index.d.ts

export interface AuthUser {
  uid: string;
  email: string;
  name?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
    }
  }
}
