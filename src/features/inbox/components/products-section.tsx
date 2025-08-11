"use client";

import { Tables } from "$/types/supabase";
import { ProductCard } from "$/features/products/components/product-card";
import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
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
        <span className="text-subtle-foreground font-normal">
          ({products.length})
        </span>
      </SectionTitle>
      <SectionContent>
        <Masonry columns={{ base: 1, md: 2 }} columnGap="1rem">
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
