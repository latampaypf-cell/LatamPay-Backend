import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendEmail } from '../services/email.service';
import config from '../config';

// Mockeamos el config para controlar los tests
vi.mock('../config', () => ({
  default: {
    aws: {
      region: 'us-east-1',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      fromEmail: 'noreply@test.com',
    },
    enableEmailMock: true,
  },
  config: {
    aws: {
      region: 'us-east-1',
      accessKeyId: 'test-key',
      secretAccessKey: 'test-secret',
      fromEmail: 'noreply@test.com',
    },
    enableEmailMock: true,
  }
}));

describe('Servicio de Email', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Espiamos el console.log para verificar los mocks
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  it('debería registrar el email mock cuando enableEmailMock es true', async () => {
    await sendEmail({
      to: 'user@test.com',
      subject: 'Test Subject',
      text: 'Test Content'
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- MOCK EMAIL (DEV MODE) ---'));
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('To: user@test.com'));
  });

  it('debería manejar la falta de credenciales usando el mock como respaldo', async () => {
    // Forzamos que no haya credenciales
    (config as any).aws.accessKeyId = undefined;
    
    await sendEmail({
      to: 'user@test.com',
      subject: 'Test Subject',
      text: 'Test Content'
    });

    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('--- MOCK EMAIL (DEV MODE) ---'));
  });
});
