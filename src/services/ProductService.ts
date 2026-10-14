import { IProductRepository, ProductFilter } from '../persistence/contracts/IProductRepository';
import { StorageService } from './StorageService';
import { Product, ProductCategory, validateProductData } from '../domain/entities/Product';
import { NotFoundError, ValidationError } from '../domain/errors/AppErrors';

export interface CreateProductDto {
  name: string;
  price: number;
  cat: ProductCategory;
  badge?: 'si' | 'no';
  imgUrl?: string;
  descripcion?: string;
  material?: string;
}

export interface UpdateProductDto {
  name?: string;
  price?: number;
  cat?: ProductCategory;
  badge?: 'si' | 'no';
  agotado?: boolean;
  descripcion?: string;
  material?: string;
}

export class ProductService {
  constructor(
    private productRepo: IProductRepository,
    private storageService: StorageService
  ) {}

  /**
   * Obtiene la lista de productos con las reglas de negocio aplicadas:
   * 1. Filtro opcional por categoría
   * 2. Ordenamiento: productos disponibles primero, agotados al final;
   *    y dentro de cada grupo, ordenados por fecha descendente.
   */
  async getCatalogProducts(category?: string): Promise<Product[]> {
    const filter: ProductFilter = {
      includeEliminados: false,
      category: category && category !== 'todos' ? category : undefined
    };

    const products = await this.productRepo.findAll(filter);

    // Regla de negocio de visualización:
    // Los agotados van al final; entre disponibles y entre agotados, los más recientes primero.
    return products.sort((a, b) => {
      if (a.agotado === b.agotado) return 0;
      return a.agotado ? 1 : -1;
    });
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundError(`Producto con ID ${id} no encontrado.`);
    }
    return product;
  }

  /**
   * Caso de uso: Agregar producto.
   * Si se envía un archivo de imagen, primero se sube a Storage y luego se persiste el producto.
   */
  async createProduct(
    dto: CreateProductDto,
    imageFile?: { buffer: Buffer; originalname: string; mimetype: string }
  ): Promise<Product> {
    validateProductData({
      name: dto.name,
      price: dto.price,
      cat: dto.cat
    });

    let imgUrl = dto.imgUrl;

    if (imageFile) {
      imgUrl = await this.storageService.uploadProductImage(
        imageFile.buffer,
        imageFile.originalname,
        imageFile.mimetype
      );
    }

    if (!imgUrl) {
      throw new ValidationError('La foto del producto es obligatoria.');
    }

    const newProduct = await this.productRepo.create({
      name: dto.name.trim(),
      price: Number(dto.price),
      cat: dto.cat,
      img: imgUrl,
      badge: dto.badge === 'si' ? 'si' : 'no',
      agotado: false,
      eliminado: false,
      descripcion: dto.descripcion?.trim() || undefined,
      material: dto.material?.trim() || undefined
    });

    return newProduct;
  }

  async updateProduct(id: number, dto: UpdateProductDto): Promise<Product> {
    const existing = await this.getProductById(id);

    if (dto.name !== undefined && dto.name.trim().length === 0) {
      throw new ValidationError('El nombre no puede estar vacío.');
    }

    if (dto.price !== undefined && (isNaN(dto.price) || dto.price <= 0)) {
      throw new ValidationError('El precio debe ser un número mayor a cero.');
    }

    const updated = await this.productRepo.update(id, {
      ...dto,
      name: dto.name !== undefined ? dto.name.trim() : existing.name,
      price: dto.price !== undefined ? Number(dto.price) : existing.price
    });

    return updated;
  }

  async toggleAgotado(id: number): Promise<{ product: Product; nuevoEstado: boolean }> {
    const product = await this.getProductById(id);
    const nuevoEstado = !product.agotado;

    const updated = await this.productRepo.update(id, { agotado: nuevoEstado });
    return { product: updated, nuevoEstado };
  }

  async deleteProduct(id: number): Promise<boolean> {
    await this.getProductById(id); // Valida existencia
    return await this.productRepo.softDelete(id);
  }

  async getAdminStats(): Promise<{ total: number; activos: number; agotados: number; categorias: number }> {
    return await this.productRepo.countStats();
  }
}
