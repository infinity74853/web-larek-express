import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { BadRequestError, ConflictError } from './errors';

const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || 'access_secret';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'refresh_secret';

const ACCESS_EXPIRES = '10m';
const REFRESH_EXPIRES = '7d';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      throw new ConflictError('Пользователь с таким email уже существует');
    }

    const user = await User.create({ name, email, password });

    return res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      throw new BadRequestError('Неверные email или пароль');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new BadRequestError('Неверные email или пароль');
    }

    const accessToken = jwt.sign(
      { _id: user._id },
      JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES },
    );

    const refreshToken = jwt.sign(
      { _id: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES },
    );

    user.refreshTokens.push(refreshToken);
    await user.save();

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    return res.json({
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      const error = new Error('Токен обновления не предоставлен');
      (error as any).statusCode = 204;
      return next(error);
    }

    const payload: any = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    const user = await User.findById(payload._id);

    if (!user) {
      const error = new Error('Пользователь не найден');
      (error as any).statusCode = 204;
      return next(error);
    }

    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== refreshToken,
    );
    await user.save();

    res.clearCookie('refreshToken');

    const success = new Error('Выход выполнен успешно');
    (success as any).statusCode = 204;
    return next(success);
  } catch (error) {
    return next(error);
  }
};

export const getUser = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).user._id;
    const user = await User.findById(userId);

    if (!user) {
      throw new BadRequestError('Пользователь не найден');
    }

    return res.json({
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    return next(error);
  }
};

export const refreshToken = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { refreshToken: oldRefreshToken } = req.cookies;

    if (!oldRefreshToken) {
      throw new BadRequestError('Токен обновления отсутствует');
    }

    let payload: any;
    try {
      payload = jwt.verify(oldRefreshToken, JWT_REFRESH_SECRET);
    } catch {
      throw new BadRequestError('Неверный Токен обновления');
    }

    const user = await User.findById(payload._id);
    if (!user || !user.refreshTokens.includes(oldRefreshToken)) {
      throw new BadRequestError('Токен недействителен');
    }

    const newAccessToken = jwt.sign(
      { _id: user._id },
      JWT_ACCESS_SECRET,
      { expiresIn: ACCESS_EXPIRES },
    );

    const newRefreshToken = jwt.sign(
      { _id: user._id },
      JWT_REFRESH_SECRET,
      { expiresIn: REFRESH_EXPIRES },
    );

    // Удаляем старый refresh token
    user.refreshTokens = user.refreshTokens.filter(
      (token) => token !== oldRefreshToken,
    );
    // Добавляем новый
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      maxAge: 7 * 24 * 3600 * 1000,
    });

    res.json({
      accessToken: newAccessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    next(error);
  }
};
