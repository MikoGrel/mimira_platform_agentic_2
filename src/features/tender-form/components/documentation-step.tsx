"use client";

import { useState, useEffect } from "react";
import React from "react";
import { groupBy } from "lodash-es";
import { InboxTenderMapping } from "$/features/inbox/api/use-tender-inbox-query";
import { CompanyFileType, useCompanyFiles } from "../hooks/use-company-files";

import { Alert } from "@heroui/react";
import { FileGroup } from "./file-group";

interface DocumentationStepProps {
  item: InboxTenderMapping | null | undefined;
  setNextEnabled?: (enabled: boolean) => void;
}

type FileGroupKey = "refilled" | "optional" | "other";

interface GroupedFiles {
  refilled: CompanyFileType[];
  optional: CompanyFileType[];
  other: CompanyFileType[];
}

export function DocumentationStep({
  item,
  setNextEnabled,
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
    mappingId: item?.id,
  });

  const [groupedFiles, setGroupedFiles] = useState<GroupedFiles>({
    refilled: [],
    optional: [],
    other: [],
  });

  useEffect(() => {
    if (files) {
      const groupedByType = groupBy(files, (file) =>
        file.file_type && ["refilled", "optional"].includes(file.file_type)
          ? (file.file_type as FileGroupKey)
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
      <FileGroup
        label={<>Completed by us</>}
        files={groupedFiles.refilled}
        showDownloadAll
      />
      <FileGroup
        label={<>Requires manual fill</>}
        files={groupedFiles.optional}
        showDownloadAll
      />
      <FileGroup
        label={<>Other attachments</>}
        files={groupedFiles.other}
        showDownloadAll
      />
    </div>
  );
}
