"use client";

import { Card, CardBody, Checkbox, cn } from "@heroui/react";
import { ComponentProps } from "react";

type CheckboxCardProps = ComponentProps<typeof Checkbox>;

export const CheckboxCard = ({
  classNames,
  children,
  ...props
}: CheckboxCardProps) => {
  return (
    <Card
      isPressable
      shadow="none"
      radius="none"
      className="bg-content1 shrink-0 text-sm p-0 pt-1 border border-collapse"
    >
      <CardBody className="flex flex-row items-start gap-2 p-3">
        <Checkbox
          {...props}
          classNames={{
            base: cn("w-6 pr-1", classNames?.base),
            wrapper: cn(classNames?.wrapper),
            icon: cn(classNames?.icon),
            label: cn("block w-full", classNames?.label),
          }}
        />
        <div className="px-3">{children}</div>
      </CardBody>
    </Card>
  );
};
