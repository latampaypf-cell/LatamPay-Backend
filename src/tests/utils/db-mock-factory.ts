import { vi } from 'vitest';

export const createMockClient = () => {
  return {
    query: vi.fn(),
    release: vi.fn(),
  };
};

export const createMockPool = () => {
  const mClient = createMockClient();
  return {
    connect: vi.fn(() => mClient),
    query: vi.fn(),
    mClient, // Exportamos para facilitar el acceso en los tests
  };
};
