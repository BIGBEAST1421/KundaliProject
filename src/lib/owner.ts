import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import type { NextRequest, NextResponse } from "next/server";
import { env } from "./env";

/**
 * "Who created this report" without accounts: when a report is created, its UID plus an HMAC
 * of it goes into an httpOnly cookie on the creator's browser. Only that browser gets the
 * human-friendly name route (/rahul-sharma — trivially guessable, so it must not be public)
 * and the Ask chat; everyone else uses the unguessable /report/<uid> share link, view-only.
 *
 * The HMAC is keyed with the service-role secret (already server-only), so a viewer who knows
 * a share-link UID still can't forge ownership of it.
 */
const COOKIE = "astro_owned";
const MAX_ENTRIES = 30;
const ONE_YEAR = 60 * 60 * 24 * 365;

function sign(uid: string): string {
  return createHmac("sha256", env.SUPABASE_SERVICE_ROLE_KEY).update(`owner:${uid}`).digest("base64url").slice(0, 22);
}

/** Cookie value: "uid:sig|uid:sig|…", oldest first. */
function parse(raw: string | undefined): Map<string, string> {
  const entries = new Map<string, string>();
  for (const part of (raw ?? "").split("|")) {
    const [uid, sig] = part.split(":");
    if (uid && sig) entries.set(uid, sig);
  }
  return entries;
}

function verified(entries: Map<string, string>, uid: string): boolean {
  const sig = entries.get(uid);
  if (!sig) return false;
  const a = Buffer.from(sig);
  const b = Buffer.from(sign(uid));
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Whether the current request comes from the browser that created report `uid`. */
export async function isOwner(uid: string): Promise<boolean> {
  return verified(parse((await cookies()).get(COOKIE)?.value), uid);
}

/** Adds report `uid` to the creator's ownership cookie, keeping the newest MAX_ENTRIES. */
export function grantOwnership(req: NextRequest, res: NextResponse, uid: string): void {
  const entries = parse(req.cookies.get(COOKIE)?.value);
  entries.delete(uid);
  entries.set(uid, sign(uid));
  const kept = [...entries].slice(-MAX_ENTRIES);
  res.cookies.set(COOKIE, kept.map(([u, s]) => `${u}:${s}`).join("|"), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: ONE_YEAR,
    path: "/",
  });
}
