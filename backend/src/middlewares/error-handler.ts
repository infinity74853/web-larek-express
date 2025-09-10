import { NextFunction, Request, Response } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

const errorHandler = (
  err: CustomError,
  _req: Request,
  res: Response,
  _next: NextFunction,
): Response => {
  // Берём статус из ошибки, если нет — 500
  const statusCode = err.statusCode || 500;

  // Берём сообщение из ошибки, если нет — общее
  const message = err.message || 'На сервере произошла ошибка';

  // Отправляем только это — больше НИЧЕГО не делаем
  return res.status(statusCode).json({ message });
};

export default errorHandler;
