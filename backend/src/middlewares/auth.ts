import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError } from '../controllers/errors';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';

const auth = (req: Request, _res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return next(new UnauthorizedError('Требуется авторизация'));
  }

  const token = authHeader.replace('Bearer ', '');

  try {
    const payload = jwt.verify(token, JWT_ACCESS_SECRET) as JwtPayload & { _id: string };
    req.user = { _id: payload._id };
    return next();
  } catch {
    return next(new UnauthorizedError('Неверный токен'));
  }
};

export default auth;
