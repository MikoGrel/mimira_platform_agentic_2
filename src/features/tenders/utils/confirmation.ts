import { IndividualTender, IndividualTenderPart } from "../api/use-individual-tender";

/**
 * Check if a tender or tender part has products that require confirmation
 */
export function hasProductsToConfirm(
  item: IndividualTender | IndividualTenderPart | null | undefined
): boolean {
  if (!item) return false;
  
  // Check if it's a tender part
  if ("part_uuid" in item) {
    return item.tender_products && item.tender_products.length > 0;
  }
  
  // It's a full tender - check if any approved parts have products
  if (!item.tender_parts) return false;
  
  const approvedParts = item.tender_parts.filter(part => part.status === "approve");
  return approvedParts.some(part => 
    part.tender_products && part.tender_products.length > 0
  );
}

/**
 * Check if all products in a tender or tender part are confirmed
 */
export function areAllProductsConfirmed(
  item: IndividualTender | IndividualTenderPart | null | undefined,
  confirmedProductsSet: Set<string>
): boolean {
  if (!item) return true;
  
  // Check if it's a tender part
  if ("part_uuid" in item) {
    if (!item.tender_products || item.tender_products.length === 0) {
      return true; // No products to confirm
    }
    
    // Check if all products in this part are confirmed
    return item.tender_products.every((_, index) => 
      confirmedProductsSet.has(`product-${index}`)
    );
  }
  
  // It's a full tender - this is more complex as we'd need to track
  // confirmations across all parts. For now, return true as this
  // function is primarily used for individual parts
  return true;
}