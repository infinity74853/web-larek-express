import { celebrate, Joi, Segments } from 'celebrate';

// Валидация ID в URL
export const validateObjId = celebrate({
  [Segments.PARAMS]: Joi.object().keys({
    productId: Joi.string().hex().length(24).required()
      .messages({
        'string.base': 'ID должен быть строкой',
        'string.length': 'ID должен быть 24 символа',
        'string.hex': 'ID должен быть в hex формате',
        'any.required': 'ID обязателен',
      }),
  }),
});

// Валидация тела при создании продукта
export const validateProductBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).required()
      .messages({
        'string.min': 'Название должно быть не менее 2 символов',
        'string.max': 'Название должно быть не более 30 символов',
        'any.required': 'Поле "title" обязательно',
      }),
    image: Joi.object({
      fileName: Joi.string().required().messages({
        'any.required': 'fileName в image обязателен',
      }),
      originalName: Joi.string().required().messages({
        'any.required': 'originalName в image обязателен',
      }),
    }).required().messages({
      'any.required': 'Поле "image" обязательно',
    }),
    category: Joi.string().required().messages({
      'any.required': 'Поле "category" обязательно',
    }),
    description: Joi.string().allow('').optional(),
    price: Joi.number().min(0).optional().allow(null),
  }),
});

// Валидация тела при обновлении продукта
export const validateProductUpdateBody = celebrate({
  [Segments.BODY]: Joi.object().keys({
    title: Joi.string().min(2).max(30).optional(),
    image: Joi.object({
      fileName: Joi.string().optional(),
      originalName: Joi.string().optional(),
    }).optional(),
    category: Joi.string().optional(),
    description: Joi.string().optional(),
    price: Joi.number().min(0).optional().allow(null),
  }).min(1).messages({
    'object.min': 'Должно быть передано хотя бы одно поле для обновления',
  }),
});
