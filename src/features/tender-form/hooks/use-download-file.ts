"use client";

import { createClient } from "$/lib/supabase/client";
import { openFileLink } from "$/utils/download";

export type DownloadFileResponse = {
  signedUrl: string;
};

export function useDownloadFile() {
  const client = createClient();

  async function downloadFile(filePath: string) {
    const { data, error } = await client.functions.invoke<DownloadFileResponse>(
      "getFilledDocSignedUrl",
      {
        body: {
          filePath,
        },
      }
    );

    if (error) {
      throw error;
    }

    if (data) {
      openFileLink(data.signedUrl);
    }

    return data;
  }

  async function downloadAllFiles(zipName: string, filePaths: string[]) {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/downloadAllFiles`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
        },
        body: JSON.stringify({ filePaths }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to download files: ${response.statusText}`);
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `${zipName}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return {
    downloadFile,
    downloadAllFiles,
  };
}
