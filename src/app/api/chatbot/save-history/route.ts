import { NextResponse } from "next/server";
import { ConversationHistoryManager } from "../conversation-history";

export async function POST(request: Request) {
  try {
    const { mappingId, assistantMessage } = (await request.json()) as {
      mappingId?: string;
      assistantMessage?: {
        role: string;
        content: string;
      };
    };

    if (!mappingId || typeof mappingId !== "string") {
      return NextResponse.json(
        { error: "Mapping identifier is required." },
        { status: 400 }
      );
    }

    if (!assistantMessage || !assistantMessage.content) {
      return NextResponse.json(
        { error: "Assistant message is required." },
        { status: 400 }
      );
    }

    // Save the assistant message to conversation history
    await ConversationHistoryManager.addAssistantMessage(
      mappingId, 
      assistantMessage.content
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save history API error", error);
    return NextResponse.json(
      { error: "Failed to save conversation history." },
      { status: 500 }
    );
  }
}
