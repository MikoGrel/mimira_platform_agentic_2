import { IndividualTenderMapping } from "../api/use-individual-tender";

export function getOverviewParts(
  mapping: IndividualTenderMapping
): NonNullable<IndividualTenderMapping["tender_parts"]> {
  return (mapping?.tender_parts?.filter(
    (p) => p.status === "analysis" || p.status === "approve"
  ) ?? []) as NonNullable<IndividualTenderMapping["tender_parts"]>;
}
