"use client";

import {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  Button,
  Input,
  Spinner,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollShadow,
} from "@heroui/react";
import {
  Bot,
  ChevronDown,
  FileText,
  Search,
  Send,
  TriangleAlert,
} from "lucide-react";

interface ChatCitation {
  fileId: string;
  filename?: string;
  quotes: string[];
  vectorStoreFileId?: string;
}

interface ChatSearchResult {
  fileId: string;
  filename?: string;
  text?: string;
  vectorStoreFileId?: string;
}

interface RawFileData {
  base64: string;
  mimeType: string;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: ChatCitation[];
  searchResults?: ChatSearchResult[];
}

interface ChatFileEntry {
  id: string;
  filename: string;
  created_at?: number;
  originalFileId?: string;
}

interface CitationPreviewState {
  citation: ChatCitation;
  content: string | null;
  isLoading: boolean;
  error: string | null;
  raw?: RawFileData;
  rawError?: string;
}

interface ChatbotDrawerProps {
  open?: boolean;
  setOpen?: (open: boolean) => void;
  mappingId?: string | null;
  tenderTitle?: string | null;
}

const VECTOR_FILES_ENDPOINT = "/api/chatbot/files";
const CHAT_ENDPOINT = "/api/chatbot";

const createMessageId = () => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return Math.random().toString(36).slice(2);
};

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildHighlightedSnippet = (content: string, quote?: string): ReactNode => {
  if (!content) {
    return <span>No content available for this file.</span>;
  }

  if (!quote) {
    const preview = content.slice(0, 500);
    return <span>{preview}</span>;
  }

  const loweredContent = content.toLowerCase();
  const loweredQuote = quote.toLowerCase();
  const index = loweredContent.indexOf(loweredQuote);

  const padding = 200;

  if (index === -1) {
    const preview = content.slice(0, 500);
    return <span>{preview}</span>;
  }

  const start = Math.max(0, index - padding);
  const end = Math.min(content.length, index + quote.length + padding);
  const snippet = content.slice(start, end);
  const regex = new RegExp(`(${escapeRegExp(quote)})`, "gi");
  const parts = snippet.split(regex);

  return (
    <span>
      {parts.map((part, idx) =>
        part.toLowerCase() === loweredQuote ? (
          <mark key={`${part}-${idx}`} className="rounded-sm bg-warning/40 px-1">
            {part}
          </mark>
        ) : (
          <span key={`${part}-${idx}`}>{part}</span>
        )
      )}
    </span>
  );
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
            {`Source ${index + 1}`}
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
): { text: string; citations: ChatCitation[]; searchResults: ChatSearchResult[] } => {
  if (!payload || typeof payload !== "object") {
    return { text: "", citations: [], searchResults: [] };
  }

  const output = Array.isArray((payload as { output?: unknown[] }).output)
    ? ((payload as { output: unknown[] }).output as unknown[])
    : [];

  const textParts: string[] = [];
  const citationMap = new Map<string, ChatCitation>();
  const searchResults: ChatSearchResult[] = [];
  const fileIdToVectorMap = new Map<string, string>();

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

        const annotations = Array.isArray(
          (entry as { annotations?: unknown[] }).annotations
        )
          ? ((entry as { annotations: unknown[] }).annotations as unknown[])
          : [];

        annotations.forEach((annotation) => {
          if (!annotation || typeof annotation !== "object") return;
          if ((annotation as { type?: string }).type !== "file_citation") return;

          const rawFileId =
            (annotation as { file_id?: unknown }).file_id ??
            (annotation as { fileId?: unknown }).fileId;
          const fileId = rawFileId ? String(rawFileId) : "";
          if (!fileId) return;

          const filename =
            typeof (annotation as { filename?: unknown }).filename === "string"
              ? (annotation as { filename: string }).filename
              : undefined;

          const quoteCandidate = (annotation as { text?: unknown }).text;
          const quoteBackup = (annotation as { quote?: unknown }).quote;
          const quote =
            typeof quoteCandidate === "string"
              ? quoteCandidate
              : typeof quoteBackup === "string"
                ? quoteBackup
                : undefined;

          const vectorStoreFileId =
            typeof (annotation as { vector_store_file_id?: unknown }).vector_store_file_id ===
            "string"
              ? String((annotation as { vector_store_file_id: string }).vector_store_file_id)
              : undefined;

          const existing = citationMap.get(fileId) ?? {
            fileId,
            filename,
            quotes: [] as string[],
            vectorStoreFileId,
          };

          if (filename && !existing.filename) {
            existing.filename = filename;
          }

          if (vectorStoreFileId && !existing.vectorStoreFileId) {
            existing.vectorStoreFileId = vectorStoreFileId;
          }

          if (quote && !existing.quotes.includes(quote)) {
            existing.quotes.push(quote);
          }

          citationMap.set(fileId, existing);
        });
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

        if (sourceFileId && vectorStoreFileId) {
          fileIdToVectorMap.set(String(sourceFileId), vectorStoreFileId);
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

  const citations = Array.from(citationMap.values()).map((citation) => {
    if (!citation.vectorStoreFileId && citation.fileId) {
      const mapped = fileIdToVectorMap.get(citation.fileId);
      if (mapped) {
        return { ...citation, vectorStoreFileId: mapped };
      }
    }
    return citation;
  });

  return {
    text: textParts.join("\n\n"),
    citations,
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
  const [files, setFiles] = useState<ChatFileEntry[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [filesError, setFilesError] = useState<string | null>(null);
  const [chatError, setChatError] = useState<string | null>(null);
  const [activeCitation, setActiveCitation] = useState<CitationPreviewState | null>(
    null
  );
  const [activeSearchMessageId, setActiveSearchMessageId] = useState<string | null>(
    null
  );
  const [documentsExpanded, setDocumentsExpanded] = useState(true);

  const updateMessageById = useCallback(
    (id: string, updater: (message: ChatMessage) => ChatMessage) =>
      setMessages((prev) =>
        prev.map((message) => (message.id === id ? updater(message) : message))
      ),
    []
  );
  const fileCacheRef = useRef<
    Map<string, { content: string; filename: string; raw?: RawFileData; rawError?: string }>
  >(new Map());

  useEffect(() => {
    if (!open) {
      return;
    }

    setFilesError(null);
    setIsLoadingFiles(true);

    fetch(VECTOR_FILES_ENDPOINT, { cache: "no-store" })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load files");
        }
        const data = await res.json();
        setFiles(data?.files ?? []);
      })
      .catch(() => {
        setFilesError("Unable to load linked files");
        setFiles([]);
      })
      .finally(() => setIsLoadingFiles(false));
  }, [open]);

  useEffect(() => {
    if (!activeSearchMessageId) {
      return;
    }

    if (!messages.some((message) => message.id === activeSearchMessageId)) {
      setActiveSearchMessageId(null);
    }
  }, [messages, activeSearchMessageId]);

  const disabled = !mappingId || isSending || !inputValue.trim();

  const resolveFilename = useCallback(
    (citation: { fileId: string; filename?: string; vectorStoreFileId?: string }) => {
      if (citation.filename && citation.filename.trim().length > 0) {
        return citation.filename;
      }

      const cached = fileCacheRef.current.get(citation.fileId);
      if (cached?.filename) {
        return cached.filename;
      }

      const entry = files.find(
        (file) =>
          file.id === citation.vectorStoreFileId ||
          file.id === citation.fileId ||
          file.originalFileId === citation.fileId
      );
      if (entry?.filename && entry.filename.trim().length > 0) {
        return entry.filename;
      }

      return citation.fileId;
    },
    [files]
  );

  const handleCitationClick = useCallback(
    (citation: ChatCitation) => {
      const filename = resolveFilename(citation);
      const cached = fileCacheRef.current.get(citation.fileId);

      if (cached) {
        setActiveCitation({
          citation: { ...citation, filename },
          content: cached.content,
          isLoading: false,
          error: null,
          raw: cached.raw,
          rawError: cached.rawError,
        });
        return;
      }

      setActiveCitation({
        citation: { ...citation, filename },
        content: null,
        isLoading: true,
        error: null,
        raw: undefined,
        rawError: undefined,
      });

      const targetId = citation.vectorStoreFileId ?? citation.fileId;
      const params = new URLSearchParams();
      if (citation.fileId) {
        params.set("source", citation.fileId);
      }
      const query = params.toString();

      fetch(
        `${VECTOR_FILES_ENDPOINT}/${encodeURIComponent(targetId)}${
          query ? `?${query}` : ""
        }`,
        {
          cache: "no-store",
        }
      )
        .then(async (res) => {
          const data = await res.json().catch(() => null);

          if (!res.ok || !data) {
            throw new Error(data?.error ?? "Unable to load file content.");
          }
          const content =
            typeof data?.file?.content === "string" ? data.file.content : "";
          const resolvedFilename =
            typeof data?.file?.filename === "string"
              ? data.file.filename
              : filename;
          const rawData =
            data?.file?.raw &&
            typeof data.file.raw.base64 === "string" &&
            typeof data.file.raw.mimeType === "string"
              ? {
                  base64: data.file.raw.base64,
                  mimeType: data.file.raw.mimeType,
                }
              : undefined;
          const rawError =
            typeof data?.file?.rawError === "string"
              ? data.file.rawError
              : undefined;

          fileCacheRef.current.set(citation.fileId, {
            content,
            filename: resolvedFilename,
            raw: rawData,
            rawError,
          });

          setActiveCitation((prev) =>
            prev && prev.citation.fileId === citation.fileId
              ? {
                  citation: {
                    ...prev.citation,
                    filename: resolvedFilename,
                  },
                  content,
                  isLoading: false,
                  error: null,
                  raw: rawData,
                  rawError,
                }
              : prev
          );
        })
        .catch((error) => {
          console.error("Citation fetch error", error);
          const message =
            error instanceof Error ? error.message : "Unknown error.";
          setActiveCitation((prev) =>
            prev && prev.citation.fileId === citation.fileId
              ? {
                  ...prev,
                  isLoading: false,
                  error: message,
                  raw: prev.raw,
                  rawError: prev.rawError,
                }
              : prev
          );
        });
    },
    [resolveFilename]
  );

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
          : { text: "", citations: [] as ChatCitation[], searchResults: [] as ChatSearchResult[] };

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
        citations: parsed.citations,
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
        citations: [],
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
        citations: [],
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
          <Bot className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm text-muted-foreground" data-lingo-skip>
            Ask anything about this tender to get started.
          </p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {messages.map(({ id, role, content, citations, searchResults }) => {
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
                    variant="light"
                    className="w-fit text-xs"
                    startContent={<Search className="h-3.5 w-3.5" />}
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
              {isAssistant && citations && citations.length > 0 && (
                <div className="mt-3 flex flex-col gap-2" data-lingo-skip>
                  <span className="text-xs font-medium text-muted-foreground">
                    Sources
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {citations.map((citation) => {
                      const displayName = resolveFilename(citation);
                      return (
                        <Button
                          key={`${id}-${citation.fileId}`}
                          size="sm"
                          variant="flat"
                          className="text-xs"
                          onPress={() => handleCitationClick(citation)}
                          data-lingo-skip
                        >
                          <FileText className="mr-2 h-3.5 w-3.5" />
                          {displayName}
                        </Button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }, [
    messages,
    resolveFilename,
    handleCitationClick,
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
                    Tender assistant
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
                    Generating answer...
                  </div>
                )}
                {chatError && (
                  <div className="flex items-center gap-2 rounded-md border border-warning/50 bg-warning-50 px-3 py-2 text-xs text-warning" data-lingo-skip>
                    <TriangleAlert className="h-3.5 w-3.5" />
                    {chatError}
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setDocumentsExpanded((prev) => !prev)}
                    className="flex items-center gap-2 text-sm font-medium"
                    data-lingo-skip
                  >
                    <span>Original documents</span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        documentsExpanded ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isLoadingFiles && <Spinner size="sm" />}
                </div>
                <div className="space-y-2">
                  {filesError && (
                    <p className="text-xs text-warning" data-lingo-skip>
                      {filesError}
                    </p>
                  )}
                  {!filesError && files.length === 0 && !isLoadingFiles && (
                    <p className="text-xs text-muted-foreground" data-lingo-skip>
                      No files detected for this tender.
                    </p>
                  )}
                  {documentsExpanded &&
                    files.map((file) => {
                      const displayName =
                        file.filename?.trim().length
                          ? file.filename
                          : file.originalFileId?.trim().length
                            ? file.originalFileId
                            : file.id;
                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-2 rounded-md border bg-content1 px-3 py-2 text-xs"
                          data-lingo-skip
                        >
                          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate" title={displayName}>
                            {displayName}
                          </span>
                        </div>
                      );
                    })}
                </div>
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

      <Modal
        isOpen={Boolean(activeCitation)}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            setActiveCitation(null);
          }
        }}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent data-lingo-skip>
          {(onClose) => {
            const citation = activeCitation?.citation;
            const displayName = citation
              ? resolveFilename(citation)
              : "Highlighted source";
            const hasTextContent = Boolean(
              activeCitation?.content && activeCitation.content.trim().length > 0
            );
            const rawData = activeCitation?.raw;
            const dataUrl = rawData
              ? `data:${rawData.mimeType};base64,${rawData.base64}`
              : null;
            const rawError = activeCitation?.rawError;

            return (
              <>
                <ModalHeader className="flex flex-col gap-1">
                  <span className="text-base font-semibold" data-lingo-skip>
                    {displayName}
                  </span>
                  {citation?.quotes.length ? (
                    <span className="text-xs text-muted-foreground" data-lingo-skip>
                      Highlighted excerpts from this file
                    </span>
                  ) : null}
                </ModalHeader>
                <ModalBody>
                  {activeCitation?.isLoading ? (
                    <div className="flex items-center justify-center py-6">
                      <Spinner />
                    </div>
                  ) : activeCitation?.error ? (
                    <p className="text-sm text-warning" data-lingo-skip>
                      {activeCitation.error}
                    </p>
                  ) : hasTextContent ? (
                    <ScrollShadow className="max-h-[60vh] space-y-4 pr-2">
                      {citation && citation.quotes.length > 0 ? (
                        citation.quotes.map((quote, idx) => (
                          <div
                            key={`${citation.fileId}-${idx}`}
                            className="rounded-md border bg-content1 px-3 py-2"
                          >
                            <p className="mb-2 text-xs font-medium text-muted-foreground" data-lingo-skip>
                              Match {idx + 1}
                            </p>
                            <pre className="whitespace-pre-wrap text-sm leading-relaxed" data-lingo-skip>
                              {buildHighlightedSnippet(
                                activeCitation?.content ?? "",
                                quote
                              )}
                            </pre>
                          </div>
                        ))
                      ) : (
                        <pre className="whitespace-pre-wrap text-sm leading-relaxed" data-lingo-skip>
                          {buildHighlightedSnippet(activeCitation?.content ?? "")}
                        </pre>
                      )}
                    </ScrollShadow>
                  ) : rawData ? (
                    <div className="space-y-3 text-sm leading-relaxed">
                      <p data-lingo-skip>
                        Text preview isn’t available for this document. Open the
                        original file to review the source context.
                      </p>
                      <Button
                        color="primary"
                        onPress={() => {
                          if (!dataUrl) return;
                          if (typeof window !== "undefined") {
                            window.open(dataUrl, "_blank", "noopener,noreferrer");
                          }
                        }}
                        data-lingo-skip
                      >
                        Open original file
                      </Button>
                    </div>
                  ) : rawError ? (
                    <div className="space-y-3 text-sm text-warning" data-lingo-skip>
                      Unable to retrieve the original file: {rawError}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground" data-lingo-skip>
                      No preview available for this file.
                    </p>
                  )}
                </ModalBody>
                <ModalFooter>
                  <Button
                    variant="light"
                    onPress={() => {
                      setActiveCitation(null);
                      onClose();
                    }}
                  >
                    Close
                  </Button>
                </ModalFooter>
              </>
            );
          }}
        </ModalContent>
      </Modal>
    </>
  );
}

export default ChatbotDrawer;
