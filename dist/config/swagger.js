"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setupSwagger = void 0;
const swagger_jsdoc_1 = __importDefault(require("swagger-jsdoc"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'DehqonYordamchisi API',
            version: '1.0.0',
            description: 'AgriTech Marketplace API documentation for DehqonYordamchisi project.',
        },
        servers: [
            {
                url: 'http://localhost:5000',
                description: 'Development server',
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                },
            },
            schemas: {
                User: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        name: { type: 'string' },
                        phone: { type: 'string' },
                        role: { type: 'string', enum: ['FARMER', 'BUYER', 'ADMIN'] },
                        region: { type: 'string' },
                        image: { type: 'string', nullable: true },
                        isBlocked: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Product: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        title: { type: 'string' },
                        price: { type: 'number' },
                        quantity: { type: 'number' },
                        image: { type: 'string', nullable: true },
                        region: { type: 'string' },
                        category: { type: 'string', enum: ['MEVA', 'SABZAVOT', 'POLIZ', 'DONLI', 'BOSHQA'] },
                        farmerId: { type: 'string' },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Order: {
                    type: 'object',
                    properties: {
                        id: { type: 'string', format: 'uuid' },
                        buyerId: { type: 'string' },
                        productId: { type: 'string' },
                        status: { type: 'string', enum: ['PENDING', 'ACCEPTED', 'REJECTED'] },
                        createdAt: { type: 'string', format: 'date-time' },
                    },
                },
                Error: {
                    type: 'object',
                    properties: {
                        message: { type: 'string' },
                        errors: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    field: { type: 'string' },
                                    message: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
        security: [
            {
                bearerAuth: [],
            },
        ],
    },
    apis: ['./src/routes/*.ts', './src/controllers/*.ts'], // Path to the API docs
};
const swaggerSpec = (0, swagger_jsdoc_1.default)(options);
const setupSwagger = (app) => {
    app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swaggerSpec));
    console.log('Swagger docs available at http://localhost:5000/api-docs');
};
exports.setupSwagger = setupSwagger;
//# sourceMappingURL=swagger.js.map