import { Request, Response, NextFunction } from 'express';
import { AppError } from '../domain/errors/AppErrors';

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message
    });
    return;
  }

  console.error('💥 Error no controlado en el servidor:', err);

  res.status(500).json({
    success: false,
    message: 'Ocurrió un error interno en el servidor.'
  });
}
