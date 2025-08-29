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

  async function downloadAllFiles(filePaths: string[]) {
    return Promise.all(filePaths.map(downloadFile));
  }

  return {
    downloadFile,
    downloadAllFiles,
  };
}
