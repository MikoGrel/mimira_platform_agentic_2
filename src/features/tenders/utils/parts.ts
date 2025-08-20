import { Tables } from "$/types/supabase";
import { IndividualTenderPart } from "../api/use-individual-tender";

// Generic type for any object that has tender_parts array
type AnythingWithParts<TPart = IndividualTenderPart> = {
  tender_parts?: TPart[];
};

// More specific type for parts with products (commonly used)
export type PartsWithProducts = Tables<"tender_parts"> & {
  tender_products: Tables<"tender_products">[];
};

export function getApprovedParts<T extends AnythingWithParts>(
  tender: T
): NonNullable<T["tender_parts"]> {
  return (tender?.tender_parts?.filter((p) => p.status === "approve") ??
    []) as NonNullable<T["tender_parts"]>;
}

export function getRejectedParts<T extends AnythingWithParts>(
  tender: T
): NonNullable<T["tender_parts"]> {
  return (tender?.tender_parts?.filter((p) => p.status === "reject") ??
    []) as NonNullable<T["tender_parts"]>;
}

export function getPendingParts<T extends AnythingWithParts>(
  tender: T
): NonNullable<T["tender_parts"]> {
  return (tender?.tender_parts?.filter((p) => p.status === "pending") ??
    []) as NonNullable<T["tender_parts"]>;
}

export function getPartsByStatus<T extends AnythingWithParts>(
  tender: T,
  status: string
): NonNullable<T["tender_parts"]> {
  return (tender?.tender_parts?.filter((p) => p.status === status) ??
    []) as NonNullable<T["tender_parts"]>;
}

export function getNonApprovedParts<T extends AnythingWithParts>(
  tender: T
): NonNullable<T["tender_parts"]> {
  return (tender?.tender_parts?.filter((p) => p.status !== "approve") ??
    []) as NonNullable<T["tender_parts"]>;
}
