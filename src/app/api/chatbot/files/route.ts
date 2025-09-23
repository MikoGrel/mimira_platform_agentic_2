import { NextResponse } from "next/server";

import {
  getDefaultVectorStoreId,
  resolveVectorStoreId,
} from "../vector-store";

async function fetchFileMeta(
  apiKey: string,
  vectorStoreId: string,
  fileId: string
) {
  const response = await fetch(
    `https://api.openai.com/v1/vector_stores/${encodeURIComponent(
      vectorStoreId
    )}/files/${encodeURIComponent(fileId)}/content`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const payload = await response.json();
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const filename =
    typeof (payload as { filename?: unknown }).filename === "string"
      ? (payload as { filename: string }).filename
      : "";

  return {
    filename,
  };
}

export async function GET(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured.", files: [] },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const mappingId = url.searchParams.get("mappingId");

    const vectorStoreId = mappingId
      ? await resolveVectorStoreId(mappingId)
      : getDefaultVectorStoreId();

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "Vector store is not configured.", files: [] },
        { status: 400 }
      );
    }

    const openAiVectorUrl = `https://api.openai.com/v1/vector_stores/${encodeURIComponent(
      vectorStoreId
    )}/files`;

    const response = await fetch(openAiVectorUrl, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "OpenAI-Beta": "assistants=v2",
      },
    });

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const message = errorPayload?.error?.message ?? "Unable to list files.";
      return NextResponse.json(
        { error: message, files: [] },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const files = Array.isArray(payload?.data)
      ? payload.data
      : [];

    const enriched = await Promise.all(
      (files as Record<string, unknown>[]).map(async (file) => {
        const id = String(file.id ?? "");
        let filename = String(file.filename ?? "");
        const originalFileId =
          typeof (file as { file_id?: unknown }).file_id === "string"
            ? String((file as { file_id: string }).file_id)
            : undefined;

        if (!filename && id) {
          const meta = await fetchFileMeta(apiKey, vectorStoreId, id);
          filename = meta?.filename ?? filename;
        }

        return {
          id,
          filename,
          created_at:
            typeof file.created_at === "number" ? file.created_at : undefined,
          originalFileId,
        };
      })
    );

    return NextResponse.json({ files: enriched, vectorStoreId });
  } catch (error) {
    console.error("Chatbot file list error", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching files.", files: [] },
      { status: 500 }
    );
  }
}
