export const swaggerComponents = {
  securitySchemes: {
    bearerAuth: {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
    },
  },
  schemas: {
    Error: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'fail' },
        message: { type: 'string', example: 'Descripción del error' },
      },
    },
    User: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        name: { type: 'string' },
        email: { type: 'string', format: 'email' },
        role: { type: 'string', enum: ['user', 'admin'] },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
    Balance: {
      type: 'object',
      properties: {
        currency: { type: 'string', example: 'ARS' },
        amount: { type: 'number', example: 1250.50 },
      },
    },
    Wallet: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        cbu: { type: 'string', example: '1234567890123456789012' },
        alias: { type: 'string', example: 'mi.alias.pago' },
        balances: {
          type: 'array',
          items: { $ref: '#/components/schemas/Balance' },
        },
      },
    },
    PaginationInfo: {
      type: 'object',
      properties: {
        totalItems: { type: 'integer' },
        totalPages: { type: 'integer' },
        currentPage: { type: 'integer' },
        limit: { type: 'integer' },
      },
    },
    Transaction: {
      type: 'object',
      properties: {
        id: { type: 'string', format: 'uuid' },
        type: { type: 'string', enum: ['deposit', 'withdraw', 'transfer', 'swap'] },
        status: { type: 'string', enum: ['pending', 'completed', 'failed'] },
        from_currency: { type: 'string' },
        to_currency: { type: 'string' },
        from_amount: { type: 'number' },
        to_amount: { type: 'number' },
        exchange_rate: { type: 'number', nullable: true },
        direction: { type: 'string', enum: ['sent', 'received'], nullable: true },
        description: { type: 'string', example: 'Pago Alquiler Junio' },
        from_name: { type: 'string', nullable: true },
        from_alias: { type: 'string', nullable: true },
        from_cbu: { type: 'string', nullable: true },
        to_name: { type: 'string', nullable: true },
        to_alias: { type: 'string', nullable: true },
        to_cbu: { type: 'string', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
  },
};
