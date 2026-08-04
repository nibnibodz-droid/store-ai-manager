import { supabase } from '../lib/supabase'
import type { Product } from '../types/supabaseModels'

type ProductPayload = {
  title: string
  description: string
  price: number
  stock: number
  category: string
}

export async function getProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('id,title,description,price,stock,category')
    .order('title', { ascending: true })

  if (error) {
    throw error
  }

  return (data ?? []) as Product[]
}

export async function createProduct(payload: ProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('id,title,description,price,stock,category')
    .single()

  if (error) {
    throw error
  }

  return data as Product
}

export async function updateProduct(id: string, payload: ProductPayload): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('id,title,description,price,stock,category')
    .single()

  if (error) {
    throw error
  }

  return data as Product
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id)

  if (error) {
    throw error
  }
}

export async function updateProductStock(id: string, stock: number): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ stock })
    .eq('id', id)
    .select('id,title,description,price,stock,category')
    .single()

  if (error) {
    throw error
  }

  return data as Product
}
