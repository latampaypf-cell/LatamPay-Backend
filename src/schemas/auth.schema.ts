import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string({ message: 'El nombre es obligatorio.' })
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.'),
  email: z.string({ message: 'El correo electrónico es obligatorio.' })
    .email('El formato del email no es válido.') 
    .max(255, 'El email no puede superar los 255 caracteres.'),
  password: z.string({ message: 'La contraseña es obligatoria.' })
    .min(8, 'La contraseña debe tener al menos 8 caracteres.')
    .max(100, 'La contraseña no puede superar los 100 caracteres.'),
});

export const loginSchema = z.object({
  email: z.string({ message: 'El correo electrónico es obligatorio.' })
    .email('El formato del email no es válido.'), 
  password: z.string({ message: 'La contraseña es obligatoria.' })
    .min(1, 'La contraseña es requerida.'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;