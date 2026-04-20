import { body } from 'express-validator';

export const registerValidator = [
  body('name').notEmpty().withMessage('Name is required').trim(),
  body('phone')
    .matches(/^\+998\s?\d{2}\s?\d{3}\s?\d{2}\s?\d{2}$|^\+998\d{9}$/)
    .withMessage('Phone number must be in format +998XXXXXXXXX'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .isIn(['FARMER', 'BUYER', 'ADMIN'])
    .withMessage('Invalid role'),
  body('region').notEmpty().withMessage('Region is required').trim(),
];

export const loginValidator = [
  body('phone')
    .matches(/^\+998\d{9}$/)
    .withMessage('Phone number must be in format +998XXXXXXXXX'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const productValidator = [
  body('title').notEmpty().withMessage('Product title is required'),
  body('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
  body('region').notEmpty().withMessage('Region is required'),
  body('category')
    .isIn(['MEVA', 'SABZAVOT', 'POLIZ', 'DONLI', 'BOSHQA'])
    .withMessage('Invalid category'),
];
