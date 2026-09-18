import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { computeChart } from "@/src/astro/chart";
import { geocode } from "@/src/lib/geocode";
import { errorResponse } from "@/src/lib/errors";

const Schema = z.object({
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  time: z.string().regex(/^(\d{2}:\d{2})?$/).default(""),
  city: z.string().trim().min(1),
  state: z.string().trim().default(""),
  country: z.string().trim().default("India"),
  lat: z.number().nullable().optional(),
  lon: z.number().nullable().optional(),
});

/** Chart-only preview for the form (no AI, nothing saved). */
export async function POST(req: NextRequest) {
  try {
    const i = Schema.parse(await req.json());
    const c = i.lat != null && i.lon != null ? { lat: i.lat, lon: i.lon } : await geocode(i.city, i.state, i.country);
    const chart = computeChart(i.dob, i.time, c.lat, c.lon);
    return NextResponse.json({
      lagna: chart.lagna, rashi: chart.rashi, sunSign: chart.sunSign, d1: chart.d1,
      nakshatra: chart.nakshatra.name, pada: chart.nakshatra.pada, mahadasha: chart.dasha.mahadasha,
    });
  } catch (err) {
    return errorResponse(err);
  }
}
