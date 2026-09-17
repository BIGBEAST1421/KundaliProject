import { NextResponse, type NextRequest } from "next/server";
import { searchCities } from "@/src/lib/cities";

export function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return NextResponse.json({ results: searchCities(q) });
}
