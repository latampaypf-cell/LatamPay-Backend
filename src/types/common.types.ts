/**
 * Tipos globales para la aplicación LatamPay.
 * Aquí definimos estructuras comunes que no pertenecen a un módulo específico.
 */

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
  errors?: unknown;
}

export interface PaginationInfo {
  totalItems: number;
  totalPages: number;
  currentPage: number;
  limit: number;
}
