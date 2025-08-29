import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";

export function hasPartsToAnalyze(item: InboxTenderMapping): boolean {
  if (!item) return false;

  return item.tender_parts.some((part) => part.status === "analysis");
}
