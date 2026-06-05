import { describe, it, expect } from 'vitest';
import { generateCBU, generateAlias } from '../utils/generators';

describe('Generators Utility', () => {
  describe('generateCBU', () => {
    it('should generate a string of 22 digits', () => {
      const cbu = generateCBU();
      expect(cbu).toHaveLength(22);
      expect(cbu).toMatch(/^\d+$/);
    });

    it('should generate different CBUs on multiple calls', () => {
      const cbu1 = generateCBU();
      const cbu2 = generateCBU();
      expect(cbu1).not.toBe(cbu2);
    });
  });

  describe('generateAlias', () => {
    it('should generate a valid alias format', () => {
      const name = 'Facu';
      const alias = generateAlias(name);
      expect(alias).toMatch(/^latampay\.facu\.\d{3}$/);
    });

    it('should handle names with spaces and special characters', () => {
      const name = 'Juan Pérez 123!';
      const alias = generateAlias(name);
      expect(alias).toMatch(/^latampay\.juanperez123\.\d{3}$/);
    });
  });
});
