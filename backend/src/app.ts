import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import { errors } from 'celebrate';
import { requestLogger, errorLogger } from './middlewares/logger';
import errorHandler from './middlewares/error-handler';
import routes from './routes/index';
import MONGODB_URI from './utils/constants';

dotenv.config();

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
const app = express();

// читаем origin фронтенда из переменных окружения или дефолт
const FRONTEND_ORIGIN = process.env.VITE_API_ORIGIN || 'http://localhost:5173';

app.use(cors({
  origin: FRONTEND_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Логгер запросов
app.use(requestLogger);

// Статические файлы
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Подключение роутов
app.use(routes);

// Health-check
app.get('/', (_req, res) => {
  res.json({ message: 'Сервер работает' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ message: 'Запрошенный ресурс не найден' });
});

// Логгер ошибок
app.use(errorLogger);

// Celebrate ошибки
app.use(errors());

// Централизованный обработчик ошибок
app.use(errorHandler);

// Подключение к MongoDB и запуск
mongoose.connect(MONGODB_URI)
  .then(() => {
    app.listen(PORT);
  })
  .catch(() => {
    process.exit(1);
  });

export default app;
