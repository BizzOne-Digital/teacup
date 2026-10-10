import { NextResponse } from "next/server";
import { getMenu } from "@/lib/menu";

export async function GET() {
  return NextResponse.json(getMenu());
}
