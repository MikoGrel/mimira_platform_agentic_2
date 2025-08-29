"use client";

import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { Database } from "$/types/supabase";

export type CompanyFileType =
  Database["public"]["Tables"]["tender_company_file"]["Row"];

export function useCompanyFiles({
  mappingId,
}: {
  mappingId: string | null | undefined;
}) {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery({
    queryKey: ["company-files", user?.profile?.company_id],
    queryFn: async () => {
      const { data } = await client
        .from("tender_company_file")
        .select("*")
        .eq("company_tender_mapping_id", mappingId!)
        .throwOnError();
      return data;
    },
    enabled: !!user && !!mappingId,
  });
}
