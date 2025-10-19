"use client";

import { useState, useEffect, useMemo } from "react";
import React from "react";
import { groupBy } from "lodash-es";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { CompanyFileType, useCompanyFiles } from "../hooks/use-company-files";
import { Alert, Button, Card, CardBody, Checkbox, Link } from "@heroui/react";
import { FileGroup } from "./file-group";
import { DocumentPreparationAnimation } from "./document-preparation-animation";
import { useUpdateTenderStatus } from "$/features/tenders";
import { MappingStatus } from "$/features/tenders/constants/status";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ExternalLink,
  CalendarClock,
  FileText,
  CheckCircle2,
} from "lucide-react";
import { Section } from "$/features/inbox/components/section";
import { SectionTitle } from "$/features/inbox/components/section-title";
import { SectionContent } from "$/features/inbox/components/section-content";
import { StatusCard } from "$/features/inbox/components/status-card";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import {
  Empty,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "$/components/ui/empty";

interface DocumentsDecisionStepProps {
  item: InboxTenderMapping | null | undefined;
  setNextEnabled?: (enabled: boolean) => void;
}

type FileGroupKey = "refilled" | "optional" | "other";

interface GroupedFiles {
  refilled: CompanyFileType[];
  optional: CompanyFileType[];
  other: CompanyFileType[];
}

export function DocumentsDecisionStep({
  item,
  setNextEnabled,
}: DocumentsDecisionStepProps) {
  const router = useRouter();
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { relativeToNow } = useDateFormat();

  useEffect(() => {
    if (setNextEnabled) {
      setNextEnabled(true);
    }
  }, [setNextEnabled]);

  const {
    data: files,
    isLoading,
    error,
  } = useCompanyFiles({
    mappingId: item?.id,
  });

  const { mutate: updateTenderStatus } = useUpdateTenderStatus();

  const groupedFiles: GroupedFiles = useMemo(() => {
    if (!files) {
      return {
        refilled: [],
        optional: [],
        other: [],
      };
    }

    const groupedByType = groupBy(files, (file) =>
      file.file_type && ["refilled", "optional"].includes(file.file_type)
        ? (file.file_type as FileGroupKey)
        : "other"
    );

    return {
      refilled: groupedByType.refilled || [],
      optional: groupedByType.optional || [],
      other: groupedByType.other || [],
    };
  }, [files]);

  const handleConfirmSubmission = () => {
    if (!isConfirmed) {
      toast.error("Please confirm that you have submitted the offer");
      return;
    }

    setIsSubmitting(true);
    updateTenderStatus(
      {
        mappingId: item!.id,
        status: MappingStatus.decision_made_applied,
      },
      {
        onSuccess: () => {
          toast.success(
            <>Offer submitted successfully for {item?.tenders.order_object}</>
          );
          router.push("/dashboard/tenders");
        },
        onError: () => {
          toast.error("Failed to update status");
          setIsSubmitting(false);
        },
      }
    );
  };

  const handleReject = () => {
    updateTenderStatus(
      {
        mappingId: item!.id,
        status: MappingStatus.decision_made_rejected,
      },
      {
        onSuccess: () => {
          toast.info(<>Tender {item?.tenders.order_object} was rejected</>);
          router.push("/dashboard/tenders");
        },
      }
    );
  };

  const remainingDocuments = Array.isArray(item?.other_req_docs)
    ? (item.other_req_docs as string[])
    : [];

  if (item?.status === MappingStatus.decision_made_applied) {
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 400px)" }}
      >
        <Empty>
          <EmptyHeader>
            <EmptyMedia
              variant="icon"
              className="bg-success-100 border border-success-200"
            >
              <CheckCircle2 className="w-6 h-6 text-success-500" />
            </EmptyMedia>
            <EmptyTitle className="text-base font-medium">
              You&apos;ve applied to this tender
            </EmptyTitle>
          </EmptyHeader>
        </Empty>
      </div>
    );
  }

  if (!item?.docs_ready)
    return (
      <div
        className="flex items-center justify-center"
        style={{ minHeight: "calc(100vh - 400px)" }}
      >
        <div className="space-y-4 max-w-[500px]">
          <h1 className="text-sm font-medium">
            We will prepare your documents. They will be ready within 48 hours
            at the latest
          </h1>
          <DocumentPreparationAnimation />
          <p className="text-xs text-muted-foreground">
            Don&apos;t forget to include the valuation. We can also help you
            with it — just let us know at mimira@mimiraoffers.eu or +48 732 070
            469.
          </p>
          <Button
            size="sm"
            variant="flat"
            color="danger"
            fullWidth
            data-lingo-override-pl="Anuluj przygotowanie i odrzuć ten przetarg"
            onPress={handleReject}
          >
            Cancel preparation and reject this tender
          </Button>
        </div>
      </div>
    );

  if (isLoading) {
    return (
      <div className="text-center py-6 text-gray-500">
        <p className="text-sm">
          <span>Loading documents...</span>
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-6 text-red-500">
        <p className="text-sm">
          <span>Failed to load documents. Please try again.</span>
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Section className="mx-auto">
        <SectionContent>
          <Alert color="success" variant="faded">
            Congratulations! You can now submit your offer
          </Alert>
        </SectionContent>
      </Section>
      <Section className="mx-auto">
        <SectionTitle>Basic submission Information</SectionTitle>
        <SectionContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {item?.tenders?.url_user && (
              <StatusCard
                icon={ExternalLink}
                title="Platform submission link"
                type="info"
              >
                <Link
                  href={item.tenders.url_user}
                  isExternal
                  className="text-xs break-all"
                >
                  {item.tenders.url_user}
                </Link>
              </StatusCard>
            )}

            {item?.tenders?.submitting_offers_date && (
              <StatusCard
                icon={CalendarClock}
                title="Submission deadline"
                type="warning"
              >
                {relativeToNow(new Date(item.tenders.submitting_offers_date))}
              </StatusCard>
            )}

            {item?.tenders?.deposit_llm && (
              <StatusCard icon={FileText} title="Deposit (Wadium)" type="info">
                {item.tenders.deposit_llm}
              </StatusCard>
            )}
          </div>

          {item?.tenders?.application_form_llm && (
            <StatusCard
              icon={FileText}
              title="Application Instructions"
              type="info"
              bodyClassName="text-black text-sm leading-snug"
            >
              {item.tenders.application_form_llm.replaceAll("\\n", "\n\n")}
            </StatusCard>
          )}
        </SectionContent>
      </Section>

      <Section className="mx-auto">
        <SectionTitle>Ready documents to Download</SectionTitle>

        <SectionContent>
          <FileGroup
            zipName={"completed_" + item?.tenders.order_object?.slice(0, 80)}
            label={<>Ready documentation</>}
            files={groupedFiles.refilled}
            showDownloadAll
            defaultOpen
          />
          <FileGroup
            zipName={
              "requires_manual_fill_" + item?.tenders.order_object?.slice(0, 80)
            }
            label={<>Requires manual fill</>}
            files={groupedFiles.optional}
            showDownloadAll
            defaultOpen
          />
          <FileGroup
            zipName={
              "other_attachments_" + item?.tenders.order_object?.slice(0, 80)
            }
            label={<>Other attachments</>}
            files={groupedFiles.other}
            showDownloadAll
          />
        </SectionContent>
      </Section>

      {remainingDocuments && remainingDocuments.length > 0 && (
        <Section className="mx-auto">
          <SectionTitle>Additional Documents to Attach</SectionTitle>
          <SectionContent>
            <Card shadow="none" className="border">
              <CardBody className="gap-3">
                <p className="text-sm text-muted-foreground">
                  Please ensure you also include these documents when submitting
                  your offer:
                </p>
                <ul className="space-y-2">
                  {remainingDocuments.map((doc, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-primary mt-1">•</span>
                      <span>{doc}</span>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          </SectionContent>
        </Section>
      )}

      <Section className="mx-auto">
        <SectionTitle>Company&apos;s decision</SectionTitle>
        <SectionContent>
          <Card shadow="none" className="border">
            <CardBody className="gap-4">
              <Alert color="warning" className="text-sm" variant="faded">
                <strong>Important:</strong> You are responsible for submitting
                the offer through the platform. After submitting, please confirm
                below.
              </Alert>

              <Checkbox
                isSelected={isConfirmed}
                onValueChange={setIsConfirmed}
                classNames={{
                  label: "text-sm",
                }}
              >
                I confirm that I have submitted the offer through the platform
              </Checkbox>

              <div className="flex gap-2 justify-end pt-2">
                <Button
                  variant="flat"
                  onPress={handleReject}
                  isDisabled={isSubmitting}
                >
                  Reject this tender
                </Button>
                <Button
                  color="success"
                  className="text-white"
                  onPress={handleConfirmSubmission}
                  isDisabled={!isConfirmed}
                  isLoading={isSubmitting}
                >
                  Confirm Submission
                </Button>
              </div>
            </CardBody>
          </Card>
        </SectionContent>
      </Section>
    </div>
  );
}
