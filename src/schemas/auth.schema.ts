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

export const updateProfileSchema = z.object({
  name: z.string()
    .min(2, 'El nombre debe tener al menos 2 caracteres.')
    .max(100, 'El nombre no puede superar los 100 caracteres.')
    .optional(),
  alias: z.string()
    .min(4, 'El alias debe tener al menos 4 caracteres.')
    .max(50, 'El alias no puede superar los 50 caracteres.')
    .regex(/^[a-z0-9.]+$/, 'El alias solo puede contener minúsculas, números y puntos.')
    .optional(),
  currentPassword: z.string()
    .min(1, 'La contraseña actual es requerida para realizar cambios.')
    .optional(),
  newPassword: z.string()
    .min(8, 'La nueva contraseña debe tener al menos 8 caracteres.')
    .max(100, 'La nueva contraseña no puede superar los 100 caracteres.')
    .optional(),
}).refine(data => {
  // Si quiere cambiar contraseña, debe enviar ambas
  if (data.newPassword && !data.currentPassword) return false;
  return true;
}, {
  message: "Debes proporcionar la contraseña actual para establecer una nueva.",
  path: ["currentPassword"]
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;