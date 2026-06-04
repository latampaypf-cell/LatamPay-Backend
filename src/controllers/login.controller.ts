import { Request, Response } from 'express';
import { loginUser } from '../services/login.service';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    // Control de seguridad básico
    if (!email || !password) {
      res.status(400).json({
        status: 'fail',
        message: 'Por favor, proporciona un correo electrónico y una contraseña.'
      });
      return;
    }

    // Llamamos al servicio exclusivo de login
    const result = await loginUser(email, password);

    res.status(200).json({
      status: 'success',
      data: result
    });

  } catch (error: any) {
    if (error.message === 'Credenciales inválidas') {
      res.status(401).json({
        status: 'fail',
        message: 'El correo o la contraseña son incorrectos.'
      });
      return;
    }

    console.error('Error en login controller:', error);
    res.status(500).json({
      status: 'error',
      message: 'Ocurrió un error interno en el servidor.'
    });
  }
};