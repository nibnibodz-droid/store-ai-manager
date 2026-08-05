export type Product = {
  id: string
  title: string
  description: string
  price: number
  stock: number
  category: string
  created_at?: string
}

export type Order = {
  id: string
  customer_id: string
  product_id: string
  status: string
  amount: number | null
  total?: number | null
  created_at?: string
}

export type OrderItem = {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  created_at?: string
}

export type Customer = {
  id: string
  name: string
  email: string
  created_at?: string
}
