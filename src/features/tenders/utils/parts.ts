// Generic type for any object that has tender_parts array
type AnythingWithParts<TPart = any> = {
  tender_parts?: TPart[];
};

export function getAnalysisParts<T extends AnythingWithParts>(
  mapping: T
): NonNullable<T["tender_parts"]> {
  return (mapping?.tender_parts?.filter((p) => p.status === "analysis") ??
    []) as NonNullable<T["tender_parts"]>;
}

export function getOverviewParts<T extends AnythingWithParts>(
  mapping: T
): NonNullable<T["tender_parts"]> {
  return (mapping?.tender_parts?.filter(
    (p) => p.status === "analysis" || p.status === "approve"
  ) ?? []) as NonNullable<T["tender_parts"]>;
}
