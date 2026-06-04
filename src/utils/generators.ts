/**
 * Genera un CBU simulado aleatorio de 22 dígitos.
 */
export const generateCBU = (): string => {
  let cbu = '';
  for (let i = 0; i < 22; i++) {
    cbu += Math.floor(Math.random() * 10).toString();
  }
  return cbu;
};

/**
 * Genera un alias simulado único (Ej: latampay.facundo.123).
 */
export const generateAlias = (name: string): string => {
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const randomSuffix = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `latampay.${cleanName}.${randomSuffix}`;
};