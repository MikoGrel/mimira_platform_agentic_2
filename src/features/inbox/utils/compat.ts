import { InboxTender, InboxTenderPart } from "../api/use-tender-inbox-query";

export function getRequirements(
  type: "met" | "not_met" | "needs_confirmation",
  tender?: InboxTender | InboxTenderPart
) {
  switch (type) {
    case "met":
      return (
        (tender?.met_requirements as string[]) ||
        tender?.tender_requirements
          .filter((r) => r.status === "approve")
          .map((r) => r.requirement_text)
      );
    case "not_met":
      return (
        (tender?.not_met_requirements as string[]) ||
        tender?.tender_requirements
          .filter((r) => r.status === "reject")
          .map((r) => r.requirement_text)
      );
    case "needs_confirmation":
      return (
        (tender?.needs_confirmation_requirements as string[]) ||
        tender?.tender_requirements
          .filter((r) => r.status === "default")
          .map((r) => r.requirement_text)
      );
  }
}
