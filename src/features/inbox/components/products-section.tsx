"use client";

import { Tables } from "$/types/supabase";
import { Section, SectionContent, SectionTitle } from "./ui-components";
import { ProductCard } from "$/features/products/components/product-card";
import { Masonry } from "$/components/ui/masonry";

export interface ProductsSectionProps {
  products: Tables<"tender_products">[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <Section id="products" data-section>
      <SectionTitle>
        Products{" "}
        <span className="text-gray-400 font-normal">({products.length})</span>
      </SectionTitle>
      <SectionContent>
        <Masonry columns={{ base: 2, lg: 3 }} columnGap="1rem">
          {products.map((product, idx) => (
            <ProductCard
              key={`${product.part_uuid}-${idx}`}
              product={product}
            />
          ))}
        </Masonry>
      </SectionContent>
    </Section>
  );
}
