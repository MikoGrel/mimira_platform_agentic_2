"use client";

import { Alert, Button, Divider, Radio, RadioGroup } from "@heroui/react";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/react";
import { useUpdateTenderStatus } from "$/features/tenders/api/use-update-tender-status";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { useRouter } from "next/navigation";
import React from "react";
import { toast } from "sonner";
import { Controller, useForm } from "react-hook-form";
import { MappingStatus } from "$/features/tenders/constants/status";

interface DecisionStepProps {
  item: InboxTenderMapping | null | undefined;
}

interface DecisionFormData {
  decision: "applied" | "not_applied";
}

export function DecisionStep({ item }: DecisionStepProps) {
  const router = useRouter();
  const { mutate: updateTenderStatus, isPending } = useUpdateTenderStatus();
  const { control, handleSubmit } = useForm<DecisionFormData>();

  if (!item) return null;

  const onSubmit = handleSubmit((data) => {
    if (data.decision === "applied") {
      toast.success(<p>Thank you for using mimira!</p>);
      router.push("/dashboard/tenders");
    } else {
      updateTenderStatus(
        {
          mappingId: item.id,
          status: MappingStatus.decision_made_rejected,
        },
        {
          onSuccess: () => {
            toast.info(<p>This tender has been rejected</p>);
            router.push("/dashboard/tenders");
          },
        }
      );
    }
  });

  return (
    <form onSubmit={onSubmit}>
      <Card shadow="sm">
        <CardHeader>Final decision</CardHeader>
        <Divider />
        <CardBody className="gap-4">
          <p className="text-sm text-muted-foreground">
            Review all information before making your final decision.
          </p>
          <Alert color="primary" className="text-sm">
            {item.tenders.application_form_llm}
          </Alert>
          <div className="flex flex-col gap-2">
            <Controller
              control={control}
              name="decision"
              render={({ field, fieldState }) => (
                <RadioGroup
                  label="Company's decision"
                  errorMessage={fieldState.error?.message}
                  isInvalid={!!fieldState.error}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  name={field.name}
                >
                  <Radio value="applied" classNames={{ label: "pl-1" }}>
                    Applied to tender
                  </Radio>
                  <Radio value="not_applied" classNames={{ label: "pl-1" }}>
                    Cancel the application
                  </Radio>
                </RadioGroup>
              )}
            />
          </div>
        </CardBody>
        <CardFooter className="justify-end">
          <Button type="submit" disabled={isPending} color="primary">
            Save and go back to inbox
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
