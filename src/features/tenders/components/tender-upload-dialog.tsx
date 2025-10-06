"use client";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogFooter,
  DialogDescription,
} from "$/components/ui/dialog";
import { Button, DateInput, Input } from "@heroui/react";
import { useFileDropzone } from "$/hooks/use-file-dropzone";
import {
  useTenderUpload,
  type TenderRequest,
} from "../hooks/use-tender-upload";
import { ComponentProps, useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { CalendarDate } from "@internationalized/date";
import { Upload, X, File as FileIcon } from "lucide-react";
import { useCurrentUser } from "$/features/auth/api";

interface TenderUploadFormData {
  tender_url: string;
  company_name: string;
  order_object: string;
  publication_date: CalendarDate;
  submitting_offers_date: CalendarDate;
}

export function TenderUploadDialog(props: ComponentProps<typeof Dialog>) {
  const { user } = useCurrentUser();
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<TenderUploadFormData>();

  const fileDropzone = useFileDropzone({
    maxFiles: 5,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    accept: {
      "application/pdf": [".pdf"],
      "image/*": [".png", ".jpg", ".jpeg"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
        [".docx"],
    },
  });

  const {
    uploadTenderAsync,
    isLoading,
    reset: resetMutation,
  } = useTenderUpload();

  const onSubmit = async (data: TenderUploadFormData) => {
    try {
      const files = await fileDropzone.convertFilesToBase64();

      const request: TenderRequest = {
        tender_url: data.tender_url,
        company_name: user!.profile!.companies!.company_name!,
        orderobject: data.order_object,
        publicationdate: data.publication_date.toString(),
        submittingoffersdate: data.submitting_offers_date.toString(),
        files: files.length > 0 ? files : undefined,
      };

      await uploadTenderAsync(request);
      toast.success(
        <>
          Tender was upload successfully!, You will receive it processed in your
          inbox in 10 minutes
        </>
      );
      reset();
      fileDropzone.clearFiles();
      props.onOpenChange?.(false);
    } catch {
      toast.error(<>Upload failed, contact support if the problem persists</>);
    }
  };

  useEffect(() => {
    if (!props.open) {
      reset();
      fileDropzone.clearFiles();
      resetMutation();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.open, reset, resetMutation]);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
  };

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle data-lingo-override-pl="Prześlij przetarg">
            Upload tender
          </DialogTitle>
          <DialogDescription>
            Fill all the required fields to upload and process new tender.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Link to tender"
            placeholder="https://..."
            isRequired
            {...register("tender_url", {
              required: "Tender URL is required",
            })}
            isInvalid={!!errors.tender_url}
            errorMessage={errors.tender_url?.message}
            variant="bordered"
          />

          <Input
            label="Order object"
            placeholder="Enter order object"
            {...register("order_object")}
            variant="bordered"
          />

          <Controller
            name="publication_date"
            control={control}
            rules={{ required: "Publication date is required" }}
            render={({ field }) => (
              <DateInput
                label="Publication date"
                isRequired
                value={field.value}
                onChange={field.onChange}
                isInvalid={!!errors.publication_date}
                errorMessage={errors.publication_date?.message}
                variant="bordered"
              />
            )}
          />

          <Controller
            name="submitting_offers_date"
            control={control}
            rules={{ required: "Submitting offers date is required" }}
            render={({ field }) => (
              <DateInput
                label="Submitting offers date"
                isRequired
                value={field.value}
                onChange={field.onChange}
                isInvalid={!!errors.submitting_offers_date}
                errorMessage={errors.submitting_offers_date?.message}
                variant="bordered"
              />
            )}
          />

          <div className="space-y-2">
            <label className="text-sm font-medium block">
              Tender files (optional)
            </label>
            <div
              {...fileDropzone.getRootProps()}
              className={`
                border border-dashed rounded-lg p-6 text-center cursor-pointer
                transition-colors duration-200
                ${
                  fileDropzone.isDragActive
                    ? "border-primary bg-primary/10"
                    : "border-gray-300 hover:border-gray-400"
                }
              `}
            >
              <input {...fileDropzone.getInputProps()} />
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-6 h-6 text-gray-400" />
                {fileDropzone.isDragActive ? (
                  <p className="text-sm text-gray-600">Drop files here...</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-xs text-gray-600 text-balance font-medium">
                      Drag and drop files here, or click to select them from
                      your device
                    </p>
                    <p className="text-xs text-gray-400 text-balance">
                      Max 5 files, 10MB each (PDF, Images, Word documents)
                    </p>
                  </div>
                )}
              </div>
            </div>

            {fileDropzone.files.length > 0 && (
              <div className="mt-3 space-y-2">
                {fileDropzone.files.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 min-w-0"
                  >
                    <span className="inline-flex items-center justify-center w-8 h-8 rounded-full border bg-primary-gradient text-foreground/70 border-border flex-shrink-0">
                      <FileIcon className="w-4 h-4 text-primary" />
                    </span>
                    <div className="flex-1 min-w-0 overflow-hidden">
                      <p
                        className="text-xs font-medium truncate max-w-[300px]"
                        title={file.name}
                      >
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => fileDropzone.removeFile(index)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
                    >
                      <X className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {fileDropzone.fileRejections.length > 0 && (
              <div className="mt-2 text-sm text-danger space-y-1">
                {fileDropzone.fileRejections.map(({ file, errors }) => (
                  <div key={file.name} className="break-words">
                    <span className="font-medium break-all">{file.name}</span>:{" "}
                    {errors.map((e) => e.message).join(", ")}
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="submit"
              color="primary"
              isLoading={isLoading}
              fullWidth
            >
              Upload tender
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
