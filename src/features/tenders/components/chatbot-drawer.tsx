"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Button,
  Input,
  Spinner,
} from "@heroui/react";
import { Bot, ChevronDown, Search, Send, TriangleAlert } from "lucide-react";

interface ChatSearchResult {
  fileId: string;
  filename?: string;
  text?: string;
  vectorStoreFileId?: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  searchResults?: ChatSearchResult[];
}
interface ChatbotDrawerProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  mappingId?: string | null;
  tenderTitle?: string | null;
}

const CHAT_ENDPOINT = "/api/chatbot";

const createMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const truncatePreview = (text: string, limit = 260) => {
  const trimmed = text.trim();
  if (trimmed.length <= limit) {
    return trimmed;
  }
  return `${trimmed.slice(0, limit)}…`;
};

const SearchResultDetails = ({
  results,
}: {
  results: ChatSearchResult[];
}) => {
  const normalizedResults = useMemo(() => results.slice(0, 3), [results]);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (activeIndex >= normalizedResults.length) {
      setActiveIndex(0);
    }
  }, [activeIndex, normalizedResults.length]);

  if (normalizedResults.length === 0) {
    return (
      <p className="text-xs text-muted-foreground" data-lingo-skip>
        Brak dopasowań z wyszukiwarki.
      </p>
    );
  }

  const result = normalizedResults[Math.min(activeIndex, normalizedResults.length - 1)];
  const label =
    result.filename && result.filename.trim().length > 0
      ? result.filename
      : result.fileId;
  const preview = result.text ? truncatePreview(result.text, 2000) : null;

  return (
    <div className="space-y-3 text-left" data-lingo-skip>
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Najlepsze dopasowania
      </p>
      <div className="flex flex-wrap gap-2">
        {normalizedResults.map((_, index) => (
          <Button
            key={`search-result-${index}`}
            size="sm"
            variant={index === activeIndex ? "solid" : "flat"}
            className="text-xs"
            onPress={() => setActiveIndex(index)}
          >
            {`Źródło ${index + 1}`}
          </Button>
        ))}
      </div>
      <div>
        <p className="text-xs font-medium text-foreground">{label}</p>
        <p className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
          {preview ?? "Podgląd niedostępny."}
        </p>
      </div>
    </div>
  );
};

const parseSSEEventPayload = (rawEvent: string) => {
  const sanitized = rawEvent.replace(/\r/g, "");
  const lines = sanitized.split("\n");
  let eventType: string | null = null;
  const dataLines: string[] = [];

  for (const line of lines) {
    if (line.startsWith("event:")) {
      eventType = line.slice(6).trim();
    } else if (line.startsWith("data:")) {
      dataLines.push(line.slice(5));
    }
  }

  const data = dataLines.join("\n").trim();

  return { eventType, data };
};

const extractDeltaText = (event: Record<string, unknown>): string => {
  if (typeof event.delta === "string") {
    return event.delta;
  }

  if (
    event.delta &&
    typeof event.delta === "object" &&
    typeof (event.delta as { text?: unknown }).text === "string"
  ) {
    return (event.delta as { text: string }).text;
  }

  if (typeof event.text === "string") {
    return event.text;
  }

  if (
    event.output_text &&
    typeof event.output_text === "object" &&
    typeof (event.output_text as { delta?: unknown }).delta === "string"
  ) {
    return (event.output_text as { delta: string }).delta;
  }

  if (
    event?.delta &&
    typeof event.delta === "object" &&
    Array.isArray((event.delta as { output?: unknown }).output)
  ) {
    const outputs = (event.delta as { output: unknown[] }).output;
    for (const item of outputs) {
      if (
        item &&
        typeof item === "object" &&
        Array.isArray((item as { content?: unknown[] }).content)
      ) {
        for (const content of (item as { content: unknown[] }).content) {
          if (
            content &&
            typeof content === "object" &&
            (content as { type?: string }).type === "output_text" &&
            typeof (content as { text?: unknown }).text === "string"
          ) {
            return (content as { text: string }).text;
          }
        }
      }
    }
  }

  return "";
};

