import { describe, it, expect, vi } from 'vitest';
import { sendEmail } from '../services/email.service';
import config from '../config';

// Mockeamos el logger para no ensuciar la salida de los tests
console.log = vi.fn();
console.warn = vi.fn();

describe('EmailService', () => {
  it('debería ejecutar sendEmail sin errores en modo Mock', async () => {
    // Si config.enableEmailMock es true (por defecto en tests), debería usar MockEmailProvider
    await expect(sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Body'
    })).resolves.not.toThrow();
  });

  it('debería imprimir en consola cuando se envía un correo en modo Mock', async () => {
    const logSpy = vi.spyOn(console, 'log');
    
    await sendEmail({
      to: 'test@example.com',
      subject: 'Test Subject',
      text: 'Test Body'
    });

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('--- MOCK EMAIL'));
    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining('To: test@example.com'));
  });
});
