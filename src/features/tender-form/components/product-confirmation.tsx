"use client";

import { useState } from "react";
import {
  Button,
  Chip,
  Card,
  CardBody,
  CardHeader,
  Checkbox,
} from "@heroui/react";
import {
  Package,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Star,
  FileText,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { cn } from "$/lib/utils";
import { InboxTenderProduct } from "$/features/inbox/api/use-tender-inbox-query";
import { useProducts } from "$/features/products/api/use-products";

interface ProductConfirmationProps {
  products: InboxTenderProduct[];
  partName?: string;
  partId?: number;
}

interface ProductItemProps {
  product: InboxTenderProduct;
  isConfirmed: boolean;
  onToggleConfirm: () => void;
  selectedAlternative: string | null;
  onSelectAlternative: (alternative: string | null) => void;
  onApproveClosestMatch: () => void;
  isClosestMatchApproved: boolean;
}

function ProductItem({
  product,
  isConfirmed,
  onToggleConfirm,
  selectedAlternative,
  onSelectAlternative,
  onApproveClosestMatch,
  isClosestMatchApproved,
}: ProductItemProps) {
  const { data: alternativeProducts } = useProducts(
    Array.isArray(product.alternative_products)
      ? (product.alternative_products as string[])
      : []
  );

  const requirements = product.requirements_to_confirm;

  const displayName = product.product_req_name || "Unnamed Product";
  const hasSpecs = product.product_req_spec && product.product_req_spec.trim();

  return (
    <Card className="mb-4 w-full max-w-full border border-border" shadow="none">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={onToggleConfirm}
            >
              {isConfirmed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-default-400" />
              )}
            </div>

            <span className="inline-flex items-center shrink-0 justify-center w-8 h-8 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Package className="w-4 h-4" />
            </span>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  {displayName}
                </span>
                {isConfirmed ? (
                  <Chip size="sm" color="success" variant="flat">
                    ✓ Confirmed
                  </Chip>
                ) : (
                  <Chip size="sm" variant="flat">
                    Pending
                  </Chip>
                )}
              </div>
              {product.product_req_quantity && (
                <span className="text-xs text-muted-foreground truncate">
                  Quantity: {product.product_req_quantity}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              color="primary"
              variant="light"
              startContent={<Search className="w-4 h-4" />}
              className="text-xs"
            >
              Catalogue
            </Button>
            <Button
              size="sm"
              color="primary"
              variant="light"
              startContent={<Plus className="w-4 h-4" />}
              className="text-xs"
            >
              Add Manually
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isClosestMatchApproved && !selectedAlternative && (
        <CardBody className="pt-0 space-y-4">
          {/* Closest Match - First and most important */}
          {product.closest_match && (
            <div className="bg-success/5 border border-success/20 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-success/10 text-success">
                    <Star className="w-3.5 h-3.5" />
                  </span>
                  <h4 className="text-sm font-semibold text-success-700">
                    Recommended Match
                  </h4>
                </div>
                <Button
                  size="sm"
                  color="default"
                  variant="bordered"
                  onPress={onApproveClosestMatch}
                  startContent={<Star className="w-4 h-4" />}
                >
                  Approve
                </Button>
              </div>
              <p className="text-sm text-success-700 font-medium">
                {product.closest_match}
              </p>
            </div>
          )}

          {/* Alternative Products */}
          {alternativeProducts && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Alternative Products
              </h4>
              <div className="space-y-2">
                {alternativeProducts.map((alternative) => (
                  <div
                    key={alternative.id}
                    className={cn(
                      "border rounded-lg p-3 cursor-pointer transition-all hover:shadow-sm",
                      selectedAlternative === alternative.id
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-border/80"
                    )}
                    onClick={() => {
                      if (selectedAlternative === alternative.id) {
                        onSelectAlternative(null);
                      } else {
                        onSelectAlternative(alternative.id);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        isSelected={selectedAlternative === alternative.id}
                        size="sm"
                        readOnly
                        color="primary"
                      />
                      <span className="text-sm font-medium flex-1">
                        {alternative.product_req_name}
                      </span>
                      {selectedAlternative === alternative.id && (
                        <Chip size="sm" color="primary" variant="flat">
                          Selected
                        </Chip>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Requirements to Confirm */}
          {requirements && (
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-3">
                Requirements for Confirmation
              </h4>
              <div className="bg-warning/5 border border-warning/20 rounded-lg p-3">
                {requirements}
              </div>
            </div>
          )}

          {/* Product Specifications - Collapsed by default */}
          {hasSpecs && (
            <Accordion type="single" collapsible>
              <AccordionItem
                value="specifications"
                className="border rounded-lg"
              >
                <AccordionTrigger className="px-3 py-2 hover:no-underline">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-muted text-muted-foreground">
                      <FileText className="w-3 h-3" />
                    </span>
                    <span className="text-sm font-medium">
                      Technical Specifications
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-3 pb-3">
                  <div className="bg-muted/50 rounded-lg p-3 mt-2">
                    <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {product.product_req_spec}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          )}
        </CardBody>
      )}

      {/* Approved state - show primary-colored approved section */}
      {isClosestMatchApproved && product.closest_match && (
        <CardBody className="pt-0">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-sm font-semibold text-primary-700">
                  Approved Match
                </h4>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="solid"
                onPress={onApproveClosestMatch}
                startContent={<CheckCircle2 className="w-4 h-4" />}
              >
                Approved
              </Button>
            </div>
            <p className="text-sm text-primary-700 font-medium mt-2">
              {product.closest_match}
            </p>
          </div>
        </CardBody>
      )}

      {/* Selected Alternative state - show primary-colored selected section */}
      {selectedAlternative && !isClosestMatchApproved && (
        <CardBody className="pt-0">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-sm font-semibold text-primary-700">
                  Selected Alternative
                </h4>
              </div>
              <Button
                size="sm"
                color="primary"
                variant="solid"
                onPress={() => onSelectAlternative(null)}
                startContent={<CheckCircle2 className="w-4 h-4" />}
              >
                Selected
              </Button>
            </div>
            <p className="text-sm text-primary-700 font-medium mt-2">
              {selectedAlternative}
            </p>
          </div>
        </CardBody>
      )}
    </Card>
  );
}

export function ProductConfirmation({
  products,
  onConfirmationChange,
}: ProductConfirmationProps & {
  onConfirmationChange?: (confirmedProducts: Set<string>) => void;
}) {
  const [confirmedProducts, setConfirmedProducts] = useState<Set<string>>(
    new Set()
  );
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Record<string, string>
  >({});
  const [approvedClosestMatches, setApprovedClosestMatches] = useState<
    Set<string>
  >(new Set());

  const toggleConfirmed = (productKey: string) => {
    const newConfirmed = new Set(confirmedProducts);
    if (newConfirmed.has(productKey)) {
      // Unconfirming - reset to expanded state
      newConfirmed.delete(productKey);

      // Clear approved closest match state
      const newApproved = new Set(approvedClosestMatches);
      newApproved.delete(productKey);
      setApprovedClosestMatches(newApproved);

      // Clear selected alternative state
      const newAlternatives = { ...selectedAlternatives };
      delete newAlternatives[productKey];
      setSelectedAlternatives(newAlternatives);
    } else {
      newConfirmed.add(productKey);
    }
    setConfirmedProducts(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleSelectAlternative = (
    productKey: string,
    alternative: string | null
  ) => {
    const newAlternatives = { ...selectedAlternatives };
    const newConfirmed = new Set(confirmedProducts);

    if (alternative === null) {
      delete newAlternatives[productKey];
      // Don't remove from confirmed when deselecting alternative
    } else {
      newAlternatives[productKey] = alternative;
      // Auto-confirm when selecting an alternative
      newConfirmed.add(productKey);
    }

    setSelectedAlternatives(newAlternatives);
    setConfirmedProducts(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleApproveClosestMatch = (productKey: string) => {
    const newApproved = new Set(approvedClosestMatches);
    const newConfirmed = new Set(confirmedProducts);

    if (newApproved.has(productKey)) {
      // Un-approve: remove from approved and confirmed
      newApproved.delete(productKey);
      newConfirmed.delete(productKey);
    } else {
      // Approve: add to both approved and confirmed
      newApproved.add(productKey);
      newConfirmed.add(productKey);
    }

    setApprovedClosestMatches(newApproved);
    setConfirmedProducts(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleConfirmAll = () => {
    const allProductKeys = products.map((_, index) => `product-${index}`);
    const newConfirmed = new Set(allProductKeys);
    setConfirmedProducts(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleClearAll = () => {
    const newConfirmed = new Set<string>();
    setConfirmedProducts(newConfirmed);
    setSelectedAlternatives({});
    setApprovedClosestMatches(new Set());
    onConfirmationChange?.(newConfirmed);
  };

  const confirmedCount = confirmedProducts.size;
  const totalCount = products.length;
  const progressPercentage =
    totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  if (products.length === 0) {
    return (
      <div className="text-center py-6 text-default-500">
        <Package className="w-8 h-8 mx-auto mb-2 text-default-300" />
        <p className="text-sm">No products found for this part</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full">
      <div className="space-y-4 w-full">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-medium text-gray-600">
              Products ({totalCount})
            </h3>
            <p className="text-xs text-default-500 mt-1">
              {confirmedCount} of {totalCount} confirmed
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="flat"
              onPress={handleClearAll}
              isDisabled={confirmedCount === 0}
            >
              Clear All
            </Button>
            <Button
              size="sm"
              color="primary"
              onPress={handleConfirmAll}
              isDisabled={confirmedCount === totalCount}
            >
              Confirm All
            </Button>
          </div>
        </div>

        <div className="space-y-1">
          <div className="w-full bg-default-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-right">
            <span className="text-xs text-default-500">
              {progressPercentage}% Complete
            </span>
          </div>
        </div>

        <div className="space-y-3 w-full max-w-full">
          {products.map((product, index) => {
            const productKey = `product-${index}`;
            return (
              <ProductItem
                key={productKey}
                product={product}
                isConfirmed={confirmedProducts.has(productKey)}
                onToggleConfirm={() => toggleConfirmed(productKey)}
                selectedAlternative={selectedAlternatives[productKey] || null}
                onSelectAlternative={(alternative) =>
                  handleSelectAlternative(productKey, alternative)
                }
                onApproveClosestMatch={() =>
                  handleApproveClosestMatch(productKey)
                }
                isClosestMatchApproved={approvedClosestMatches.has(productKey)}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
