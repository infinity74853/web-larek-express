import { Request, Response, NextFunction } from 'express';
import { Error as MongooseError } from 'mongoose';
import Product from '../models/Product';
import { BadRequestError, ConflictError, NotFoundError } from './errors';

export const getProducts = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const products = await Product.find();
    res.status(200).json({
      items: products,
      total: products.length,
    });
  } catch (error) {
    next(error);
  }
};

export const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const {
      title, image, category, description, price,
    } = req.body;

    if (!title || !image || !image.fileName || !image.originalName || !category) {
      throw new BadRequestError('Отсутствуют обязательные поля: title, image{fileName, originalName}, category');
    }

    const newProduct = new Product({
      title,
      image,
      category,
      description: description || '',
      price: price !== undefined ? price : null,
    });

    const savedProduct = await newProduct.save();
    res.status(201).json(savedProduct);
  } catch (error: any) {
    if (error.code === 11000) {
      next(new ConflictError('Товар с таким названием уже существует'));
    } else if (error instanceof MongooseError.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при создании товара'));
    } else {
      next(error);
    }
  }
};

export const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      productId,
      req.body,
      { new: true, runValidators: true },
    );

    if (!updatedProduct) {
      throw new NotFoundError('Товар не найден');
    }

    res.json(updatedProduct);
  } catch (error: any) {
    if (error instanceof MongooseError.ValidationError) {
      next(new BadRequestError('Ошибка валидации данных при обновлении товара'));
    } else {
      next(error);
    }
  }
};

export const deleteProduct = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { productId } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(productId);
    if (!deletedProduct) {
      throw new NotFoundError('Товар не найден');
    }

    res.json({ message: 'Товар успешно удалён' });
  } catch (error) {
    next(error);
  }
};
