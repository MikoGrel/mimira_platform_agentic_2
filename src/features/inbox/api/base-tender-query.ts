import { createClient } from "$/lib/supabase/client";

export const baseTenderQuery = (s: ReturnType<typeof createClient>) =>
  s
    .from("companies_tenders_mappings")
    .select(
      `
  *,
  tenders!inner (
    *
  ),
  tender_parts (
    id,
    part_name,
    ordercompletiondate_llm,
    wadium_llm,
    review_criteria_llm,
    description_part_long_llm,
    order_number,
    status,
    can_participate,
    tender_products (
      id,
      part_id,
      product_req_name,
      product_req_quantity,
      product_req_spec,
      requirements_to_confirm,
      alternative_products,
      closest_match
    ),
    tender_requirements (
      id,
      part_id,
      requirement_text,
      reason,
      status,
      tender_product_id,
      tender_products (
        id,
        product_req_name,
        product_req_quantity
      )
    )
  )
  `,
      { count: "exact" }
    )
    .eq("tender_parts.can_participate", true);
