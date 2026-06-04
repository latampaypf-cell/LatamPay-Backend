import { Router } from 'express';
import { login } from '../controllers/login.controller';      // Importamos el controlador de login
import { register } from '../controllers/register.controller';  // Importamos el de registro
import { requireAuth } from '../middlewares/auth.middleware';   // Middleware protector

const router = Router();

// Endpoint público para iniciar sesión: POST /api/auth/login
router.post('/login', login);

// Endpoint público para registrarse: POST /api/auth/register
router.post('/register', register);

// Endpoint protegido de prueba requerido por la rúbrica de Henry: GET /api/auth/me
router.get('/me', requireAuth, (req: any, res) => {
  res.json({
    status: 'success',
    message: '¡Acceso concedido! Tu sesión es válida 🔐',
    user: req.user // Muestra el payload extraído del JWT (id, email, role)
  });
});

export default router;