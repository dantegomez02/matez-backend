import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { ValidationError } from '../domain/errors/AppErrors';

const authService = new AuthService();

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { password } = req.body;

      if (!password || typeof password !== 'string') {
        throw new ValidationError('La contraseña es requerida.');
      }

      const session = await authService.login(password);

      res.json({
        success: true,
        message: 'Sesión iniciada correctamente.',
        data: session
      });
    } catch (error) {
      next(error);
    }
  }

  static async verify(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.json({ success: false, authenticated: false });
        return;
      }

      const token = authHeader.split(' ')[1];
      const isValid = await authService.verifyToken(token);

      res.json({
        success: true,
        authenticated: isValid
      });
    } catch (error) {
      next(error);
    }
  }
}
