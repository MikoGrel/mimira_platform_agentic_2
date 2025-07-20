import { cn } from "$/lib/utils";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { PropsWithChildren, ReactNode } from "react";

interface BentoCardProps {
  className?: string;
  bodyClassName?: string;
  title?: ReactNode;
  titleExtra?: ReactNode;
}

export function BentoCard({
  className,
  title,
  titleExtra,
  children,
  bodyClassName,
}: PropsWithChildren<BentoCardProps>) {
  return (
    <Card className={cn("rounded-3xl p-4", className)} shadow="sm">
      <CardHeader className="flex justify-between">
        <h3 className="font-medium">{title}</h3>

        <div>{titleExtra}</div>
      </CardHeader>
      <CardBody className={bodyClassName}>{children}</CardBody>
    </Card>
  );
}
