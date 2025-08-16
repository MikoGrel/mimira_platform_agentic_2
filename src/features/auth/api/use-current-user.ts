"use client";

import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import omit from "lodash-es/omit";
import posthog from "posthog-js";
import { useEffect } from "react";

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

  useEffect(() => {
    if (data) {
      posthog.identify(data.id, {
        email: data.email,
        ...omit(data.profile, "id"),
      });

      if (data.profile?.customer) {
        posthog.group("customer", data.profile?.customer);
      }
    }
  }, [data]);

  return { user: data, ...rest };
} 