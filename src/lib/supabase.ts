import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const createFallbackClient = () => {
  type QueryResult<T> = { data: T | null; error: null }

  const createBuilder = <T = unknown>() => {
    const builder = {
      select: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      insert: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      update: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      delete: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      eq: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      order: () => builder as unknown as ReturnType<typeof createBuilder<T>>,
      single: async (): Promise<QueryResult<T>> => ({ data: null, error: null }),
    }

    return builder
  }

  return {
    from: <T = unknown>() => createBuilder<T>(),
  }
}

export const supabase = (supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createFallbackClient()) as any
