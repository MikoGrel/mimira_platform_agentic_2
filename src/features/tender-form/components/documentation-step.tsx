"use client";

import { useState, useEffect } from "react";
import React from "react";
import { groupBy } from "lodash-es";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { CompanyFileType, useCompanyFiles } from "../hooks/use-company-files";

import { Download, FileDown, FileText, Calendar, PenTool } from "lucide-react";
import { Alert, Card, CardBody, Button } from "@heroui/react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { useDownloadFile } from "../hooks/use-download-file";
import { toast } from "sonner";

interface DocumentationStepProps {
  item: InboxTenderMapping;
  setNextEnabled?: (enabled: boolean) => void;
  onNextHandler?: React.MutableRefObject<(() => Promise<void>) | null>;
}

type FileGroup = "refilled" | "optional" | "other";

interface GroupedFiles {
  refilled: CompanyFileType[];
  optional: CompanyFileType[];
  other: CompanyFileType[];
}

const FILE_TYPE_LABELS: Record<FileGroup, React.ReactElement> = {
  refilled: <>Completed by us</>,
  optional: <>Requires manual fill</>,
  other: <>Other attachments</>,
};

export function DocumentationStep({
  item,
  setNextEnabled,
  onNextHandler: _onNextHandler, // eslint-disable-line @typescript-eslint/no-unused-vars
}: DocumentationStepProps) {
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
    mappingId: item.id,
  });
  const { downloadFile } = useDownloadFile();
  const { relativeToNow } = useDateFormat();

  const [groupedFiles, setGroupedFiles] = useState<GroupedFiles>({
    refilled: [],
    optional: [],
    other: [],
  });

  // Group files by file_type using lodash
  useEffect(() => {
    if (files) {
      const groupedByType = groupBy(files, (file) =>
        file.file_type && ["refilled", "optional"].includes(file.file_type)
          ? (file.file_type as FileGroup)
          : "other"
      );

      const grouped: GroupedFiles = {
        refilled: groupedByType.refilled || [],
        optional: groupedByType.optional || [],
        other: groupedByType.other || [],
      };

      setGroupedFiles(grouped);
    }
  }, [files]);

  const renderFileGroup = (groupKey: FileGroup, files: CompanyFileType[]) => {
    if (files.length === 0) {
      return (
        <div key={groupKey} className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground">
            {FILE_TYPE_LABELS[groupKey]}
          </h3>
          <div className="text-center py-6 text-gray-500">
            <p className="text-sm">No files in this category</p>
          </div>
        </div>
      );
    }

    return (
      <div key={groupKey} className="space-y-2">
        <div className="flex items-center justify-between py-1">
          <h3 className="text-sm font-semibold text-foreground/80">
            {FILE_TYPE_LABELS[groupKey]}
          </h3>
          {groupKey === "refilled" && files.length > 1 && (
            <Button
              size="sm"
              variant="ghost"
              className="flex items-center gap-1.5 text-xs h-8"
            >
              <FileDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download all</span>
              <span className="sm:hidden">All</span>
            </Button>
          )}
        </div>
        <div className="space-y-2">
          {files.map((file) => (
            <Card key={file.id} className="w-full border" shadow="none">
              <CardBody className="p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary flex-shrink-0" />
                      <h4 className="font-medium text-sm text-foreground truncate">
                        {file.s3path?.split("/").pop()}
                      </h4>
                    </div>
                    {file.comment && (
                      <div className="text-sm text-muted-foreground">
                        {file.comment}
                      </div>
                    )}

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        <span> {relativeToNow(new Date(file.created_at))}</span>
                      </div>
                      {file.signable && (
                        <div className="flex items-center gap-1 text-primary">
                          <PenTool className="w-3 h-3" />
                          <span>
                            Requires signature (
                            {file.signature_type?.join(", ")})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant="bordered"
                    onPress={() =>
                      downloadFile(file.s3path!).then(() =>
                        toast.success(<>Downloading {file.comment}...</>)
                      )
                    }
                    isDisabled={!file.s3path}
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Download</span>
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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

  const hasAnyFiles = files && files.length > 0;

  if (!hasAnyFiles) {
    return (
      <div className="space-y-4">
        <Alert color="primary">
          No documents to display. You can proceed to the next step.
        </Alert>
        <div className="text-center py-6 text-gray-500">
          <p className="text-sm">No documents found for this tender.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {(Object.keys(groupedFiles) as FileGroup[]).map((groupKey) =>
        renderFileGroup(groupKey, groupedFiles[groupKey])
      )}
    </div>
  );
}