const parseAssistantPayload = (
  payload: unknown
): { text: string; searchResults: ChatSearchResult[] } => {
  if (!payload || typeof payload !== "object") {
    return { text: "", searchResults: [] };
  }

  const output = Array.isArray((payload as { output?: unknown[] }).output)
    ? ((payload as { output: unknown[] }).output as unknown[])
    : [];

  const textParts: string[] = [];
  const searchResults: ChatSearchResult[] = [];

  output.forEach((item) => {
    if (!item || typeof item !== "object") return;
    const type = (item as { type?: string }).type;

    if (type === "message") {
      const content = Array.isArray((item as { content?: unknown[] }).content)
        ? ((item as { content: unknown[] }).content as unknown[])
        : [];

      content.forEach((entry) => {
        if (!entry || typeof entry !== "object") return;
        if ((entry as { type?: string }).type !== "output_text") return;

        const text = (entry as { text?: unknown }).text;
        if (typeof text === "string") {
          textParts.push(text);
        }
      });
    }

    if (type === "file_search_call") {
      const results = Array.isArray((item as { results?: unknown[] }).results)
        ? ((item as { results: unknown[] }).results as unknown[])
        : [];

      results.forEach((result) => {
        if (!result || typeof result !== "object") return;

        const rawVectorStoreFileId = (result as { id?: unknown }).id;
        const vectorStoreFileId =
          typeof rawVectorStoreFileId === "string"
            ? rawVectorStoreFileId
            : undefined;
        const rawSourceFileId =
          (result as { file_id?: unknown }).file_id ??
          (result as { fileId?: unknown }).fileId ??
          (result as { fileId?: unknown }).fileId;
        const sourceFileId =
          typeof rawSourceFileId === "string" ? rawSourceFileId : vectorStoreFileId;
        const fileId = sourceFileId ? String(sourceFileId) : "";
        const filename =
          typeof (result as { filename?: unknown }).filename === "string"
            ? (result as { filename: string }).filename
            : undefined;
        const text =
          typeof (result as { text?: unknown }).text === "string"
            ? (result as { text: string }).text
            : undefined;

        if (!fileId && !filename && !text) {
          return;
        }

        searchResults.push({
          fileId: fileId || filename || `result-${searchResults.length}`,
          filename,
          text,
          vectorStoreFileId,
        });
      });
    }
  });

  return {
    text: textParts.join("\n\n"),
    searchResults: searchResults.slice(0, 3),
  };
};

