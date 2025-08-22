"use client";

import { Button, Card, Chip, Input, Skeleton } from "@heroui/react";
import { Archive, CalendarClock, SlidersHorizontal } from "lucide-react";
import { parseAsString, useQueryState } from "nuqs";
import { useMemo, useState } from "react";
import Symbol from "$/features/branding/components/Symbol";
import { FilterForm, FilterChips, useFilterForm } from "$/features/inbox";
import { useInfiniteList } from "$/hooks/use-infinite-list";
import { AnimatePresence, motion } from "motion/react";
import { truncate } from "lodash-es";
import { cn } from "$/lib/utils";
import { useIndividualTender } from "$/features/tenders/api";
import dynamic from "next/dynamic";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { useMarkAsSeen } from "$/features/inbox/api/use-mark-as-seen";
import useTenderInboxQuery, {
  InboxTenderMapping,
} from "$/features/inbox/api/use-tender-inbox-query";
import { useLocalStorage } from "react-use";

const TenderPreview = dynamic(
  () =>
    import("$/features/inbox/components/tender-preview").then(
      (mod) => mod.TenderPreview
    ),
  {
    ssr: false,
  }
);

const PAGE_SIZE = 10;

export default function InboxPage() {
  const { filterQuery, addFilter } = useFilterForm();
  const [showFilterForm, setShowFilterForm] = useState(false);
  const { relativeToNow } = useDateFormat();

  const [search, setSearch] = useQueryState(
    "search",
    parseAsString.withDefault("")
  );
  const [selectedId, setSelectedId] = useQueryState("id", parseAsString);
  const [selectedPart, setSelectedPart] = useQueryState("part", parseAsString);
  const [, setLastTender] = useLocalStorage<string | undefined>(
    "last-tender",
    undefined
  );

  const {
    tenders,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    updateSeenAt,
  } = useTenderInboxQuery({ search, filterQuery, pageSize: PAGE_SIZE });
  const { mutate: markAsSeen } = useMarkAsSeen();

  const selectedMappingFromList = useMemo(
    () => tenders.find((t) => t.id === selectedId),
    [tenders, selectedId]
  );

  const { data: individualMapping } = useIndividualTender({
    mappingId: selectedId,
    enabled: selectedId !== null && !selectedMappingFromList,
  });

  const selectedMapping = selectedMappingFromList || individualMapping;

  const { getRef } = useInfiniteList({
    onIntersect: () => {
      if (hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    pageSize: PAGE_SIZE,
  });

  function handleTenderSelect(tender: InboxTenderMapping) {
    updateSeenAt(tender.id);
    setSelectedId(tender.id);

    // Always select the first part since there's always at least one part
    setSelectedPart(tender.tender_parts[0].id);

    markAsSeen(tender.id);
    setLastTender(tender.id);
  }

  function handleArchiveButtonPress() {
    addFilter("showRejected", !filterQuery.showRejected);
  }

  return (
    <main className="grid grid-cols-[450px_1fr] h-full">
      <aside className="border-r border-sidebar-border flex flex-col h-full relative">
        <div className="py-4 border-b border-sidebar-border flex-shrink-0">
          <div className="flex items-center justify-between gap-2 px-2 overflow-y-hidden">
            <Button
              variant={filterQuery.showRejected ? "flat" : "light"}
              isIconOnly
              onPress={handleArchiveButtonPress}
            >
              <Archive className="w-5 h-5" />
            </Button>
            <Input
              placeholder="Search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />

            <Button
              variant="light"
              isIconOnly
              onPress={() => setShowFilterForm(!showFilterForm)}
            >
              <SlidersHorizontal className="w-5 h-5" />
            </Button>
          </div>
          <FilterChips className="px-4" />
          <AnimatePresence>
            {showFilterForm && (
              <motion.div
                initial={{ height: 0 }}
                animate={{
                  height: "auto",
                }}
                exit={{
                  height: 0,
                }}
                transition={{
                  duration: 0.15,
                  ease: "easeInOut",
                }}
                className="p-4 pb-0 overflow-hidden"
              >
                <FilterForm onFiltered={() => setShowFilterForm(false)} />
              </motion.div>
            )}
          </AnimatePresence>
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
                      opacity: t.seen_at ? (t.id === selectedId ? 1 : 0.8) : 1,
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
                    className={cn("border-b rounded-none text-left", {
                      "border-l border-l-primary": t.id === selectedId,
                    })}
                    shadow="none"
                  >
                    <div className="p-4 px-6 flex flex-col gap-2 hover:bg-muted">
                      <p className="text-sm relative">
                        {truncate(t.tenders?.order_object || "", {
                          length: 100,
                          omission: "...",
                        })}

                        {!t.seen_at && (
                          <span className="block w-1.5 rounded-full h-1.5 bg-primary absolute -left-3.5 top-1.5" />
                        )}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap text-slate-500">
                        {t.tenders?.submitting_offers_date && (
                          <Chip
                            size="sm"
                            variant="flat"
                            startContent={
                              <CalendarClock className="w-4 h-4 ml-1 mr-0.5" />
                            }
                          >
                            {relativeToNow(
                              new Date(t.tenders?.submitting_offers_date)
                            )}
                          </Chip>
                        )}
                        <span className="text-sm">
                          {truncate(t.tenders?.organization_name || "", {
                            length: 30,
                          })}
                        </span>
                      </div>
                    </div>
                  </Card>
                ))}
              </AnimatePresence>
            </ul>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-3 px-4 text-sm bg-background border-t border-border">
          <div className="flex items-center justify-start gap-2">
            <Symbol className="w-6 h-6" />
            <p className="font-medium">Ask Mimir</p>
            <Chip color="primary" variant="flat" size="sm">
              Coming soon
            </Chip>
          </div>
        </div>
      </aside>
      {!selectedMapping && (
        <section className="sticky top-0 flex items-center justify-center h-full">
          <div className="text-center text-muted-foreground">
            <p className="text-sm">Select a tender to view details</p>
          </div>
        </section>
      )}
      {selectedMapping && (
        <TenderPreview
          mapping={selectedMapping}
          selectedPart={
            selectedMapping.tender_parts.find(
              (part) => part.id === selectedPart
            ) || selectedMapping.tender_parts[0]
          }
          setSelectedPart={setSelectedPart}
          showNextTender={() => {
            const idx = tenders.findIndex((t) => t.id === selectedId);
            if (idx < tenders.length - 1) {
              setSelectedId(tenders[idx + 1].id);
            }
          }}
        />
      )}
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
