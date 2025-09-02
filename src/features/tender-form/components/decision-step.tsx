"use client";

import { Button } from "@heroui/react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";

interface DecisionStepProps {
  item: InboxTenderMapping | null | undefined;
}

export function DecisionStep({ item }: DecisionStepProps) {
  const router = useRouter();
  const { mutate: updateTenderStatus, isPending } = useUpdateTenderStatus();

  if (!item) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">No item selected</p>
      </div>
    );
  }

  const handleYes = () => {
    toast.success(<p>Thank you for using mimira!</p>);
    router.push("/dashboard/tenders");
  };

  const handleNo = () => {
    updateTenderStatus(
      {
        mappingId: item.id,
        status: "decision_made_rejected",
      },
      {
        onSuccess: () => {
          toast.info(<p>This tender has been rejected</p>);
          router.push("/dashboard/tenders");
        },
        onError: () => {
          toast.error(<p>Failed to reject the tender. Please try again.</p>);
        },
      }
    );
  };

  return (
    <Card shadow="none">
      <CardHeader>
        <h2 className="text-lg font-semibold">
          Did you apply for this tender?
        </h2>
      </CardHeader>
      <CardBody>
        <div className="p-4 bg-muted rounded-md">
          <p className="text-sm text-muted-foreground">
            Your response will help us improve our tender management process.
          </p>
        </div>
      </CardBody>
      <CardFooter>
        <div className="flex justify-end gap-4 w-full">
          <Button variant="bordered" onPress={handleNo} disabled={isPending}>
            No i didn&apos;t apply
          </Button>
          <Button onPress={handleYes} disabled={isPending} color="primary">
            Yes, I applied
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
