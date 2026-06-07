import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const serviceKey = process.env.SUPABASE_SERVICE_KEY!;

export function createBrowserClient() {
  return createClient(supabaseUrl, publishableKey);
}

export function createServiceClient() {
  return createClient(supabaseUrl, serviceKey);
}
