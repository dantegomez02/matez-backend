import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { uploadImageMiddleware } from '../middlewares/uploadMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas (catálogo de tienda y consulta)
router.get('/', ProductController.getAll);
router.get('/:id', ProductController.getById);

// Rutas administrativas protegidas por autenticación
router.get('/stats', requireAuth, ProductController.getStats);
router.post('/', requireAuth, uploadImageMiddleware.single('image'), ProductController.create);
router.put('/:id', requireAuth, ProductController.update);
router.patch('/:id/agotado', requireAuth, ProductController.toggleAgotado);
router.delete('/:id', requireAuth, ProductController.delete);

export default router;
