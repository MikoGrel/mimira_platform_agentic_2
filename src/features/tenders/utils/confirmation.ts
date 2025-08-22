import {
  IndividualTenderMapping,
  IndividualTender,
  IndividualTenderPart,
} from "../api/use-individual-tender";

export function hasProductsToConfirm(item: IndividualTenderPart): boolean {
  if (!item) return false;

  return item.tender_requirements.some(
    (requirement) =>
      requirement.status === "default" && requirement.tender_product_id
  );
}

/**
 * Check if all products in a tender or tender part are confirmed
 */
export function areAllProductsConfirmed(
  item:
    | IndividualTenderMapping
    | IndividualTender
    | IndividualTenderPart
    | null
    | undefined,
  confirmedProductsSet: Set<string>
): boolean {
  if (!item) return true;

  // Check if there are products to confirm (moved from hasProductsToConfirm)
  if ("tender_requirements" in item) {
    const hasProductsToConfirm = item.tender_requirements.some(
      (requirement) =>
        requirement.status === "default" && requirement.tender_product_id
    );

    if (!hasProductsToConfirm) {
      return true;
    }
  }

  if ("part_name" in item && "tender_products" in item) {
    if (!item.tender_products || item.tender_products.length === 0) {
      return true;
    }

    return item.tender_products.every((product, index) =>
      confirmedProductsSet.has(`product-${product.id}-${index}`)
    );
  }

  return true;
}
