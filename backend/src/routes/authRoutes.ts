import express from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import {
  register, login, logout, getUser,
  refreshToken,
} from '../controllers/authController';
import auth from '../middlewares/auth';

const router = express.Router();

const validateRegister = celebrate({
  [Segments.BODY]: Joi.object().keys({
    name: Joi.string().optional(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  }),
});

const validateLogin = celebrate({
  [Segments.BODY]: Joi.object().keys({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
});

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/logout', logout);
router.get('/user', auth, getUser);
router.get('/token', refreshToken);

export default router;
