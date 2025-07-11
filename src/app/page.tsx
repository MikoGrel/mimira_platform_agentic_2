import { LocaleSwitcher } from "lingo.dev/react-client";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <LocaleSwitcher locales={["pl", "en", "es"]} />
      <div>
        <h1 className="text-xl font-semibold">
          Mimira - Agentic platform for public tenders
        </h1>
        <p>This is long text demonstrating AI Translations</p>
      </div>
    </div>
  );
}
