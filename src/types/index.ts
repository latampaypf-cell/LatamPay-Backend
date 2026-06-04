import { Request } from 'express';

// Define la estructura exacta de lo que guardas dentro de tu token JWT
export interface JwtPayload {
  id: string;
  email: string;
  role: string;
}

// Extiende la Request de Express para que acepte el usuario autenticado
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}