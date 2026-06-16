import { NextResponse } from "next/server";
import { getColleges } from "@/lib/data/colleges";

export const dynamic = "force-dynamic";

export async function GET() {
  const colleges = await getColleges();
  const basicInfo = colleges.map(c => ({ id: c.id, name: c.name }));
  return NextResponse.json({ data: basicInfo });
}
