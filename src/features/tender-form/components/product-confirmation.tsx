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
  ChevronDown,
  ChevronRight,
  Package,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "$/lib/utils";

// Product type from tender API
type TenderProduct = {
  part_uuid: string;
  product_req_name: string | null;
  product_req_quantity: string | null;
  product_req_spec: string | null;
  requirements_to_confirm: string | null;
  alternative_products: string | null;
  closest_match: string | null;
};

interface ProductConfirmationProps {
  products: TenderProduct[];
  partName?: string;
  partId?: number;
}

interface ProductItemProps {
  product: TenderProduct;
  isExpanded: boolean;
  onToggleExpand: () => void;
  isConfirmed: boolean;
  onToggleConfirm: () => void;
  selectedAlternative: string | null;
  onSelectAlternative: (alternative: string | null) => void;
}

function ProductItem({
  product,
  isExpanded,
  onToggleExpand,
  isConfirmed,
  onToggleConfirm,
  selectedAlternative,
  onSelectAlternative,
}: ProductItemProps) {
  const hasAlternatives = product.alternative_products;
  const alternatives = hasAlternatives
    ? product
        .alternative_products!.split(",")
        .map((alt) => alt.trim())
        .filter(Boolean)
    : [];

  const requirements = product.requirements_to_confirm
    ? product.requirements_to_confirm
        .split(",")
        .map((req) => req.trim())
        .filter(Boolean)
    : [];

  const displayName = product.product_req_name || "Unnamed Product";
  const hasSpecs = product.product_req_spec && product.product_req_spec.trim();

  return (
    <Card className="mb-3 w-full max-w-full" shadow="sm">
      <CardHeader className="cursor-pointer pb-2" onClick={onToggleExpand}>
        <div className="flex items-center justify-between w-full min-w-0">
          <div className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onToggleConfirm();
              }}
            >
              {isConfirmed ? (
                <CheckCircle2 className="w-5 h-5 text-success" />
              ) : (
                <Circle className="w-5 h-5 text-default-400" />
              )}
            </div>

            <Package className="w-4 h-4 text-primary" />

            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-sm font-medium text-left truncate">
                {displayName}
              </span>
              {product.product_req_quantity && (
                <span className="text-xs text-default-500 truncate">
                  {product.product_req_quantity}
                </span>
              )}
            </div>

            {selectedAlternative && (
              <Chip size="sm" color="success" variant="flat">
                Alternative Selected
              </Chip>
            )}
          </div>

          <div className="flex items-center gap-2">
            {isConfirmed ? (
              <Chip size="sm" color="success" variant="flat">
                ✓ Confirmed
              </Chip>
            ) : (
              <Chip size="sm" variant="flat">
                Pending
              </Chip>
            )}

            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-default-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-default-400" />
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardBody className="pt-0">
          <div className="space-y-4">
            {/* Product Specifications */}
            {hasSpecs && (
              <div>
                <h5 className="text-xs font-semibold text-default-600 mb-2">
                  Specifications
                </h5>
                <div className="bg-default-50 p-3 rounded-lg">
                  <p className="text-xs text-default-700 whitespace-pre-wrap">
                    {product.product_req_spec}
                  </p>
                </div>
              </div>
            )}

            {/* Requirements to Confirm */}
            {requirements.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-default-600 mb-2">
                  Requirements for Confirmation
                </h5>
                <div className="space-y-1">
                  {requirements.map((req, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="w-1 h-1 rounded-full bg-warning mt-2 flex-shrink-0" />
                      <span className="text-xs text-default-600">{req}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternative Products */}
            {alternatives.length > 0 && (
              <div>
                <h5 className="text-xs font-semibold text-default-600 mb-2">
                  Alternative Products
                </h5>
                <div className="space-y-2">
                  {alternatives.map((alternative, index) => (
                    <div
                      key={index}
                      className={cn(
                        "border rounded-lg p-3 cursor-pointer transition-all",
                        selectedAlternative === alternative
                          ? "border-success bg-success-50"
                          : "border-default-200 hover:border-default-300"
                      )}
                      onClick={() => {
                        if (selectedAlternative === alternative) {
                          onSelectAlternative(null);
                        } else {
                          onSelectAlternative(alternative);
                        }
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Checkbox
                          isSelected={selectedAlternative === alternative}
                          size="sm"
                          readOnly
                        />
                        <span className="text-xs font-medium">
                          {alternative}
                        </span>
                        {selectedAlternative === alternative && (
                          <Chip size="sm" color="success" variant="flat">
                            Selected
                          </Chip>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closest Match */}
            {product.closest_match && (
              <div>
                <h5 className="text-xs font-semibold text-default-600 mb-2">
                  Suggested Best Match
                </h5>
                <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg">
                  <p className="text-xs text-primary-700">
                    {product.closest_match}
                  </p>
                </div>
              </div>
            )}
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
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(
    new Set()
  );
  const [confirmedProducts, setConfirmedProducts] = useState<Set<string>>(
    new Set()
  );
  const [selectedAlternatives, setSelectedAlternatives] = useState<
    Record<string, string>
  >({});

  const toggleExpanded = (productKey: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(productKey)) {
      newExpanded.delete(productKey);
    } else {
      newExpanded.add(productKey);
    }
    setExpandedProducts(newExpanded);
  };

  const toggleConfirmed = (productKey: string) => {
    const newConfirmed = new Set(confirmedProducts);
    if (newConfirmed.has(productKey)) {
      newConfirmed.delete(productKey);
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
    if (alternative === null) {
      delete newAlternatives[productKey];
    } else {
      newAlternatives[productKey] = alternative;
    }
    setSelectedAlternatives(newAlternatives);
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

        <div className="space-y-2 w-full max-w-full">
          {products.map((product, index) => {
            const productKey = `product-${index}`;
            return (
              <ProductItem
                key={productKey}
                product={product}
                isExpanded={expandedProducts.has(productKey)}
                onToggleExpand={() => toggleExpanded(productKey)}
                isConfirmed={confirmedProducts.has(productKey)}
                onToggleConfirm={() => toggleConfirmed(productKey)}
                selectedAlternative={selectedAlternatives[productKey] || null}
                onSelectAlternative={(alternative) =>
                  handleSelectAlternative(productKey, alternative)
                }
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
