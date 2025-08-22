import { InboxTenderPart } from "../api/use-tender-inbox-query";

export function getRequirements(
  type: "met" | "not_met" | "needs_confirmation",
  part: InboxTenderPart
) {
  switch (type) {
    case "met":
      return part.tender_requirements
        .filter((r) => r.status === "approve")
        .map((r) => r.requirement_text);
    case "not_met":
      return part.tender_requirements
        .filter((r) => r.status === "reject")
        .map((r) => r.requirement_text);
    case "needs_confirmation":
      return part.tender_requirements
        .filter((r) => r.status === "default")
        .map((r) => r.requirement_text);
  }
}
