"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "$/lib/supabase/client";
import { Tables } from "$/types/supabase";
import { Button, Card, Chip, Input, Spinner } from "@heroui/react";
import { Archive, Calendar, House, SlidersHorizontal } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useState } from "react";
import Symbol from "$/features/branding/components/Symbol";

export default function InboxPage() {
  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );

  const { data: tenders, isLoading: loading } = useQuery({
    queryKey: ["tenders", search],
    queryFn: async () => {
      const client = createClient();
      let query = client.from("tenders").select("*");

      if (search) {
        query = query.textSearch("orderobject", search);
      }

      const result = await query.order("submittingoffersdate", {
        ascending: false,
      });
      return result.data;
    },
    placeholderData: (previousData) => previousData,
  });

  const [selectedTender, setSelectedTender] =
    useState<Tables<"tenders"> | null>(null);

  function handleTenderSelect(tender: Tables<"tenders">) {
    setSelectedTender(tender);
  }

  return (
    <main className="grid grid-cols-[450px_1fr] h-full">
      <aside className="border-r border-sidebar-border flex flex-col h-full relative">
        <div className="py-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center justify-between gap-2 px-2">
            <Button variant="light" isIconOnly>
              <Archive className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="light" isIconOnly>
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
        </div>

        <div className="flex-[1_0_0] overflow-y-auto">
          {loading && (
            <div className="flex flex-center w-full h-24">
              <Spinner className="mx-auto my-10" />
            </div>
          )}
          {tenders && (
            <ul>
              {tenders?.map((t) => (
                <Card
                  isPressable
                  onPress={() => handleTenderSelect(t)}
                  key={t.id}
                  className="p-4 border-b flex flex-col gap-2 rounded-none text-left"
                  shadow="none"
                >
                  <p className="font-semibold text-sm">{t.orderobject}</p>
                  <div className="flex flex-wrap text-slate-500">
                    <span className="text-sm">{t.organizationname}</span>
                    <span>&nbsp;&middot;&nbsp;</span>
                    <span className="text-sm text-danger">
                      {t.submittingoffersdate}
                    </span>
                  </div>
                </Card>
              ))}
            </ul>
          )}
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-sidebar-border">
          <div className="flex items-center justify-center gap-2">
            <Symbol className="w-6 h-6" />
            <p className="font-medium">Ask Mimir</p>
            <Chip color="primary" variant="flat">
              Coming soon
            </Chip>
          </div>
        </div>
      </aside>
      <section className="sticky top-0">
        {selectedTender && (
          <div className="h-full w-full">
            <div className="p-4 border-b border-sidebar-border flex flex-col gap-4">
              <h1 className="font-medium w-2/3">
                {selectedTender.orderobject}
              </h1>
              <div className="flex gap-2">
                <Chip
                  variant="flat"
                  color="primary"
                  className="px-3"
                  startContent={<House className="w-4 h-4" />}
                >
                  {selectedTender.organizationname}
                </Chip>
                <Chip
                  variant="flat"
                  color="danger"
                  className="px-3"
                  startContent={<Calendar className="w-4 h-4" />}
                >
                  {selectedTender.submittingoffersdate}
                </Chip>
              </div>
              <div className="flex gap-2">
                <Button color="primary" data-lingo-override-pl="Aplikuj">
                  Apply
                </Button>
                <Button variant="flat" color="danger">
                  Reject
                </Button>
              </div>
            </div>
            <div className="p-4"></div>
          </div>
        )}
      </section>
    </main>
  );
}
