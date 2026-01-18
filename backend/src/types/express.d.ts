declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string | null;
        lastName: string | null;
        displayName: string | null;
        avatar: string | null;
        authProvider: string;
        isVerified: boolean;
        createdAt: Date;
      };
    }
  }
}

export {};
