import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import Product from '../models/Product';
import { BadRequestError } from './errors';
import { IOrderResponse } from '../types/order';

const createOrder = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      payment, email, phone, address, total, items,
    } = req.body;

    if (!items || items.length === 0) {
      throw new BadRequestError('Заказ не содержит товаров');
    }

    const itemIds: string[] = items as string[];

    // Подсчитываем количество каждого ID
    const itemCounts = itemIds.reduce((acc, id) => {
      acc[id] = (acc[id] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Уникальные ID для поиска
    const uniqueItemIds = Object.keys(itemCounts);

    // Ищем товары
    const products = await Product.find({ _id: { $in: uniqueItemIds } });

    // Проверка: все ли ID существуют
    if (products.length !== uniqueItemIds.length) {
      const foundIds = products.map((p) => p._id.toString());
      const missingIds = uniqueItemIds.filter((id) => !foundIds.includes(id));
      throw new BadRequestError(`Некоторые товары не найдены: ${missingIds.join(', ')}`);
    }

    // Проверка: все ли товары продаются (price !== null)
    const notForSale = products.filter((p) => p.price === null);
    if (notForSale.length > 0) {
      const notForSaleIds = notForSale.map((p) => p._id.toString());
      throw new BadRequestError(`Следующие товары не продаются: ${notForSaleIds.join(', ')}`);
    }

    // Считаем итоговую сумму с учётом количества
    const calculatedTotal = products.reduce((sum, product) => {
      const count = itemCounts[product._id.toString()];
      return sum + (product.price! * count);
    }, 0);

    // Проверка совпадения суммы
    if (Math.abs(calculatedTotal - total) > 0.01) {
      throw new BadRequestError(
        `Неверная общая сумма заказа. Ожидалось: ${calculatedTotal}, получено: ${total}`,
      );
    }

    const orderResponse: IOrderResponse = {
      id: randomUUID(),
      total: calculatedTotal,
      payment,
      email,
      phone,
      address,
      items: itemIds, // возвращаем оригинальный массив, как есть
    };

    res.status(201).json(orderResponse);
  } catch (error) {
    next(error);
  }
};

export default createOrder;
