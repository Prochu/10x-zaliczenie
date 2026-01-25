import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = BaseSupabaseClient<Database>;

export const DEFAULT_USER_ID = "725718fb-3d8a-4bdf-a56c-a35a0240be09";
