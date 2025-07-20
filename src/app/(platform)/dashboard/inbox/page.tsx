import { createClient } from "$/lib/supabase/server";
import { Button, Input } from "@heroui/react";
import { Archive, SlidersHorizontal } from "lucide-react";

export default async function InboxPage() {
  const client = await createClient();

  const { data: tenders } = await client
    .from("tenders")
    .select("*")
    .order("submittingoffersdate", { ascending: false });

  return (
    <main className="grid grid-cols-[450px_1fr] grid-rows-1 h-full">
      <aside className="border-r border-sidebar-border">
        <div className="py-4 border-b border-sidebar-border sticky">
          <div className="flex items-center justify-between gap-2 px-2">
            <Button variant="light" isIconOnly>
              <Archive className="w-5 h-5" />
            </Button>
            <Input placeholder="Search" />
            <Button variant="light" isIconOnly>
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <ul>
          {tenders?.map((t) => (
            <li key={t.id} className="p-4 border-b flex flex-col gap-2">
              <p className="font-semibold text-sm">{t.orderobject}</p>
              <div className="flex flex-wrap text-slate-500">
                <span className="text-sm">{t.organizationname}</span>
                <span>&nbsp;&middot;&nbsp;</span>
                <span className="text-sm text-danger">
                  {t.submittingoffersdate}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </aside>
      <section>
        <div className="p-4 border-b border-sidebar-border"></div>
      </section>
    </main>
  );
}
