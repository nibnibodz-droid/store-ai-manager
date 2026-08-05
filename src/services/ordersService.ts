import { supabase } from './supabase'
import type { Order } from '../types/supabaseModels'

type OrderPayload = {
  customer_id: string
  product_id: string
  status: string
  amount: number
}

function normalizeOrderAmount(value: unknown): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value)
    if (Number.isFinite(parsed)) {
      return parsed
    }
  }

  return 0
}

export async function getOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('id, customer_id, product_id, status, amount, created_at')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return ((data ?? []) as Array<Order>).map((order) => ({
    ...order,
    amount: normalizeOrderAmount(order.amount),
  }))
}

export async function createOrder(payload: OrderPayload): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .insert(payload)
    .select('id, customer_id, product_id, status, amount, created_at')
    .single()

  if (error) {
    throw error
  }

  return data as Order
}
