import { NextResponse } from "next/server";
import { getLockState } from "@/lib/auth";

export async function GET() {
  return NextResponse.json(await getLockState());
}
