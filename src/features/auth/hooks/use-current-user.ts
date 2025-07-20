"use client";

import { createClient } from "$/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { useState, useEffect } from "react";

export default function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user);
      setLoading(false);

      if (!user) {
        redirect("/login");
      }
    };

    getUser();
  }, [supabase.auth]);

  return { user, loading };
}
