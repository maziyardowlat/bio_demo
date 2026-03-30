import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getSettings, saveSettings } from "@/lib/store";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const settings = await getSettings();
  return NextResponse.json(settings);
}

export async function PUT(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await request.json();
  const settings = await getSettings();
  const updated = { ...settings, ...body };
  await saveSettings(updated);
  return NextResponse.json(updated);
}
