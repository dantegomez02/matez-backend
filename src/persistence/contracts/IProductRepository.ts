import { Product, CreateProductInput, UpdateProductInput } from '../../domain/entities/Product';

export interface ProductFilter {
  category?: string;
  includeEliminados?: boolean;
}

/**
 * Contrato de la capa de persistencia para Productos.
 * Permite que los servicios dependan de esta abstracción (DIP) y no
 * directamente del cliente de Supabase o una base de datos específica.
 */
export interface IProductRepository {
  findAll(filter?: ProductFilter): Promise<Product[]>;
  findById(id: number): Promise<Product | null>;
  create(product: CreateProductInput): Promise<Product>;
  update(id: number, fields: UpdateProductInput): Promise<Product>;
  softDelete(id: number): Promise<boolean>;
  countStats(): Promise<{ total: number; activos: number; agotados: number; categorias: number }>;
}
