import { createClient } from "@supabase/supabase-js"
import type { Database } from "./supabase"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export const supabaseServer = createClient<Database>(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// Helper function to get user from request
export async function getUser(request: Request) {
  const authHeader = request.headers.get("authorization")
  if (!authHeader) return null

  const token = authHeader.replace("Bearer ", "")
  const {
    data: { user },
    error,
  } = await supabaseServer.auth.getUser(token)

  if (error || !user) return null
  return user
}
