import { IndividualTenderMapping } from "../api/use-individual-tender";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";

export function hasRequirementsToConfirm(
  item: IndividualTenderMapping
): boolean {
  if (!item) return false;

  return item.tender_parts.some((part) =>
    part.tender_requirements.some(
      (requirement) => requirement.status === "default"
    )
  );
}

export function hasRequirementsToConfirmInbox(
  item: InboxTenderMapping
): boolean {
  if (!item) return false;

  return item.tender_parts.some((part) =>
    part.tender_requirements.some(
      (requirement) => requirement.status === "default"
    )
  );
}
