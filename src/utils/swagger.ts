import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CVS Blogs API',
      version: '1.0.0',
      description: 'A production-grade REST API for a personal blog platform',
      contact: {
        name: 'CVS Charan',
      },
    },
    servers: [
      {
        url: 'http://localhost:8000/api/v1',
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
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.ts', './src/validators/*.ts'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(options);
