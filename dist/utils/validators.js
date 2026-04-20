"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.productValidator = exports.loginValidator = exports.registerValidator = void 0;
const express_validator_1 = require("express-validator");
exports.registerValidator = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').trim(),
    (0, express_validator_1.body)('phone')
        .matches(/^\+998\d{9}$/)
        .withMessage('Phone number must be in format +998XXXXXXXXX'),
    (0, express_validator_1.body)('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    (0, express_validator_1.body)('role')
        .isIn(['FARMER', 'BUYER', 'ADMIN'])
        .withMessage('Invalid role'),
    (0, express_validator_1.body)('region').notEmpty().withMessage('Region is required').trim(),
];
exports.loginValidator = [
    (0, express_validator_1.body)('phone')
        .matches(/^\+998\d{9}$/)
        .withMessage('Phone number must be in format +998XXXXXXXXX'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required'),
];
exports.productValidator = [
    (0, express_validator_1.body)('title').notEmpty().withMessage('Product title is required'),
    (0, express_validator_1.body)('price').isFloat({ gt: 0 }).withMessage('Price must be a positive number'),
    (0, express_validator_1.body)('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be a positive number'),
    (0, express_validator_1.body)('region').notEmpty().withMessage('Region is required'),
    (0, express_validator_1.body)('category')
        .isIn(['MEVA', 'SABZAVOT', 'POLIZ', 'DONLI', 'BOSHQA'])
        .withMessage('Invalid category'),
];
//# sourceMappingURL=validators.js.map