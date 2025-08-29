import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";

export function hasRequirementsToAnalyze(item: InboxTenderMapping): boolean {
  if (!item) return false;

  return item.tender_parts.some((part) =>
    part.tender_requirements.some(
      (requirement) => requirement.status === "analysis"
    )
  );
}
