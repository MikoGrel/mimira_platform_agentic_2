"use client";

import { ProductCard } from "$/features/products/components/product-card";
import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
import { Masonry } from "$/components/ui/masonry";
import { InboxTenderProduct } from "../api/use-tender-inbox-query";

export interface ProductsSectionProps {
  products: InboxTenderProduct[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  if (!products || products.length === 0) return null;

  function matchingFirst(a: InboxTenderProduct, b: InboxTenderProduct) {
    if (a.closest_match && !b.closest_match) return -1;
    if (!a.closest_match && b.closest_match) return 1;

    return 0;
  }

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
          {products.toSorted(matchingFirst).map((product, idx) => (
            <ProductCard key={`${product.id}-${idx}`} product={product} />
          ))}
        </Masonry>
      </SectionContent>
    </Section>
  );
}
