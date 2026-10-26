import { SupabaseClient } from '@supabase/supabase-js';
import { Product, CreateProductInput, UpdateProductInput } from '../../domain/entities/Product';
import { IProductRepository, ProductFilter } from '../contracts/IProductRepository';
import { getSupabaseClient } from './supabaseClient';
import { AppError } from '../../domain/errors/AppErrors';

export class SupabaseProductRepository implements IProductRepository {
  private client: SupabaseClient;

  constructor(client: SupabaseClient = getSupabaseClient()) {
    this.client = client;
  }

  async findAll(filter?: ProductFilter): Promise<Product[]> {
    let query = this.client
      .from('productos')
      .select('*')
      .order('created_at', { ascending: false });

    if (!filter?.includeEliminados) {
      query = query.eq('eliminado', false);
    }

    if (filter?.category && filter.category !== 'todos') {
      query = query.eq('cat', filter.category);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error en SupabaseProductRepository.findAll:', error);
      throw new AppError(`Error al consultar productos: ${error.message}`, 500);
    }

    return (data || []) as Product[];
  }

  async findById(id: number): Promise<Product | null> {
    const { data, error } = await this.client
      .from('productos')
      .select('*')
      .eq('id', id)
      .eq('eliminado', false)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No row found
        return null;
      }
      console.error(`Error en SupabaseProductRepository.findById(${id}):`, error);
      throw new AppError(`Error al buscar producto ${id}: ${error.message}`, 500);
    }

    return data as Product;
  }

  async create(product: CreateProductInput): Promise<Product> {
    const payload: Record<string, any> = {
      name: product.name,
      price: product.price,
      cat: product.cat,
      img: product.img,
      badge: product.badge || 'no',
      agotado: product.agotado ?? false,
      eliminado: false
    };

    if (product.descripcion !== undefined) payload.descripcion = product.descripcion;
    if (product.material !== undefined) payload.material = product.material;

    let { data, error } = await this.client
      .from('productos')
      .insert(payload)
      .select()
      .single();

    // Si falla porque las columnas 'descripcion' o 'material' no existen aún en Supabase:
    if (error && (error.message?.includes('descripcion') || error.message?.includes('material') || error.code === 'PGRST204')) {
      console.warn('⚠️ Las columnas descripcion/material no están en la tabla productos. Insertando con columnas base...');
      delete payload.descripcion;
      delete payload.material;
      const retry = await this.client
        .from('productos')
        .insert(payload)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error('Error en SupabaseProductRepository.create:', error);
      throw new AppError(`Error al insertar producto: ${error.message}`, 500);
    }

    return data as Product;
  }

  async update(id: number, fields: UpdateProductInput): Promise<Product> {
    let { data, error } = await this.client
      .from('productos')
      .update(fields)
      .eq('id', id)
      .select()
      .single();

    // Fallback defensivo si falla por columnas inexistentes
    if (error && (error.message?.includes('descripcion') || error.message?.includes('material') || error.code === 'PGRST204')) {
      console.warn(`⚠️ Supabase update(${id}): reintentando sin columnas descripcion/material...`);
      const safeFields = { ...fields };
      delete safeFields.descripcion;
      delete safeFields.material;
      const retry = await this.client
        .from('productos')
        .update(safeFields)
        .eq('id', id)
        .select()
        .single();
      data = retry.data;
      error = retry.error;
    }

    if (error) {
      console.error(`Error en SupabaseProductRepository.update(${id}):`, error);
      throw new AppError(`Error al actualizar producto: ${error.message}`, 500);
    }

    return data as Product;
  }

  async softDelete(id: number): Promise<boolean> {
    const { error } = await this.client
      .from('productos')
      .update({ eliminado: true })
      .eq('id', id);

    if (error) {
      console.error(`Error en SupabaseProductRepository.softDelete(${id}):`, error);
      throw new AppError(`Error al eliminar producto: ${error.message}`, 500);
    }

    return true;
  }

  async countStats(): Promise<{ total: number; activos: number; agotados: number; categorias: number }> {
    const products = await this.findAll({ includeEliminados: false });
    const total = products.length;
    const activos = products.filter(p => !p.agotado).length;
    const agotados = products.filter(p => p.agotado).length;
    const uniqueCats = new Set(products.map(p => p.cat)).size;

    return {
      total,
      activos,
      agotados,
      categorias: uniqueCats || 5
    };
  }
}
