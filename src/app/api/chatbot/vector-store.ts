import { createClient as createSupabaseClient } from "$/lib/supabase/server";

const DEFAULT_VECTOR_STORE_ID_INTERNAL =
  process.env.OPENAI_VECTOR_STORE_ID ?? "vs_68d2847cfda88191bd90b7d7ec6c28f9";

let mappingVectorColumnAvailable: boolean | null = null;
let tenderVectorDbColumnAvailable: boolean | null = null;

function readEnvValue(name: string): string | null {
  const value = typeof name === "string" ? process.env[name] : undefined;
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function normalizeEnvKey(candidate: string) {
  return candidate
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .toUpperCase();
}

function extractVectorStoreId(descriptor: unknown): string | null {
  if (!descriptor) {
    return null;
  }

  if (typeof descriptor === "string") {
    const trimmed = descriptor.trim();
    if (!trimmed) {
      return null;
    }

    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        const result = extractVectorStoreId(parsed);
        if (result) {
          return result;
        }
      } catch {
        // ignore JSON parse errors and continue
      }
    }

    if (/^vs_[A-Za-z0-9]+/.test(trimmed)) {
      return trimmed;
    }

    if (trimmed.includes(":")) {
      const [, maybeValue] = trimmed.split(":", 2);
      const result = extractVectorStoreId(maybeValue);
      if (result) {
        return result;
      }
    }

    const directEnv = readEnvValue(trimmed);
    if (directEnv) {
      return directEnv;
    }

    const normalized = normalizeEnvKey(trimmed);
    const envCandidates = [
      trimmed.toUpperCase(),
      normalized,
      `VECTOR_STORE_ID_${normalized}`,
      `OPENAI_VECTOR_STORE_ID_${normalized}`,
    ];

    for (const candidate of envCandidates) {
      const value = readEnvValue(candidate);
      if (value) {
        return value;
      }
    }

    return null;
  }

  if (Array.isArray(descriptor)) {
    for (const entry of descriptor) {
      const result = extractVectorStoreId(entry);
      if (result) {
        return result;
      }
    }
    return null;
  }

  if (typeof descriptor === "object") {
    const record = descriptor as Record<string, unknown>;
    const primaryKeys = [
      "vector_store_id",
      "vectorStoreId",
      "store_id",
      "storeId",
      "external_id",
      "externalId",
      "id",
      "value",
    ];

    for (const key of primaryKeys) {
      if (key in record) {
        const result = extractVectorStoreId(record[key]);
        if (result) {
          return result;
        }
      }
    }

    const pointerKeys = ["env", "key", "name", "provider", "database", "db"];
    for (const key of pointerKeys) {
      if (key in record) {
        const result = extractVectorStoreId(record[key]);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}

export async function resolveVectorStoreId(mappingId: string) {
  try {
    const supabase = await createSupabaseClient();

    let canPersistVectorStoreId = mappingVectorColumnAvailable !== false;
    const mappingSelect =
      mappingVectorColumnAvailable === false ? "tender_id" : "tender_id, vector_store_id";

    const { data: mapping, error: mappingError } = await supabase
      .from("companies_tenders_mappings")
      .select(mappingSelect)
      .eq("id", mappingId)
      .maybeSingle();

    let mappingRecord: { tender_id?: string | null; vector_store_id?: string | null } | null =
      mapping ?? null;

    const vectorColumnMissing =
      typeof mappingError?.message === "string" &&
      mappingError.message.includes("column companies_tenders_mappings.vector_store_id does not exist");

    if (mappingError && !vectorColumnMissing) {
      console.log("[chatbot API] mapping lookup error", {
        mappingId,
        error: mappingError.message,
      });
    }

    if (vectorColumnMissing) {
      mappingVectorColumnAvailable = false;
      canPersistVectorStoreId = false;

      const { data: fallbackMapping, error: fallbackError } = await supabase
        .from("companies_tenders_mappings")
        .select("tender_id")
        .eq("id", mappingId)
        .maybeSingle();

      if (fallbackError) {
        console.log("[chatbot API] mapping lookup error", {
          mappingId,
          error: fallbackError.message,
        });
      }

      mappingRecord = fallbackMapping ?? null;
    } else if (!mappingError && mappingVectorColumnAvailable !== false) {
      mappingVectorColumnAvailable = true;
    }

    const existing = mappingRecord?.vector_store_id?.trim();
    if (existing) {
      return existing;
    }

    const tenderId = mappingRecord?.tender_id;
    if (!tenderId) {
      console.log("[chatbot API] mapping missing tender", { mappingId });
      return DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
    }

    const tenderSelect =
      tenderVectorDbColumnAvailable === false ? "vector_store_id" : "vector_db, vector_store_id";

    const { data: tender, error: tenderError } = await supabase
      .from("tenders")
      .select(tenderSelect)
      .eq("id", tenderId)
      .maybeSingle();

    let tenderRecord: { vector_db?: unknown; vector_store_id?: string | null } | null = tender ?? null;

    const tenderVectorDbMissing =
      typeof tenderError?.message === "string" &&
      tenderError.message.includes("column tenders.vector_db does not exist");

    if (tenderError && !tenderVectorDbMissing) {
      console.log("[chatbot API] tender lookup error", {
        mappingId,
        tenderId,
        error: tenderError.message,
      });
    }

    if (tenderVectorDbMissing) {
      tenderVectorDbColumnAvailable = false;

      const { data: fallbackTender, error: fallbackTenderError } = await supabase
        .from("tenders")
        .select("vector_store_id")
        .eq("id", tenderId)
        .maybeSingle();

      if (fallbackTenderError) {
        console.log("[chatbot API] tender lookup error", {
          mappingId,
          tenderId,
          error: fallbackTenderError.message,
        });
      }

      tenderRecord = fallbackTender ?? null;
    } else if (!tenderError && tenderVectorDbColumnAvailable !== false) {
      tenderVectorDbColumnAvailable = true;
    }

    let resolvedVectorStoreId = extractVectorStoreId(tenderRecord?.vector_db);

    if (!resolvedVectorStoreId && typeof tenderRecord?.vector_store_id === "string") {
      const trimmed = tenderRecord.vector_store_id.trim();
      resolvedVectorStoreId = trimmed.length > 0 ? trimmed : null;
    }

    if (!resolvedVectorStoreId) {
      resolvedVectorStoreId = DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
    }

    if (resolvedVectorStoreId) {
      const trimmed = resolvedVectorStoreId.trim();

      if (canPersistVectorStoreId && (!existing || existing !== trimmed)) {
        const { error: updateError } = await supabase
          .from("companies_tenders_mappings")
          .update({ vector_store_id: trimmed })
          .eq("id", mappingId);

        if (updateError) {
          console.log("[chatbot API] failed to persist vector store on mapping", {
            mappingId,
            tenderId,
            error: updateError.message,
          });
        }
      }

      return trimmed;
    }

    return null;
  } catch (error) {
    console.log("[chatbot API] unexpected vector store resolution error", {
      mappingId,
      error: error instanceof Error ? error.message : String(error),
    });
    return DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
  }
}

export function getDefaultVectorStoreId() {
  return DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
}
