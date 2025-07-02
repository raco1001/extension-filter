import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type Context, type MiddlewareHandler } from 'hono'
import { getCookie, setCookie, deleteCookie } from 'hono/cookie'
import { cookies } from 'next/headers'

export type SupabaseEnv = {
  Variables: {
    supabase: ReturnType<typeof createServerClient>
  }
}

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}

export const supabaseMiddleware = (): MiddlewareHandler<SupabaseEnv> => {
  return async (c, next) => {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (key) => {
            return getCookie(c, key)
          },
          set: (key, value, options) => {
            setCookie(c, key, value, options as any)
          },
          remove: (key, options) => {
            deleteCookie(c, key, options as any)
          },
        },
      },
    )
    c.set('supabase', supabase)
    await next()
  }
}

export const getSupabase = (c: Context<SupabaseEnv>) => {
  return c.get('supabase')
}
