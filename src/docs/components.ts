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
        alias: { type: 'string', example: 'mi.alias.pago', nullable: true },
        cbu: { type: 'string', example: '1234567890123456789012', nullable: true },
        created_at: { type: 'string', format: 'date-time' },
      },
    },
    Balance: {
      type: 'object',
      properties: {
        currency_code: { type: 'string', example: 'ARS' },
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
    ExchangeRate: {
      type: 'object',
      properties: {
        from_currency: { type: 'string', example: 'ARS' },
        to_currency: { type: 'string', example: 'COP' },
        rate: { type: 'number', example: 5.25 },
        updated_at: { type: 'string', format: 'date-time' },
      },
    },
    SupportResponse: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'success' },
        data: {
          type: 'object',
          properties: {
            reply: { type: 'string', example: 'Hola, ¿en qué puedo ayudarte?' },
            updatedHistory: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'model'] },
                  text: { type: 'string' },
                },
              },
            },
          },
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
        fee: { type: 'number', example: 15.50, description: 'Comisión cobrada por la plataforma (3%)' },
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
