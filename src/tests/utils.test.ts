import { describe, it, expect } from 'vitest';
import { generateCBU, generateAlias } from '../utils/generators';

describe('Utilidades de Generadores', () => {
  describe('generateCBU', () => {
    it('debería generar una cadena de 22 dígitos', () => {
      const cbu = generateCBU();
      expect(cbu).toHaveLength(22);
      expect(cbu).toMatch(/^\d+$/);
    });

    it('debería generar CBUs diferentes en múltiples llamadas', () => {
      const cbu1 = generateCBU();
      const cbu2 = generateCBU();
      expect(cbu1).not.toBe(cbu2);
    });
  });

  describe('generateAlias', () => {
    it('debería generar un formato de alias válido', () => {
      const name = 'Facu';
      const alias = generateAlias(name);
      expect(alias).toMatch(/^latampay\.facu\.\d{3}$/);
    });

    it('debería manejar nombres con espacios y caracteres especiales', () => {
      const name = 'Juan Pérez 123!';
      const alias = generateAlias(name);
      expect(alias).toMatch(/^latampay\.juanperez123\.\d{3}$/);
    });
  });
});
