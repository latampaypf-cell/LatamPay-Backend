export const TEST_USER = {
  id: 'user-123',
  email: 'test@latampay.com',
  name: 'Test User',
  role: 'user' as const,
};

export const TEST_ADMIN = {
  id: 'admin-123',
  email: 'admin@latampay.com',
  name: 'Admin User',
  role: 'admin' as const,
};

export const TEST_WALLET = {
  id: 'wallet-123',
  user_id: 'user-123',
  cbu: '1234567890123456789012',
  alias: 'test.alias',
};

export const TEST_TOKEN = 'mocked_token_string';

export const ENV_VARS = {
  EXCHANGE_RATE_API_KEY: 'mock_api_key_for_testing',
  JWT_SECRET: 'a_very_long_and_secure_secret_for_testing_32_chars',
  DATABASE_URL: 'postgresql://localhost:5432/mock_db',
};
