"use client";

import { createClient } from "$/lib/supabase/client";
import { TablesUpdate } from "$/types/supabase";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Separate the row identifier from the updatable payload
export type UpdateProfileData = { id: string } & Omit<
  TablesUpdate<"profiles">,
  "id"
>;

export function useUpdateProfile() {
  const client = createClient();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const { id, ...payload } = data;

      const cleaned = Object.fromEntries(
        Object.entries(payload).filter(([, v]) => v !== undefined)
      );

      const { data: updated, error } = await client
        .from("profiles")
        .update(cleaned)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return updated;
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["current-user"] }),
  });
}
