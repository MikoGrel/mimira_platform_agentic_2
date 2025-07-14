import { createClient } from "$/lib/supabase/server";
import { LocaleSwitcher } from "lingo.dev/react-client";

export default async function Home() {
  const client = await createClient();

  const {
    data: { user },
  } = await client.auth.getUser();

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <LocaleSwitcher locales={["pl", "en"]} />
      {user ? <div>Logged in as {user.email}</div> : <div>Not logged in</div>}
      <div>
        <h1 className="text-xl font-semibold">
          Mimira - Agentic platform for public tenders
        </h1>
        <p>This is long text demonstrating AI Translations</p>
      </div>
    </div>
  );
}
