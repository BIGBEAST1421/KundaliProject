import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest, NextResponse } from "next/server";

vi.mock("server-only", () => ({}));
let incoming = "";
vi.mock("next/headers", () => ({
  cookies: async () => ({ get: (name: string) => (name === "astro_owned" && incoming ? { value: incoming } : undefined) }),
}));

process.env.GEMINI_API_KEY = "test";
process.env.SUPABASE_URL = "https://example.supabase.co";
process.env.SUPABASE_SERVICE_ROLE_KEY = "test-secret";

const { grantOwnership, isOwner } = await import("../owner");

const A = "0b8f6a52-1c3e-4d7a-9f10-2a3b4c5d6e7f";
const B = "1c9f7b63-2d4f-4e8b-8a21-3b4c5d6e7f80";

/** Runs grantOwnership against a request carrying `cookie`, returns the cookie it sets. */
function grant(uid: string, cookie = ""): string {
  const req = new NextRequest("http://localhost/api/reports", { headers: cookie ? { cookie: `astro_owned=${cookie}` } : {} });
  const res = NextResponse.json({});
  grantOwnership(req, res, uid);
  return res.cookies.get("astro_owned")!.value;
}

describe("report ownership cookie", () => {
  beforeEach(() => { incoming = ""; });

  it("recognises the creator", async () => {
    incoming = grant(A);
    expect(await isOwner(A)).toBe(true);
  });

  it("rejects visitors without the cookie", async () => {
    expect(await isOwner(A)).toBe(false);
  });

  it("rejects a forged signature", async () => {
    incoming = `${A}:AAAAAAAAAAAAAAAAAAAAAA`;
    expect(await isOwner(A)).toBe(false);
  });

  it("doesn't let one report's signature unlock another", async () => {
    const sig = grant(A).split(":")[1];
    incoming = `${B}:${sig}`;
    expect(await isOwner(B)).toBe(false);
  });

  it("keeps earlier reports when adding one", async () => {
    incoming = grant(B, grant(A));
    expect(await isOwner(A)).toBe(true);
    expect(await isOwner(B)).toBe(true);
  });

  it("caps the number of remembered reports, dropping the oldest", async () => {
    let cookie = grant(A);
    for (let i = 0; i < 30; i++) cookie = grant(`${String(i).padStart(8, "0")}-0000-4000-8000-000000000000`, cookie);
    incoming = cookie;
    expect(await isOwner(A)).toBe(false);
    expect(cookie.split("|")).toHaveLength(30);
  });
});
