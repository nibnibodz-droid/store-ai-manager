import { supabase } from '../lib/supabase'
import type { OrderItem } from '../types/supabaseModels'

type OrderItemPayload = {
  order_id: string
  product_id: string
  quantity: number
  price: number
}

export async function createOrderItem(payload: OrderItemPayload): Promise<OrderItem> {
  const { data, error } = await supabase
    .from('order_items')
    .insert(payload)
    .select('id, order_id, product_id, quantity, price, created_at')
    .single()

  if (error) {
    throw error
  }

  return data as OrderItem
}