export function ChatbotDrawer({
  open,
  setOpen,
  mappingId,
  tenderTitle,
}: ChatbotDrawerProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeSearchMessageId, setActiveSearchMessageId] = useState<string | null>(
    null
  );

  const updateMessageById = useCallback(
    (id: string, updater: (message: ChatMessage) => ChatMessage) =>
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? updater(message) : message))
      ),
    []
  );
  useEffect(() => {
    if (!activeSearchMessageId) {
      return;
    }

    if (!messages.some((message) => message.id === activeSearchMessageId)) {
      setActiveSearchMessageId(null);
    }
  }, [messages, activeSearchMessageId]);

  useEffect(() => {
    if (!open) {
      setActiveSearchMessageId(null);
    }
  }, [open]);

  const disabled = !mappingId || isSending || !inputValue.trim();

  const toggleSearchDetails = useCallback((messageId: string) => {
    setActiveSearchMessageId((current) =>
      current === messageId ? null : messageId
    );
  }, []);

  const finalizeAssistantMessage = useCallback(
    (
      assistantId: string,
      payload: unknown,
      fallbackText?: string
    ) => {
      const parsed =
        payload && typeof payload === "object"
          ? parseAssistantPayload(payload)
          : { text: "", searchResults: [] as ChatSearchResult[] };

      const candidateReply = parsed.text.trim().length
        ? parsed.text.trim()
        : fallbackText && fallbackText.trim().length
          ? fallbackText.trim()
          : "";

      const assistantText =
        candidateReply.length > 0
          ? candidateReply
          : "The assistant did not return any content.";

      updateMessageById(assistantId, (message) => ({
        ...message,
        content: assistantText,
        searchResults: parsed.searchResults,
      }));
    },
    [updateMessageById]
  );

  const consumeStreamResponse = useCallback(
    async (response: Response, assistantId: string) => {
      const body = response.body;
      if (!body) {
        throw new Error("Empty response stream.");
      }

      const reader = body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let aggregatedText = "";
      let finalPayload: unknown = null;

      const processEvent = (rawEvent: string) => {
        const { eventType, data } = parseSSEEventPayload(rawEvent);
        if (!data || data === "[DONE]") {
          return;
        }

        let parsed: Record<string, unknown> | null = null;
        try {
          parsed = JSON.parse(data) as Record<string, unknown>;
        } catch (error) {
          console.error("Failed to parse SSE event", error, data);
          return;
        }

        const type =
          typeof parsed.type === "string"
            ? parsed.type
            : typeof eventType === "string"
              ? eventType
              : "";

        if (type === "response.output_text.delta") {
          const delta = extractDeltaText(parsed);
          if (delta) {
            aggregatedText += delta;
            updateMessageById(assistantId, (message) => ({
              ...message,
              content: aggregatedText,
            }));
          }
          return;
        }

        if (type === "response.completed") {
          finalPayload = parsed.response ?? finalPayload;
          return;
        }

        if (type === "response.output_text.done") {
          finalPayload = parsed.response ?? finalPayload;
          return;
        }

        if (type === "response.file_search.results") {
          finalPayload = parsed.response ?? finalPayload;
          return;
        }

        if (type === "response.error") {
          const message =
            typeof (parsed.error as { message?: unknown })?.message === "string"
              ? ((parsed.error as { message: string }).message as string)
              : "Assistant streaming error.";
          throw new Error(message);
        }

        if (type === "response.delta") {
          const delta = extractDeltaText(parsed);
          if (delta) {
            aggregatedText += delta;
            updateMessageById(assistantId, (message) => ({
              ...message,
              content: aggregatedText,
            }));
          }
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(value, { stream: true });

        let boundaryIndex = buffer.indexOf("\n\n");
        while (boundaryIndex !== -1) {
          const rawEvent = buffer.slice(0, boundaryIndex);
          buffer = buffer.slice(boundaryIndex + 2);

          if (rawEvent.trim().length > 0) {
            processEvent(rawEvent);
          }

          boundaryIndex = buffer.indexOf("\n\n");
        }
      }

      if (buffer.trim().length > 0) {
        processEvent(buffer);
      }

      finalizeAssistantMessage(assistantId, finalPayload, aggregatedText);
    },
    [finalizeAssistantMessage, updateMessageById]
  );

  const handleSend = useCallback(async () => {
    const content = inputValue.trim();
    if (!content || !mappingId) {
      return;
    }

    setChatError(null);
    setActiveSearchMessageId(null);

    const userMessageId = createMessageId();
    const assistantMessageId = createMessageId();

    setMessages((prev) => [
      ...prev,
      {
        id: userMessageId,
        role: "user",
        content,
      },
      {
        id: assistantMessageId,
        role: "assistant",
        content: "",
        searchResults: [],
      },
    ]);
    setInputValue("");
    setIsSending(true);

    try {
      const response = await fetch(CHAT_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: content, mappingId, stream: true }),
      });

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new Error(errorPayload?.error ?? "Failed to reach assistant");
      }

      const contentType = response.headers.get("content-type") ?? "";

      if (contentType.includes("text/event-stream")) {
        await consumeStreamResponse(response, assistantMessageId);
      } else {
        const data = await response.json().catch(() => null);
        const payload = data?.response;
        const reply =
          typeof data?.reply === "string" && data.reply.trim().length > 0
            ? data.reply
            : undefined;
        finalizeAssistantMessage(assistantMessageId, payload, reply);
      }
    } catch (error) {
      console.error("Chatbot send error", error);
      const fallback =
        error instanceof Error ? error.message : "Unexpected error";
      setChatError(fallback);
      updateMessageById(assistantMessageId, (message) => ({
        ...message,
        content: "Sorry, I couldn’t reach the assistant. Please try again.",
        searchResults: [],
      }));
    } finally {
      setIsSending(false);
    }
  }, [
    inputValue,
    mappingId,
    consumeStreamResponse,
    finalizeAssistantMessage,
    updateMessageById,
  ]);

  const renderedMessages = useMemo(() => {
    if (messages.length === 0) {
      return (
        <div className="flex h-full min-h-32 flex-col items-center justify-center gap-3 rounded-md border border-dashed p-6 text-center">
          <p className="text-sm text-muted-foreground" data-lingo-skip>
            Che†nie pomogę Ci z obecnym przetargiem. Postaraj się zadawać precyzyjne pytania. 
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map(({ id, role, content, searchResults }) => {
          const isAssistant = role === "assistant";
          const hasSearchResults =
            isAssistant && Boolean(searchResults && searchResults.length > 0);

          return (
            <div
              key={id}
              className={`rounded-md border px-4 py-3 text-sm leading-relaxed ${
                isAssistant
                  ? "bg-content2 text-foreground"
                  : "bg-content1 text-foreground/90"
              }`}
              data-lingo-skip
            >
              <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-wide text-muted-foreground">
                {isAssistant ? (
                  <>
                    <Bot className="h-3.5 w-3.5" /> Assistant
                  </>
                ) : (
                  <>You</>
                )}
              </div>
              <p className="whitespace-pre-wrap" data-lingo-skip>
                {content}
              </p>
              {hasSearchResults && (
                <div className="mt-3 space-y-2" data-lingo-skip>
                  <Button
                    size="sm"
                    color="primary"
                    variant="flat"
                    className="w-fit text-xs font-medium shadow-sm"
                    startContent={<Search className="h-3.5 w-3.5" />}
                    endContent={
                      <ChevronDown
                        className={`h-3 w-3 transition-transform ${
                          activeSearchMessageId === id ? "rotate-180" : ""
                        }`}
                      />
                    }
                    onPress={() => toggleSearchDetails(id)}
                    aria-expanded={activeSearchMessageId === id}
                  >
                    Źródła wyszukiwania
                  </Button>
                  {activeSearchMessageId === id && (
                    <div className="rounded-md border bg-content1 px-3 py-2 text-xs leading-relaxed">
                      <SearchResultDetails results={searchResults ?? []} />
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [
    messages,
    activeSearchMessageId,
    toggleSearchDetails,
  ]);

  return (
    <>
      <Drawer isOpen={open} onOpenChange={setOpen} size="xl" radius="sm">
        <DrawerContent data-lingo-skip>
          {() => (
            <>
              <DrawerHeader className="flex flex-col gap-1 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    <h3 className="text-lg font-semibold" data-lingo-skip>
                      Asystent Mimira
                    </h3>
                  </div>
                </div>
                {tenderTitle && (
                  <p className="text-sm text-muted-foreground" data-lingo-skip>
                    {tenderTitle}
                  </p>
                )}
              </DrawerHeader>

              <DrawerBody className="flex flex-col gap-6 overflow-y-hidden">
                <div className="flex flex-col gap-4 overflow-y-auto pr-2">
                  {renderedMessages}
                  {isSending && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground" data-lingo-skip>
                      <Spinner size="sm" color="primary" />
                      Przeszukiwanie dokumentacji...
                    </div>
                  )}
                  {chatError && (
                    <div className="flex items-center gap-2 rounded-md border border-warning/50 bg-warning-50 px-3 py-2 text-xs text-warning" data-lingo-skip>
                      <TriangleAlert className="h-3.5 w-3.5" />
                      {chatError}
                    </div>
                  )}
                </div>
              </DrawerBody>

              <DrawerFooter className="border-t">
                <form
                  className="flex w-full flex-col gap-3"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void handleSend();
                  }}
                >
                  <Input
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    placeholder="Type your question"
                    radius="sm"
                    endContent={
                      <Button
                        color="primary"
                        isIconOnly
                        size="sm"
                        type="submit"
                        isLoading={isSending}
                        isDisabled={disabled}
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    }
                    isDisabled={!mappingId}
                  />
                  {!mappingId && (
                    <p className="text-xs text-muted-foreground" data-lingo-skip>
                      Select a tender to start chatting.
                    </p>
                  )}
                </form>
              </DrawerFooter>
            </>
          )}
        </DrawerContent>
      </Drawer>
    </>
  );
}

export default ChatbotDrawer;
