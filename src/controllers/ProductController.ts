import { Request, Response, NextFunction } from 'express';
import { ProductService } from '../services/ProductService';
import { SupabaseProductRepository } from '../persistence/supabase/SupabaseProductRepository';
import { StorageService } from '../services/StorageService';
import { ProductCategory } from '../domain/entities/Product';

// Inyección de dependencias (Composition Root local)
const productRepository = new SupabaseProductRepository();
const storageService = new StorageService();
const productService = new ProductService(productRepository, storageService);

export class ProductController {
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const category = req.query.cat as string | undefined;
      const products = await productService.getCatalogProducts(category);

      res.json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const product = await productService.getProductById(id);

      res.json({
        success: true,
        data: product
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, price, cat, badge, imgUrl, descripcion, material } = req.body;
      const file = req.file;

      const newProduct = await productService.createProduct(
        {
          name,
          price: Number(price),
          cat: cat as ProductCategory,
          badge: badge === 'si' ? 'si' : 'no',
          imgUrl,
          descripcion,
          material
        },
        file
          ? {
              buffer: file.buffer,
              originalname: file.originalname,
              mimetype: file.mimetype
            }
          : undefined
      );

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente.',
        data: newProduct
      });
    } catch (error) {
      next(error);
    }
  }

  static async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const { name, price, cat, badge, agotado, descripcion, material } = req.body;

      const updated = await productService.updateProduct(id, {
        name,
        price: price !== undefined ? Number(price) : undefined,
        cat: cat as ProductCategory,
        badge,
        agotado: typeof agotado === 'boolean' ? agotado : undefined,
        descripcion,
        material
      });

      res.json({
        success: true,
        message: 'Producto actualizado exitosamente.',
        data: updated
      });
    } catch (error) {
      next(error);
    }
  }

  static async toggleAgotado(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      const result = await productService.toggleAgotado(id);

      res.json({
        success: true,
        message: result.nuevoEstado
          ? `Producto marcado como agotado.`
          : `Producto marcado como disponible.`,
        data: result.product
      });
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id, 10);
      await productService.deleteProduct(id);

      res.json({
        success: true,
        message: 'Producto eliminado correctamente.'
      });
    } catch (error) {
      next(error);
    }
  }

  static async getStats(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const stats = await productService.getAdminStats();

      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }
}
