import { Tables } from "$/types/supabase";

export type PartsWithProducts = Tables<"tender_parts"> & {
  tender_products: Tables<"tender_products">[];
};
