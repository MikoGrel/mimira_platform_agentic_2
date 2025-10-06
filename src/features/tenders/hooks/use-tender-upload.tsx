"use client";

import { useMutation } from "@tanstack/react-query";

export interface TenderUploadFile {
  name: string;
  content: string;
  contentType?: string;
}

export interface TenderRequest {
  tender_url: string;
  company_name: string;
  files?: Array<TenderUploadFile>;
  publicationdate: string;
  submittingoffersdate: string;
  orderobject?: string;
}

export interface TenderUploadResponse {
  success: boolean;
  sqs_message_id?: string;
  message?: string;
  error?: string;
}

export function useTenderUpload() {
  const uploadTender = async (
    request: TenderRequest
  ): Promise<TenderUploadResponse> => {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/create-user-tender`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        errorData.error || `Failed to upload tender: ${response.statusText}`
      );
    }

    const data: TenderUploadResponse = await response.json();

    if (!data.success) {
      throw new Error(data.error || "Tender upload failed");
    }

    return data;
  };

  const mutation = useMutation({
    mutationFn: uploadTender,
  });

  return {
    uploadTender: mutation.mutate,
    uploadTenderAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error,
    data: mutation.data,
    reset: mutation.reset,
  };
}
