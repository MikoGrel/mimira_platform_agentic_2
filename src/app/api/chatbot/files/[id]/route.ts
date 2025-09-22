import { NextResponse } from "next/server";
import { Buffer } from "node:buffer";

export const runtime = "nodejs";

const VECTOR_STORE_ID = "vs_68d132247b088191a6002c604f3f72e7";
const OPENAI_VECTOR_URL = `https://api.openai.com/v1/vector_stores/${VECTOR_STORE_ID}/files`;

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const { id: vectorStoreFileId } = await context.params;

    if (!vectorStoreFileId) {
      return NextResponse.json(
        { error: "File id is required." },
        { status: 400 }
      );
    }

    const url = new URL(request.url);
    const sourceFileId = url.searchParams.get("source") ?? "";

    let payload: Record<string, unknown> | null = null;
    let primaryError: string | undefined;
    let primaryStatus = 502;

    const vectorResponse = await fetch(
      `${OPENAI_VECTOR_URL}/${encodeURIComponent(vectorStoreFileId)}/content`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "assistants=v2",
        },
      }
    );

    if (vectorResponse.ok) {
      payload = (await vectorResponse.json().catch(() => null)) as
        | Record<string, unknown>
        | null;
    } else {
      const errorPayload = await vectorResponse.json().catch(() => null);
      primaryError = errorPayload?.error?.message ?? "Unable to load file.";
      primaryStatus = vectorResponse.status;
    }

    const filename =
      payload && typeof (payload as { filename?: unknown }).filename === "string"
        ? String((payload as { filename: string }).filename)
        : sourceFileId || vectorStoreFileId;
    const contentSegments =
      payload && Array.isArray((payload as { content?: unknown[] }).content)
        ? ((payload as { content: unknown[] }).content as unknown[])
        : [];

    const content = contentSegments
      .map((segment) =>
        segment &&
        typeof segment === "object" &&
        (segment as { type?: string }).type === "text" &&
        typeof (segment as { text?: unknown }).text === "string"
          ? String((segment as { text: string }).text)
          : ""
      )
      .filter(Boolean)
      .join("\n\n");

    let rawFile:
      | {
          base64: string;
          mimeType: string;
        }
      | undefined;

    let rawError: string | undefined;

    if (!content) {
      const candidateIds = Array.from(
        new Set(
          [sourceFileId, vectorStoreFileId].filter(
            (value): value is string => Boolean(value && value.trim().length > 0)
          )
        )
      );
      const downloadEndpoints = candidateIds.flatMap((fileId) => [
        `https://api.openai.com/v1/files/${encodeURIComponent(fileId)}/content?purpose=user_data`,
        `https://api.openai.com/v1/files/${encodeURIComponent(fileId)}/content`,
      ]);

      for (const url of downloadEndpoints) {
        const fileResponse = await fetch(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "OpenAI-Beta": "assistants=v2",
            Accept: "application/octet-stream",
          },
        });

        if (fileResponse.ok) {
          const mimeType =
            fileResponse.headers.get("content-type") || "application/octet-stream";
          const buffer = Buffer.from(await fileResponse.arrayBuffer());
          rawFile = {
            base64: buffer.toString("base64"),
            mimeType,
          };
          rawError = undefined;
          break;
          }

        rawError = await fileResponse.text().catch(() => null) ?? undefined;
      }
    }

    if (!content && !rawFile && primaryError) {
      return NextResponse.json(
        { error: primaryError },
        { status: primaryStatus }
      );
    }

    return NextResponse.json({
      file: {
        id: vectorStoreFileId,
        filename,
        content,
        raw: rawFile,
        rawError,
      },
    });
  } catch (error) {
    console.error("Chatbot file fetch error", error);
    return NextResponse.json(
      { error: "Unexpected error while fetching file." },
      { status: 500 }
    );
  }
}
