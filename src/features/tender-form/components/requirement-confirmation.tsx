"use client";

import { useEffect, useState } from "react";
import { Button, Chip, Card, CardBody, Tooltip } from "@heroui/react";
import {
  Package,
  CheckCircle2,
  Circle,
  Search,
  Plus,
  Wrench,
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
import {
  useCatalogProducts,
  CatalogProduct,
} from "$/features/products/api/use-catalog-products";

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
  onOpenCatalog: () => void;
  onRemoveProduct: () => void;
  catalogProducts?: CatalogProduct[];
  onSelectCatalogProduct: (product: CatalogProduct) => void;
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
        <div className="flex items-center justify-between gap-3">
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
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-foreground max-w-full break-words">
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
      </CardBody>
    </Card>
  );
}

function ProductRequirementItem({
  requirement,
  isConfirmed,
  selectedProduct,
  onOpenCatalog,
  onRemoveProduct,
  catalogProducts = [],
  onSelectCatalogProduct,
}: ProductRequirementItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const {
    product_req_name,
    product_req_quantity,
    requirements_to_confirm,
    product_req_spec,
    closest_match,
    alternative_products,
  } = requirement.tender_products || {};

  const productName = product_req_name;
  const quantity = product_req_quantity;

  const closestMatchProduct =
    catalogProducts?.find((p) => p.id === closest_match) || null;
  const alternativeProducts =
    catalogProducts?.filter((p) =>
      (alternative_products as string[])?.includes(p.id)
    ) || [];

  const hasDetails = Boolean(
    selectedProduct ||
      product_req_spec ||
      closest_match ||
      alternative_products ||
      requirements_to_confirm
  );

  const handleSelectCatalogProduct = (product: CatalogProduct) => {
    onSelectCatalogProduct(product);
    setIsOpen(false);
  };

  useEffect(() => {
    setIsOpen(false);
  }, [selectedProduct]);

  return (
    <Card
      className={`mb-3 w-full border transition-all duration-200 ${
        isConfirmed ? "border-green-200 bg-green-50/30" : "border-border"
      }`}
      shadow="none"
    >
      <CardBody className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <Tooltip content="To confirm this requirement, please select a product from the catalogue">
              <button className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                {isConfirmed ? (
                  <CheckCircle2 className="w-5 h-5 text-success" />
                ) : (
                  <Circle className="w-5 h-5 text-default-400" />
                )}
              </button>
            </Tooltip>

            <span className="inline-flex items-center shrink-0 justify-center w-6 h-6 rounded-full bg-primary/10 text-primary border border-primary/20">
              <Package className="w-3.5 h-3.5" />
            </span>

            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground truncate max-w-[600px]">
                  {productName}
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

        {selectedProduct && (
          <div className="mb-3">
            <Chip
              size="sm"
              variant="flat"
              className="text-xs"
              isCloseable
              onClose={onRemoveProduct}
            >
              Selected: {selectedProduct.name}
            </Chip>
          </div>
        )}

        <Accordion
          type="single"
          collapsible
          disabled={!hasDetails}
          value={isOpen ? "details" : "none"}
          onValueChange={(value) => setIsOpen(value === "details")}
        >
          <AccordionItem value="details" className="bg-muted p-2 rounded-md">
            <AccordionTrigger className="px-0 py-0 items-center hover:no-underline hover:cursor-pointer">
              <span className="text-xs text-muted-foreground">
                {hasDetails ? <>Show details</> : <>No additional details</>}
              </span>
            </AccordionTrigger>

            <AccordionContent className="space-y-3 mt-2">
              {product_req_spec && (
                <div className="text-sm">
                  <span className="font-medium mb-1 block">
                    Product Specification
                  </span>
                  <p className="text-foreground/90 whitespace-pre-wrap text-xs">
                    {product_req_spec}
                  </p>
                </div>
              )}

              {requirements_to_confirm && (
                <div className="text-sm">
                  <span className="font-medium mb-1 block">
                    Requirements to Confirm
                  </span>
                  <p className="text-foreground/90 whitespace-pre-wrap text-xs">
                    {requirements_to_confirm}
                  </p>
                </div>
              )}

              {closestMatchProduct && (
                <div className="text-sm">
                  <span className="font-medium mb-2 block">Closest Match</span>
                  <Chip
                    size="sm"
                    color="success"
                    variant="flat"
                    className="cursor-pointer hover:bg-success/20 transition-colors"
                    onClick={() =>
                      handleSelectCatalogProduct(closestMatchProduct)
                    }
                    startContent={<Tag className="w-3.5 h-3.5 mx-1" />}
                  >
                    {closestMatchProduct.name}
                  </Chip>
                </div>
              )}

              {alternativeProducts.length > 0 && (
                <div className="text-sm">
                  <span className="font-medium mb-2 block">
                    Alternative Products
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {alternativeProducts.map((product) => (
                      <Chip
                        key={product.id}
                        size="sm"
                        color="primary"
                        variant="flat"
                        className="cursor-pointer hover:bg-primary/20 transition-colors"
                        onClick={() => handleSelectCatalogProduct(product)}
                        startContent={<Tag className="w-3.5 h-3.5 mx-1" />}
                      >
                        {product.name}
                      </Chip>
                    ))}
                  </div>
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

  // Fetch catalog products for closest matches and alternatives
  const catalogProductIds = productRequirements.flatMap((req) => {
    const products = req.tender_products;
    if (!products) return [];

    const ids: (string | null | undefined)[] = [products.closest_match];
    if (products.alternative_products) {
      ids.push(...(products.alternative_products as string[]));
    }
    return ids;
  });

  const { data: catalogProducts } = useCatalogProducts(catalogProductIds);

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

  const handleSelectCatalogProduct =
    (productKey: string) => (product: CatalogProduct) => {
      // Convert CatalogProduct to ProductSearchResult format
      const productSearchResult = product as unknown as ProductSearchResult;

      const newSelectedProducts = { ...selectedProducts };
      newSelectedProducts[productKey] = productSearchResult;

      // Auto-confirm when selecting a product
      const newConfirmed = new Set(confirmedItems);
      newConfirmed.add(productKey);

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

      {serviceRequirements.length > 0 && (
        <div className="space-y-2 w-full">
          <h4 className="text-sm font-medium text-gray-600">Services</h4>
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

      {productRequirements.length > 0 && (
        <div className="space-y-2 w-full">
          <h4 className="text-sm font-medium text-gray-600">Products</h4>
          {productRequirements.map((requirement) => {
            const productReqKey = `product-req-${requirement.id}`;
            return (
              <ProductRequirementItem
                key={productReqKey}
                requirement={requirement}
                isConfirmed={confirmedItems.has(productReqKey)}
                selectedProduct={selectedProducts[productReqKey] || null}
                onOpenCatalog={() => handleOpenCatalog(productReqKey)}
                onRemoveProduct={() => handleRemoveProduct(productReqKey)}
                catalogProducts={catalogProducts}
                onSelectCatalogProduct={handleSelectCatalogProduct(
                  productReqKey
                )}
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
