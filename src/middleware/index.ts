import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "../db/database.types";
import type { MeDto } from "../types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  // Create a Supabase client specific to this request
  const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
    global: {
      headers: {
        cookie: context.request.headers.get("cookie") ?? "",
      },
    },
  });

  context.locals.supabase = supabase;

  // Try to get the session from cookies
  const accessToken = context.cookies.get("sb-access-token")?.value;
  const refreshToken = context.cookies.get("sb-refresh-token")?.value;

  if (accessToken && refreshToken) {
    const { data: { session }, error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    if (!error && session) {
      // Get user profile from database
      const { data: profile } = await supabase
        .from("profiles")
        .select("id, nickname, is_admin, user_id")
        .eq("user_id", session.user.id)
        .single();

      if (profile) {
        // Get user groups
        const { data: userGroups } = await supabase
          .from("user_groups")
          .select("group_id, groups(id, name, is_default)")
          .eq("user_id", profile.id);

        const groups = (userGroups || []).map((ug: any) => ({
          id: ug.groups.id,
          name: ug.groups.name,
          isDefault: ug.groups.is_default,
        }));

        context.locals.user = {
          id: profile.id,
          nickname: profile.nickname,
          isAdmin: profile.is_admin,
          groups,
        } as MeDto;
      }
    }
  }

  const response = await next();

  return response;
});
