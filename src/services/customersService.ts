import { supabase } from '../lib/supabase'
import type { Customer } from '../types/supabaseModels'

export async function getCustomers(): Promise<Customer[]> {
  const { data, error } = await supabase.from('customers').select('*').order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return (data ?? []) as Customer[]
}
