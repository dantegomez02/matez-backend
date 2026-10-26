import { Router } from 'express';
import { ProductController } from '../controllers/ProductController';
import { uploadImageMiddleware } from '../middlewares/uploadMiddleware';
import { requireAuth } from '../middlewares/authMiddleware';

const router = Router();

// Rutas públicas (catálogo de tienda y consulta)
router.get('/', ProductController.getAll);

// Rutas administrativas protegidas — DEBEN ir antes de /:id para no colisionar
router.get('/stats', requireAuth, ProductController.getStats);

router.get('/:id', ProductController.getById);
router.post('/', requireAuth, uploadImageMiddleware.single('image'), ProductController.create);
router.put('/:id', requireAuth, ProductController.update);
router.patch('/:id/agotado', requireAuth, ProductController.toggleAgotado);
router.delete('/:id', requireAuth, ProductController.delete);

export default router;
