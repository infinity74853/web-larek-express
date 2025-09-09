import { NextFunction, Request, Response } from 'express';
import { isCelebrateError } from 'celebrate';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'На сервере произошла ошибка';

  // Обработка ошибок celebrate (валидация)
  if (isCelebrateError(err)) {
    statusCode = 400;
    const errorDetails: Array<{
      segment: string;
      message: string;
      details: Array<{ message: string; path: string }>;
    }> = [];

    err.details.forEach((joiError, segment) => {
      errorDetails.push({
        segment,
        message: joiError.message,
        details: joiError.details.map((detail) => ({
          message: detail.message,
          path: detail.path.join('.'),
        })),
      });
    });

    return res.status(statusCode).send({
      message: 'Ошибка валидации данных',
      errors: errorDetails,
    });
  }

  // Обработка ошибок Mongoose
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Ошибка валидации данных';
  }

  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Некорректный формат данных';
  }

  // Всегда возвращаем ответ
  return res.status(statusCode).send({ message });
};

export default errorHandler;
