export type ProductCategory = 'Mates' | 'Termos' | 'Bombillas' | 'Materas';

export const VALID_CATEGORIES: ProductCategory[] = ['Mates', 'Termos', 'Bombillas', 'Materas'];

export interface Product {
  id: number;
  name: string;
  price: number;
  cat: ProductCategory;
  img: string;
  badge: 'si' | 'no';
  agotado: boolean;
  eliminado: boolean;
  descripcion?: string;
  material?: string;
  created_at?: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'created_at'>;

export type UpdateProductInput = Partial<Pick<Product, 'name' | 'price' | 'cat' | 'badge' | 'agotado' | 'img' | 'descripcion' | 'material'>>;

/**
 * Validador de entidad de dominio.
 * Aplica reglas de negocio fundamentales e independientes del framework.
 */
export function validateProductData(data: Partial<CreateProductInput>): void {
  if (!data.name || typeof data.name !== 'string' || data.name.trim().length === 0) {
    throw new Error('El nombre del producto es requerido y no puede estar vacío.');
  }

  if (typeof data.price !== 'number' || isNaN(data.price) || data.price <= 0) {
    throw new Error('El precio del producto debe ser un número mayor a cero.');
  }

  if (!data.cat || !VALID_CATEGORIES.includes(data.cat as ProductCategory)) {
    throw new Error(`La categoría debe ser una de las siguientes: ${VALID_CATEGORIES.join(', ')}.`);
  }
}
