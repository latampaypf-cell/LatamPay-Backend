import { vi } from 'vitest';

export const createMockPool = () => ({
  connect: vi.fn(),
  query: vi.fn(),
});

export const createMockClient = () => ({
  query: vi.fn(),
  release: vi.fn(),
});

export const mockUser = {
  id: 'user-123',
  email: 'test@test.com',
  name: 'Test User',
  role: 'user' as const,
};

export const mockWallet = {
  id: 'wallet-123',
  user_id: 'user-123',
  cbu: '1234567890123456789012',
  alias: 'test.alias',
};
