"use client";

import { useState } from "react";
import { Button, Chip, Card, CardBody, CardHeader } from "@heroui/react";
import {
  Package,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  FileText,
  Wrench,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import {
  InboxTenderProduct,
  InboxTenderRequirement,
} from "$/features/inbox/api/use-tender-inbox-query";
import { ProductSearchResult } from "$/features/products/api/use-products-search";
import { CatalogDialog } from "$/features/products/components/catalog-dialog";

interface RequirementConfirmationProps {
  products?: InboxTenderProduct[];
  serviceRequirements?: Array<InboxTenderRequirement>;
  productRequirements?: Array<InboxTenderRequirement>;
  onConfirmationChange?: (confirmedItems: Set<string>) => void;
}

interface ServiceRequirementItemProps {
  requirement: InboxTenderRequirement;
  isConfirmed: boolean;
  onToggleConfirm: () => void;
}

interface ProductRequirementItemProps {
  requirement: InboxTenderRequirement;
  isConfirmed: boolean;
  onToggleConfirm: () => void;
}

function ServiceRequirementItem({
  requirement,
  isConfirmed,
  onToggleConfirm,
}: ServiceRequirementItemProps) {
  return (
    <Card
      className={`mb-4 w-full max-w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
      isPressable
      onPress={onToggleConfirm}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 cursor-pointer">
            {isConfirmed ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-default-400" />
            )}
          </div>

          <span className="inline-flex items-center shrink-0 justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
            <Wrench className="w-4 h-4" />
          </span>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground truncate">
                {requirement.requirement_text}
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
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

function ProductRequirementItem({
  requirement,
  isConfirmed,
  onToggleConfirm,
}: ProductRequirementItemProps) {
  const productName = requirement.tender_products?.product_req_name;
  const quantity = requirement.tender_products?.product_req_quantity;

  return (
    <Card
      className={`mb-4 w-full max-w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
      isPressable
      onPress={onToggleConfirm}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center gap-3 w-full">
          <div className="flex items-center gap-2 cursor-pointer">
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
                {requirement.requirement_text}
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

            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-muted-foreground">
                Product: {productName}
              </span>
              {quantity && (
                <span className="text-xs text-muted-foreground">
                  (Qty: {quantity})
                </span>
              )}
            </div>

            {requirement.reason && (
              <div className="mt-2 p-2 bg-muted/50 rounded text-xs text-muted-foreground">
                Reason: {requirement.reason}
              </div>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}

interface ProductItemProps {
  product: InboxTenderProduct;
  isConfirmed: boolean;
  selectedProduct: ProductSearchResult | null;
  onToggleConfirm: () => void;
  onOpenCatalog: () => void;
  onRemoveProduct: () => void;
}

function ProductItem({
  product,
  isConfirmed,
  selectedProduct,
  onToggleConfirm,
  onOpenCatalog,
  onRemoveProduct,
}: ProductItemProps) {
  const requirements = product.requirements_to_confirm;
  const displayName = product.product_req_name || "Unnamed Product";
  const hasSpecs = product.product_req_spec && product.product_req_spec.trim();

  return (
    <Card
      className={`mb-4 w-full max-w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
      isPressable
      onPress={onToggleConfirm}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 cursor-pointer">
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
              onPress={onOpenCatalog}
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

      {!selectedProduct && (
        <CardBody className="pt-0 space-y-4">
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

      {selectedProduct && (
        <CardBody className="pt-0">
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary/10 text-primary">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
                <h4 className="text-sm font-semibold text-primary-700">
                  Selected Product
                </h4>
              </div>
              <Button
                size="sm"
                color="danger"
                variant="light"
                onPress={onRemoveProduct}
                startContent={<Circle className="w-4 h-4" />}
              >
                Remove
              </Button>
            </div>
            <p className="text-sm text-primary-700 font-medium mt-2">
              {selectedProduct.name}
            </p>
            {selectedProduct.subcategory?.name && (
              <p className="text-xs text-primary-600 mt-1">
                {selectedProduct.subcategory.name}
              </p>
            )}
          </div>
        </CardBody>
      )}
    </Card>
  );
}

export function RequirementConfirmation({
  products = [],
  serviceRequirements = [],
  productRequirements = [],
  onConfirmationChange,
}: RequirementConfirmationProps) {
  const [confirmedItems, setConfirmedItems] = useState<Set<string>>(new Set());
  const [selectedProducts, setSelectedProducts] = useState<
    Record<string, ProductSearchResult>
  >({});
  const [catalogDialogOpen, setCatalogDialogOpen] = useState(false);
  const [editingProductKey, setEditingProductKey] = useState<string | null>(
    null
  );

  console.log(confirmedItems);

  const toggleItemConfirmed = (itemKey: string) => {
    const newConfirmed = new Set(confirmedItems);
    if (newConfirmed.has(itemKey)) {
      newConfirmed.delete(itemKey);
    } else {
      newConfirmed.add(itemKey);
    }
    setConfirmedItems(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleOpenCatalog = (productKey: string) => {
    setEditingProductKey(productKey);
    setCatalogDialogOpen(true);
  };

  const handleProductSelected = (product: ProductSearchResult) => {
    if (!editingProductKey) return;

    const newSelectedProducts = { ...selectedProducts };
    newSelectedProducts[editingProductKey] = product;

    // Auto-confirm when selecting a product
    const newConfirmed = new Set(confirmedItems);
    newConfirmed.add(editingProductKey);

    setSelectedProducts(newSelectedProducts);
    setConfirmedItems(newConfirmed);
    setCatalogDialogOpen(false);
    setEditingProductKey(null);
    onConfirmationChange?.(newConfirmed);
  };

  const handleRemoveProduct = (productKey: string) => {
    const newSelectedProducts = { ...selectedProducts };
    delete newSelectedProducts[productKey];

    const newConfirmed = new Set(confirmedItems);
    newConfirmed.delete(productKey);

    setSelectedProducts(newSelectedProducts);
    setConfirmedItems(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleConfirmAll = () => {
    const allKeys = [
      ...products.map((_, index) => `product-${index}`),
      ...serviceRequirements.map((req) => `service-${req.id}`),
      ...productRequirements.map((req) => `product-req-${req.id}`),
    ];
    const newConfirmed = new Set(allKeys);
    setConfirmedItems(newConfirmed);
    onConfirmationChange?.(newConfirmed);
  };

  const handleClearAll = () => {
    const newConfirmed = new Set<string>();
    setConfirmedItems(newConfirmed);
    setSelectedProducts({});
    onConfirmationChange?.(newConfirmed);
  };

  const totalCount =
    products.length + serviceRequirements.length + productRequirements.length;
  const confirmedCount = confirmedItems.size;
  const progressPercentage =
    totalCount > 0 ? Math.round((confirmedCount / totalCount) * 100) : 0;

  if (totalCount === 0) {
    return (
      <div className="text-center py-6 text-primary">
        <Package className="w-8 h-8 mx-auto mb-2 text-primary" />
        <p className="text-sm">
          All requirements were confirmed, go to the next step!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">Requirements to Confirm</h3>
          <p className="text-sm text-gray-500 mt-1">
            {confirmedCount} of {totalCount} confirmed
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
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

      {/* Product Requirements */}
      {products.length > 0 && (
        <div className="space-y-3 w-full">
          <h4 className="text-sm font-medium text-gray-600">
            Product Requirements ({products.length})
          </h4>
          {products.map((product, index) => {
            const productKey = `product-${index}`;
            return (
              <ProductItem
                key={productKey}
                product={product}
                isConfirmed={confirmedItems.has(productKey)}
                selectedProduct={selectedProducts[productKey] || null}
                onToggleConfirm={() => toggleItemConfirmed(productKey)}
                onOpenCatalog={() => handleOpenCatalog(productKey)}
                onRemoveProduct={() => handleRemoveProduct(productKey)}
              />
            );
          })}
        </div>
      )}

      {/* Service Requirements */}
      {serviceRequirements.length > 0 && (
        <div className="space-y-3 w-full">
          <h4 className="text-sm font-medium text-gray-600">
            Service Requirements ({serviceRequirements.length})
          </h4>
          {serviceRequirements.map((requirement) => {
            const serviceKey = `service-${requirement.id}`;
            return (
              <ServiceRequirementItem
                key={serviceKey}
                requirement={requirement}
                isConfirmed={confirmedItems.has(serviceKey)}
                onToggleConfirm={() => toggleItemConfirmed(serviceKey)}
              />
            );
          })}
        </div>
      )}

      {/* Product Requirements */}
      {productRequirements.length > 0 && (
        <div className="space-y-3 w-full">
          <h4 className="text-sm font-medium text-gray-600">
            Product Requirements ({productRequirements.length})
          </h4>
          {productRequirements.map((requirement) => {
            const productReqKey = `product-req-${requirement.id}`;
            return (
              <ProductRequirementItem
                key={productReqKey}
                requirement={requirement}
                isConfirmed={confirmedItems.has(productReqKey)}
                onToggleConfirm={() => toggleItemConfirmed(productReqKey)}
              />
            );
          })}
        </div>
      )}

      <CatalogDialog
        open={catalogDialogOpen}
        onOpenChange={setCatalogDialogOpen}
        onFinish={handleProductSelected}
      />
    </div>
  );
}
