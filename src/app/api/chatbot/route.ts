import { NextResponse } from "next/server";

import { resolveVectorStoreId } from "./vector-store";
const OPENAI_URL = "https://api.openai.com/v1/responses";
const SYSTEM_PROMPT =
  "You are an assistant for tender intelligence. Answer only using the provided documentation. If the documentation does not contain the answer, say that you do not know. Keep responses concise, focused, and avoid speculation. Always reply in the same language as the user's latest message.";

function extractAssistantReply(payload: unknown): string | null {
  if (
    !payload ||
    typeof payload !== "object" ||
    !("output" in payload) ||
    !Array.isArray((payload as Record<string, unknown>).output)
  ) {
    return null;
  }

  const items = (payload as { output: unknown[] }).output;
  for (const item of items) {
    if (!item || typeof item !== "object") continue;
    if ((item as { type?: string }).type !== "message") continue;

    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;

    const textItem = content.find(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        (entry as { type?: string }).type === "output_text"
    ) as { text?: string } | undefined;

    if (textItem?.text) {
      return textItem.text;
    }
  }

  return null;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OpenAI API key is not configured." },
        { status: 500 }
      );
    }

    const { message, mappingId, stream } = (await request.json()) as {
      message?: string;
      mappingId?: string | null;
      stream?: boolean;
    };

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 }
      );
    }

    if (!mappingId || typeof mappingId !== "string") {
      return NextResponse.json(
        { error: "Mapping identifier is required." },
        { status: 400 }
      );
    }

    const vectorStoreId = await resolveVectorStoreId(mappingId);

    if (!vectorStoreId) {
      return NextResponse.json(
        { error: "Vector store is not configured for this tender." },
        { status: 400 }
      );
    }

    const shouldStream = Boolean(stream);

    const requestBody: Record<string, unknown> = {
      model: "gpt-5-mini",
      tools: [
        {
          type: "file_search",
          vector_store_ids: [vectorStoreId],
          max_num_results: 20,
        },
      ],
      include: ["file_search_call.results"],
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: SYSTEM_PROMPT,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: message,
            },
          ],
        },
      ],
    };

    if (shouldStream) {
      requestBody.stream = true;
    }

    const response = await fetch(OPENAI_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (shouldStream) {
      if (!response.ok) {
        const errorPayload = await response.text().catch(() => "");
        const fallbackMessage = (() => {
          try {
            const parsed = JSON.parse(errorPayload) as {
              error?: { message?: string };
            };
            return parsed?.error?.message ?? "Failed to stream from OpenAI.";
          } catch {
            return errorPayload || "Failed to stream from OpenAI.";
          }
        })();

        return NextResponse.json(
          { error: fallbackMessage },
          { status: response.status }
        );
      }

      if (!response.body) {
        return NextResponse.json(
          { error: "OpenAI did not return a stream." },
          { status: 502 }
        );
      }

      const headers = new Headers();
      headers.set("Content-Type", "text/event-stream");
      headers.set("Cache-Control", "no-cache");
      headers.set("Connection", "keep-alive");

      return new Response(response.body, {
        status: 200,
        headers,
      });
    }

    if (!response.ok) {
      const errorPayload = await response.json().catch(() => null);
      const errorMessage =
        errorPayload?.error?.message ?? "Failed to reach OpenAI.";
      return NextResponse.json(
        { error: errorMessage },
        { status: response.status }
      );
    }

    const payload = await response.json();
    const reply = extractAssistantReply(payload);

    return NextResponse.json({
      reply,
      response: payload,
    });
  } catch (error) {
    console.error("Chatbot API error", error);
    return NextResponse.json(
      { error: "Unexpected error while contacting OpenAI." },
      { status: 500 }
    );
  }
}
