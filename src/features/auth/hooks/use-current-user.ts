"use client";

import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function useCurrentUser() {
  const client = createClient();

  const { data, ...rest } = useQuery({
    queryKey: ["current-user"],
    queryFn: async () => {
      const {
        data: { user },
        error,
      } = await client.auth.getUser();

      if (error) {
        throw error;
      }

      if (!user) {
        return null;
      }

      const { data: profile } = await client
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return { ...user, profile };
    },
  });

  return { user: data, ...rest };
}
