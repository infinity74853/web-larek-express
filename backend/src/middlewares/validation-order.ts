import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';

const validateOrderBody = (req: Request, res: Response, next: NextFunction) => {
  const schema = Joi.object({
    payment: Joi.string().valid('online', 'card').required().messages({
      'any.only': 'payment должен быть "online" или "card"',
      'any.required': 'Поле "payment" обязательно',
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Некорректный email',
      'any.required': 'Поле "email" обязательно',
    }),
    phone: Joi.string().pattern(/^\+?[\d\s\-()]{10,20}$/).required().messages({
      'string.pattern.base': 'Некорректный формат телефона',
      'any.required': 'Поле "phone" обязательно',
    }),
    address: Joi.string().min(5).required().messages({
      'string.min': 'Адрес должен быть не менее 5 символов',
      'any.required': 'Поле "address" обязательно',
    }),
    total: Joi.number().min(0).required().messages({
      'number.min': 'Сумма не может быть отрицательной',
      'any.required': 'Поле "total" обязательно',
    }),
    items: Joi.array()
      .items(
        Joi.string().hex().length(24).required()
          .messages({
            'string.hex': 'ID товара должен быть в hex формате',
            'string.length': 'ID товара должен быть 24 символа',
          }),
      )
      .min(1)
      .required()
      .messages({
        'array.min': 'Должен быть хотя бы один товар',
        'any.required': 'Поле "items" обязательно',
      }),
  });

  const { error } = schema.validate(req.body, { abortEarly: false });

  if (error) {
    res.status(400).json({
      message: 'Validation failed',
      validation: {
        body: error.details.map((detail) => ({
          source: 'body',
          keys: detail.path,
          message: detail.message,
        })),
      },
    });
    return;
  }

  next();
};

export default validateOrderBody;
