"use client";

import React from "react";
import { Download, FileDown, FileText, Calendar, PenTool } from "lucide-react";
import { Card, CardBody, Button } from "@heroui/react";
import { useDateFormat } from "$/features/i18n/hooks/use-date-format";
import { useDownloadFile } from "../hooks/use-download-file";
import { toast } from "sonner";
import { CompanyFileType } from "../hooks/use-company-files";

interface FileGroupProps {
  label: React.ReactNode;
  files: CompanyFileType[];
  showDownloadAll?: boolean;
}

export function FileGroup({
  label,
  files,
  showDownloadAll = false,
}: FileGroupProps) {
  const { downloadFile, downloadAllFiles } = useDownloadFile();
  const { relativeToNow } = useDateFormat();

  if (files.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between py-1">
        <h3 className="text-sm font-semibold text-foreground/80">{label}</h3>
        {showDownloadAll && files.length > 1 && (
          <Button
            size="sm"
            variant="ghost"
            className="flex items-center gap-1.5 text-xs h-8"
            onPress={() =>
              downloadAllFiles(files.map((file) => file.s3path!)).then(() =>
                toast.success(<>Downloading all files...</>)
              )
            }
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
                          Requires signature ({file.signature_type?.join(", ")})
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
}
