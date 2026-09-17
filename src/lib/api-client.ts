/** Browser-side fetch helper: JSON in/out, friendly error text, no retries. */
export class ClientApiError extends Error {
  constructor(message: string, readonly status: number, readonly code: string) {
    super(message);
    this.name = "ClientApiError";
  }
}

export async function postJson<T>(url: string, body: unknown, fallbackMessage: string, networkMessage: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
  } catch {
    throw new ClientApiError(networkMessage, 0, "network");
  }
  const data = (await res.json().catch(() => ({}))) as { error?: string; code?: string } & T;
  if (!res.ok) throw new ClientApiError(data.error || fallbackMessage, res.status, data.code || "unknown");
  return data;
}
