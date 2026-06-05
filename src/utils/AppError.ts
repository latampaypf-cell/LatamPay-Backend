export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // Error esperado y controlado (no un bug)
    Object.setPrototypeOf(this, AppError.prototype); // Fix herencia con TypeScript
  }
}