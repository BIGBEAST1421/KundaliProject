/**
 * Normalise AI prose: replace em/en dashes with plain punctuation and tidy whitespace.
 * Applied to every string in the raw AI object before validation, so the rule holds even
 * when the model ignores the instruction.
 */
export function sanitizeText(s: string): string {
  return s
    .replace(/\s*[—–]\s*/g, ", ")     // "word — word" → "word, word"
    .replace(/,\s*,/g, ",")
    .replace(/,\s*([.!?])/g, "$1")   // ", ." → "."
    .replace(/\(\s*,\s*/g, "(")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function sanitizeDeep<T>(value: T): T {
  if (typeof value === "string") return sanitizeText(value) as T;
  if (Array.isArray(value)) return value.map(sanitizeDeep) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) out[k] = sanitizeDeep(v);
    return out as T;
  }
  return value;
}
