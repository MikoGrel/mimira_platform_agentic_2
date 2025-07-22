import { createClient } from "$/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function Home({}) {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }

  return null;
}
