import { createClient as createSupabaseClient } from "$/lib/supabase/server";

const DEFAULT_VECTOR_STORE_ID_INTERNAL =
  process.env.OPENAI_VECTOR_STORE_ID ?? "vs_68d2847cfda88191bd90b7d7ec6c28f9";

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

    const { data: mapping, error: mappingError } = await supabase
      .from("companies_tenders_mappings")
      .select("tender_id, vector_store_id")
      .eq("id", mappingId)
      .maybeSingle();

    if (mappingError) {
      console.log("[chatbot API] mapping lookup error", {
        mappingId,
        error: mappingError.message,
      });
    }

    const existing = mapping?.vector_store_id?.trim();
    if (existing) {
      return existing;
    }

    const tenderId = mapping?.tender_id;
    if (!tenderId) {
      console.log("[chatbot API] mapping missing tender", { mappingId });
      return DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
    }

    const { data: tender, error: tenderError } = await supabase
      .from("tenders")
      .select("vector_db, vector_store_id")
      .eq("id", tenderId)
      .maybeSingle();

    if (tenderError) {
      console.log("[chatbot API] tender lookup error", {
        mappingId,
        tenderId,
        error: tenderError.message,
      });
    }

    let resolvedVectorStoreId = extractVectorStoreId(tender?.vector_db);

    if (!resolvedVectorStoreId && typeof tender?.vector_store_id === "string") {
      const trimmed = tender.vector_store_id.trim();
      resolvedVectorStoreId = trimmed.length > 0 ? trimmed : null;
    }

    if (!resolvedVectorStoreId) {
      resolvedVectorStoreId = DEFAULT_VECTOR_STORE_ID_INTERNAL ?? null;
    }

    if (resolvedVectorStoreId) {
      const trimmed = resolvedVectorStoreId.trim();

      if (!existing || existing !== trimmed) {
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
