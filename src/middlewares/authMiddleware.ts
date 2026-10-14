import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { UnauthorizedError } from '../domain/errors/AppErrors';

const authService = new AuthService();

export async function requireAuth(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Token de autenticación requerido.');
    }

    const token = authHeader.split(' ')[1];
    const isValid = await authService.verifyToken(token);

    if (!isValid) {
      throw new UnauthorizedError('Token inválido o expirado.');
    }

    next();
  } catch (error) {
    next(error);
  }
}
