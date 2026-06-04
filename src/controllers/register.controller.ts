import { Request, Response } from 'express';
import { registerUser } from '../services/register.service';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    // Control de seguridad básico: Validar que no falte ningún dato de entrada
    if (!name || !email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Por favor, proporciona nombre, correo electrónico y contraseña.'
      });
      return;
    }

    // Llamamos a la transacción del servicio exclusivo de registro
    const result = await registerUser(name, email, password);

    res.status(201).json({
      status: 'success',
      message: 'Usuario registrado exitosamente junto a su billetera y balances 🚀',
      data: result
    });

  } catch (error: any) {
    if (error.message === 'El correo electrónico ya está registrado.') {
      res.status(400).json({
        status: 'fail',
        message: error.message
      });
      return;
    }

    console.error('Error en register controller:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error al procesar el registro.'
    });
  }
};