"use client";

import { useLocalStorage } from "react-use";
import { useCurrentUser } from "$/features/auth/api";

export function useLastTender() {
  const { user } = useCurrentUser();
  const [lastMappingId, setLastMappingId] = useLocalStorage<string | undefined>(
    "last-tender" + user?.profile?.company_id,
    undefined
  );

  return { lastMappingId, setLastMappingId };
}
