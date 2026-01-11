import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
import type { SupabaseClient as BaseSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const supabaseClient = createClient<Database>(supabaseUrl, supabaseAnonKey);

export type SupabaseClient = BaseSupabaseClient<Database>;

export const DEFAULT_USER_ID = "57e03949-57b7-41e4-8b55-a6c6caf1cd98";
