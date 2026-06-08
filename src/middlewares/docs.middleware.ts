import { Request, Response, NextFunction } from 'express';
import { config } from '../config';

export function docsAuth(req: Request, res: Response, next: NextFunction): void {
  if (!config.isProduction) return next();

  const authHeader = req.headers.authorization ?? '';
  const b64 = authHeader.startsWith('Basic ') ? authHeader.slice(6) : '';
  const [user, pass] = Buffer.from(b64, 'base64').toString().split(':');

  if (config.docsUser && config.docsPass && user === config.docsUser && pass === config.docsPass) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="API Docs"');
  res.status(401).send('Acceso denegado');
}
