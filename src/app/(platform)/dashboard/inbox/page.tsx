"use client";

import { Tables } from "$/types/supabase";
import {
  Button,
  Card,
  Chip,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Skeleton,
} from "@heroui/react";
import { Archive, SlidersHorizontal } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo } from "react";
import Symbol from "$/features/branding/components/Symbol";
import {
  FilterForm,
  FilterChips,
  TenderPreview,
  useFilterForm,
  useTenderInboxQuery,
} from "$/features/inbox";
import { useInfiniteList } from "$/hooks/use-infinite-list";
import { AnimatePresence, motion } from "motion/react";

const PAGE_SIZE = 10;

export default function InboxPage() {
  const { filterQuery } = useFilterForm();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [selectedId, setSelectedId] = useQueryState("id", parseAsString);

  const { tenders, isPending, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useTenderInboxQuery({ search, filterQuery, pageSize: PAGE_SIZE });

  const selectedTender = useMemo(
    () => tenders.find((t) => t.id === selectedId),
    [tenders, selectedId]
  );

  const { getRef } = useInfiniteList({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    pageSize: PAGE_SIZE,
  });

  function handleTenderSelect(tender: Tables<"tenders">) {
    setSelectedId(tender.id);
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
            <Popover placement="bottom-end">
              <PopoverTrigger>
                <Button variant="light" isIconOnly>
                  <SlidersHorizontal className="w-5 h-5" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="p-4">
                <FilterForm />
              </PopoverContent>
            </Popover>
          </div>
          <FilterChips />
        </div>

        <div className="flex-[1_0_0] overflow-y-auto">
          <div>
            <ul className="pb-12">
              <AnimatePresence>
                {isPending && <ListSkeleton />}
                {tenders?.map((t, index) => (
                  <Card
                    ref={getRef(index)}
                    as={motion.li}
                    initial={{ opacity: 0 }}
                    animate={{
                      opacity: 1,
                      transition: {
                        duration: 0.25,
                        delay: (index % PAGE_SIZE) * 0.025,
                        ease: "linear",
                      },
                    }}
                    exit={{
                      opacity: 0,
                      transition: { duration: 0 },
                    }}
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
              </AnimatePresence>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 px-4 text-sm bg-primary/10 backdrop-blur-md">
          <div className="flex items-center justify-start gap-2">
            <Symbol className="w-6 h-6" />
            <p className="font-medium">Ask Mimir</p>
            <Chip color="primary" variant="flat" size="sm">
              Coming soon
            </Chip>
          </div>
        </div>
      </aside>
      <TenderPreview tender={selectedTender} />
    </main>
  );
}

function ListSkeleton() {
  return (
    <>
      {Array.from({ length: 8 }).map((_, index) => (
        <Card
          as="li"
          key={index}
          className="p-4 border-b flex flex-col gap-2 rounded-none"
          shadow="none"
        >
          <Skeleton className="h-4 w-3/4 rounded-lg" />
          <div className="flex gap-2 items-center">
            <Skeleton className="h-3 w-32 rounded-lg" />
            <span className="text-slate-400">&middot;</span>
            <Skeleton className="h-3 w-24 rounded-lg" />
          </div>
        </Card>
      ))}
    </>
  );
}
