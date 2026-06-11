import { z } from 'zod';

export const depositSchema = z.object({
  amount: z.number().positive('El monto debe ser mayor a cero.'),
  currency_code: z.string().min(3).max(10),
  description: z.string().max(100, 'La descripción es muy larga.').optional(),
});

export const swapSchema = z.object({
  from_currency: z.string().min(3).max(10),
  to_currency: z.string().min(3).max(10),
  amount: z.number().positive('El monto a cambiar debe ser mayor a cero.'),
  description: z.string().max(100, 'La descripción es muy larga.').optional(),
});

export const transferSchema = z.object({
  to_identifier: z.string().min(1, 'El CBU o Alias es obligatorio.'),
  amount: z.number().positive('El monto debe ser mayor a cero.'),
  currency_code: z.string().min(3).max(10),
  description: z.string().max(100, 'La descripción es muy larga.').optional(),
});

export const withdrawSchema = z.object({
  amount: z.number().positive('El monto a retirar debe ser mayor a cero.'),
  currency_code: z.string().min(3).max(10),
  description: z.string().max(100, 'La descripción es muy larga.').optional(),
});

export type DepositInput = z.infer<typeof depositSchema>;
export type SwapInput = z.infer<typeof swapSchema>;
export type TransferInput = z.infer<typeof transferSchema>;
export type WithdrawInput = z.infer<typeof withdrawSchema>;
