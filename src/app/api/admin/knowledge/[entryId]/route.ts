import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import { getKnowledgeEntries, saveKnowledgeEntries } from "@/lib/store";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = await params;
  const { instructorName, title, content } = await request.json();
  const entries = await getKnowledgeEntries();
  const index = entries.findIndex((e) => e.id === entryId);

  if (index === -1) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  entries[index] = { ...entries[index], instructorName, title, content };
  await saveKnowledgeEntries(entries);

  return NextResponse.json(entries[index]);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ entryId: string }> }
) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { entryId } = await params;
  const entries = await getKnowledgeEntries();
  const filtered = entries.filter((e) => e.id !== entryId);

  if (filtered.length === entries.length) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await saveKnowledgeEntries(filtered);
  return NextResponse.json({ success: true });
}
