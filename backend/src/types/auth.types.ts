export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export interface AuthRequest extends Express.Request {
  user?: {
    id: string;
    email: string;
    role: string;
    displayName?: string;
    avatar?: string;
  };
}
