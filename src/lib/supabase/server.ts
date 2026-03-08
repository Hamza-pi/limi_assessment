// Server-only Supabase client using the service role key.
// Import this only inside Server Components or Server Actions —
// never bundle the service role key into client-side code.

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Creates a new server-side Supabase client per request.
 * Uses the service role key to bypass Row Level Security where needed.
 */
export function createServerSupabaseClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const svcKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !svcKey) {
    throw new Error(
      "Missing server Supabase environment variables. " +
        "Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env",
    );
  }

  return createClient(url, svcKey, {
    auth: { persistSession: false }, // stateless — no cookie/session storage on server
  });
}
