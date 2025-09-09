const MONGODB_URI = process.env.DB_ADDRESS || 'mongodb://127.0.0.1:27017/weblarek';

export default MONGODB_URI;

// Эти константы используются на фронтенде, на бэкенде они не нужны
// export const API_URL = `${import.meta.env.VITE_API_ORIGIN}`;
// export const CDN_URL = `${import.meta.env.VITE_API_ORIGIN}`;

// Классы категорий тоже нужны только на фронтенде
// export const CATEGORY_CLASSES = {
//   'софт-скил': styles.card__category_soft,
//   'хард-скил': styles.card__category_hard,
//   'другое': styles.card__category_other,
//   'дополнительное': styles.card__category_additional,
//   'кнопка': styles.card__category_button,
// };
