"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "../api";
import { useEffect } from "react";

export default function AuthGuard() {
  const { user, isLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login?redirect_to=" + window.location.pathname);
    }
  }, [isLoading, user, router]);

  return null;
}
