"use client";

import { useCurrentUser } from "$/features/auth/api";
import { createClient } from "$/lib/supabase/client";
import { useQuery } from "@tanstack/react-query";

export interface WeeklyStats {
  weeks: Week[];
  company: string;
}

export interface Week {
  week_start: string;
  mappings_count: number;
}

export function useWeeklyTendersCount() {
  const { user } = useCurrentUser();
  const client = createClient();

  return useQuery<WeeklyStats | undefined>({
    queryKey: ["weekly-tenders-count"],
    queryFn: async () => {
      const { data, error } = await client.rpc("get_weekly_company_mappings", {
        p_company_id: user!.profile!.company_id!,
        p_no_of_weeks: 4,
      });

      if (error) throw error;

      return data[0].result as unknown as WeeklyStats | undefined;
    },
    enabled: !!user?.profile?.company_id,
  });
}
