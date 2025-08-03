import { cn } from "$/lib/utils";
import { Card, CardBody, CardHeader, Spinner } from "@heroui/react";
import { PropsWithChildren, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

interface BentoCardProps {
  className?: string;
  bodyClassName?: string;
  title?: ReactNode;
  titleExtra?: ReactNode;
  loading?: boolean;
}

export function BentoCard({
  className,
  title,
  titleExtra,
  children,
  bodyClassName,
  loading,
}: PropsWithChildren<BentoCardProps>) {
  return (
    <Card className={cn("rounded-3xl p-4", className)} shadow="sm">
      <CardHeader className="flex justify-between">
        <h3 className="font-medium">{title}</h3>

        <div>{titleExtra}</div>
      </CardHeader>
      {!loading && <CardBody className={bodyClassName}>{children}</CardBody>}

      <AnimatePresence>
        {loading && (
          <motion.div
            className="absolute inset-0 bg-background flex items-center justify-center"
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <Spinner />
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}
