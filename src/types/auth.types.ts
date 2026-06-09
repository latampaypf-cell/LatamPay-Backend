export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  created_at?: Date;
}
