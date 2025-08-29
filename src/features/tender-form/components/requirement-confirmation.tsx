"use client";

import { useState } from "react";
import { Button, Chip, Card, CardBody } from "@heroui/react";
import {
  Package,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Wrench,
  FileText,
  Tag,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "$/components/ui/accordion";
import { InboxTenderRequirement } from "$/features/inbox/api/use-tender-inbox-query";
import { ProductSearchResult } from "$/features/products/api/use-products-search";
import { CatalogDialog } from "$/features/products/components/catalog-dialog";

interface RequirementConfirmationProps {
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
  selectedProduct: ProductSearchResult | null;
  onToggleConfirm: () => void;
  onOpenCatalog: () => void;
  onRemoveProduct: () => void;
}

function ServiceRequirementItem({
  requirement,
  isConfirmed,
  onToggleConfirm,
}: ServiceRequirementItemProps) {
  return (
    <Card
      className={`mb-3 w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
    >
      <CardBody className="p-3">
        <div className="flex items-center gap-3 w-full">
          <button
            onClick={onToggleConfirm}
            className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
          >
            {isConfirmed ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : (
              <Circle className="w-5 h-5 text-default-400" />
            )}
          </button>

          <span className="inline-flex items-center shrink-0 justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-600 border border-blue-200">
            <Wrench className="w-3.5 h-3.5" />
          </span>

          <div className="flex flex-col min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground truncate">
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
            {requirement.reason && (
              <p className="text-xs text-muted-foreground mt-1">
                {requirement.reason}
              </p>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}

function ProductRequirementItem({
  requirement,
  isConfirmed,
  selectedProduct,
  onToggleConfirm,
  onOpenCatalog,
  onRemoveProduct,
}: ProductRequirementItemProps) {
  const productName = requirement.tender_products?.product_req_name;
  const quantity = requirement.tender_products?.product_req_quantity;
  const displayName =
    productName || requirement.requirement_text || "Unnamed Product";

  const hasDetails = Boolean(requirement.reason || selectedProduct);

  return (
    <Card
      className={`mb-3 w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
    >
      <CardBody className="p-3">
        <Accordion type="single" collapsible disabled={!hasDetails}>
          <AccordionItem value="details">
            <AccordionTrigger className="px-0 py-0 items-center hover:no-underline hover:cursor-pointer">
              <div className="flex w-full items-center justify-between">
                <div className="flex items-center gap-3">
                  <button
                    onClick={onToggleConfirm}
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    {isConfirmed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Circle className="w-5 h-5 text-default-400" />
                    )}
                  </button>

                  <span className="inline-flex items-center shrink-0 justify-center w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20">
                    <Package className="w-3.5 h-3.5" />
                  </span>

                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-foreground truncate">
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
                    <div className="flex items-center gap-2 mt-0.5">
                      {productName && productName !== displayName && (
                        <span className="text-xs text-muted-foreground">
                          Product: {productName}
                        </span>
                      )}
                      {quantity && (
                        <Chip size="sm" variant="flat" className="text-xs">
                          {quantity}
                        </Chip>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    startContent={<Search className="w-3.5 h-3.5" />}
                    className="text-xs px-2"
                    onPress={onOpenCatalog}
                  >
                    Catalogue
                  </Button>
                  <Button
                    size="sm"
                    color="primary"
                    variant="light"
                    startContent={<Plus className="w-3.5 h-3.5" />}
                    className="text-xs px-2"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </AccordionTrigger>

            <AccordionContent className="px-0 pt-3 space-y-3">
              {requirement.reason && (
                <div className="text-sm bg-muted/5 border border-muted/20 rounded-md p-3 leading-relaxed">
                  <span className="inline-flex items-center gap-1 font-medium mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    Requirement Details
                  </span>
                  <p className="text-foreground/90 whitespace-pre-wrap mt-1">
                    {requirement.reason}
                  </p>
                </div>
              )}

              {selectedProduct && (
                <div className="text-sm bg-primary/5 border border-primary/20 rounded-md p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="inline-flex items-center gap-1 font-medium">
                      <Tag className="w-3.5 h-3.5 text-success" />
                      Selected Product
                    </span>
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={onRemoveProduct}
                      className="text-xs px-2"
                    >
                      Remove
                    </Button>
                  </div>
                  <p className="text-primary-700 font-medium">
                    {selectedProduct.name}
                  </p>
                  {selectedProduct.subcategory?.name && (
                    <p className="text-xs text-primary-600 mt-1">
                      {selectedProduct.subcategory.name}
                    </p>
                  )}
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardBody>
    </Card>
  );
}

export function RequirementConfirmation({
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

  const totalCount = serviceRequirements.length + productRequirements.length;
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
    <div className="space-y-4 w-full max-w-full overflow-hidden">
      <div className="flex items-center justify-between min-w-0">
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-semibold">Requirements to Confirm</h3>
          <p className="text-sm text-gray-500">
            {confirmedCount} of {totalCount} confirmed ({progressPercentage}%)
          </p>
        </div>

        <div className="flex items-center gap-1.5 flex-shrink-0">
          <Button
            size="sm"
            variant="flat"
            onPress={handleClearAll}
            isDisabled={confirmedCount === 0}
            className="text-xs px-3"
          >
            Clear All
          </Button>
          <Button
            size="sm"
            color="primary"
            onPress={handleConfirmAll}
            isDisabled={confirmedCount === totalCount}
            className="text-xs px-3"
          >
            Confirm All
          </Button>
        </div>
      </div>

      <div className="w-full bg-default-200 rounded-full h-1.5">
        <div
          className="bg-primary h-1.5 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Service Requirements */}
      {serviceRequirements.length > 0 && (
        <div className="space-y-2 w-full">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
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
        <div className="space-y-2 w-full">
          <h4 className="text-sm font-medium text-gray-600 mb-1">
            Product Requirements ({productRequirements.length})
          </h4>
          {productRequirements.map((requirement) => {
            const productReqKey = `product-req-${requirement.id}`;
            return (
              <ProductRequirementItem
                key={productReqKey}
                requirement={requirement}
                isConfirmed={confirmedItems.has(productReqKey)}
                selectedProduct={selectedProducts[productReqKey] || null}
                onToggleConfirm={() => toggleItemConfirmed(productReqKey)}
                onOpenCatalog={() => handleOpenCatalog(productReqKey)}
                onRemoveProduct={() => handleRemoveProduct(productReqKey)}
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
