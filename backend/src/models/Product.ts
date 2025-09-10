import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IProduct extends Document {
  _id: Types.ObjectId;
  title: string;
  image: {
    fileName: string;
    originalName: string;
  };
  category: string;
  description?: string;
  price: number | null;
}

const productSchema: Schema = new Schema({
  title: {
    type: String,
    required: [true, 'Поле "title" должно быть заполнено'],
    unique: true,
    minlength: [2, 'Минимальная длина поля "title" - 2'],
    maxlength: [30, 'Максимальная длина поля "title" - 30'],
    trim: true,
  },
  image: {
    fileName: {
      type: String,
      required: [true, 'Поле "fileName" обязательно'],
    },
    originalName: {
      type: String,
      required: [true, 'Поле "originalName" обязательно'],
    },
  },
  category: {
    type: String,
    required: [true, 'Поле "category" обязательно'],
    trim: true,
  },
  description: {
    type: String,
    maxlength: [200, 'Максимальная длина описания - 200 символов'],
    trim: true,
    default: '',
  },
  price: {
    type: Number,
    min: [0, 'Цена не может быть отрицательной'],
    default: null,
    validate: {
      validator(value: number | null) {
        return value === null || value >= 0;
      },
      message: 'Цена должна быть положительным числом или null',
    },
  },
}, {
  timestamps: true,
});

export default mongoose.model<IProduct>('product', productSchema);
