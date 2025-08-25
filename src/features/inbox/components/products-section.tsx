"use client";

import { ProductCard } from "$/features/products/components/product-card";
import { Section } from "./section";
import { SectionContent } from "./section-content";
import { SectionTitle } from "./section-title";
import { Masonry } from "$/components/ui/masonry";
import { InboxTenderProduct } from "../api/use-tender-inbox-query";
import { useCatalogProducts } from "$/features/products/api/use-catalog-products";

export interface ProductsSectionProps {
  products: InboxTenderProduct[];
}

export function ProductsSection({ products }: ProductsSectionProps) {
  const { data: catalogProducts } = useCatalogProducts([
    ...products.map((p) => p.closest_match),
    ...products.flatMap((p) => p.alternative_products as string[]),
  ]);

  function matchingFirst(a: InboxTenderProduct, b: InboxTenderProduct) {
    if (a.closest_match && !b.closest_match) return -1;
    if (!a.closest_match && b.closest_match) return 1;

    return 0;
  }

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
          {products.toSorted(matchingFirst).map((product, idx) => (
            <ProductCard
              key={`${product.id}-${idx}`}
              product={product}
              closestMatch={
                catalogProducts?.find((p) => p.id === product.closest_match) ??
                null
              }
              alternatives={
                catalogProducts?.filter((p) =>
                  (product.alternative_products as string[]).includes(p.id)
                ) ?? []
              }
            />
          ))}
        </Masonry>
      </SectionContent>
    </Section>
  );
}
