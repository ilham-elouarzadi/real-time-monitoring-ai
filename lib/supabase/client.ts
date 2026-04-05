import { createBrowserClient } from '@supabase/ssr' // Utilisez createBrowserClient pour le client côté client

export const createClient = () =>
  createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )