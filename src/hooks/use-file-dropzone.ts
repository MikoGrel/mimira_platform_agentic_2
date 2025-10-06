"use client";

import { useCallback, useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";

interface UseFileDropzoneOptions {
  maxFiles?: number;
  maxFileSize?: number;
  accept?: Record<string, string[]>;
}

export function useFileDropzone(options: UseFileDropzoneOptions = {}) {
  const { maxFiles = 5, maxFileSize = 10 * 1024 * 1024, accept } = options;

  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
      setFiles((prev) => [...prev, ...acceptedFiles]);
    },
    []
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } =
    useDropzone({
      onDrop,
      maxFiles,
      maxSize: maxFileSize,
      accept,
      multiple: maxFiles > 1,
    });

  const removeFile = useCallback((index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  const convertFilesToBase64 = useCallback(async () => {
    const filePromises = files.map((file) => {
      return new Promise<{
        name: string;
        content: string;
        contentType: string;
      }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix (e.g., "data:application/pdf;base64,")
          const content = base64.split(",")[1] || base64;
          resolve({
            name: file.name,
            content,
            contentType: file.type || "application/octet-stream",
          });
        };
        reader.onerror = () =>
          reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(file);
      });
    });

    return Promise.all(filePromises);
  }, [files]);

  return {
    files,
    getRootProps,
    getInputProps,
    isDragActive,
    fileRejections,
    removeFile,
    clearFiles,
    convertFilesToBase64,
  };
}
