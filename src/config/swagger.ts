import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DehqonYordamchisi API',
      version: '1.0.0',
      description: 'AgriTech Marketplace API documentation for DehqonYordamchisi project.',
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:5000',
        description: 'Current environment server',
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

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  const apiUrl = process.env.API_URL || 'http://localhost:5000';
  console.log(`Swagger docs available at ${apiUrl}/api-docs`);
};
