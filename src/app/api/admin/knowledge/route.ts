import { NextResponse } from "next/server";
import { isAuthenticated } from "@/lib/auth";
import {
  getKnowledgeEntries,
  saveKnowledgeEntries,
  KnowledgeEntry,
} from "@/lib/store";

export async function GET() {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const entries = await getKnowledgeEntries();
  return NextResponse.json(entries);
}

export async function POST(request: Request) {
  if (!(await isAuthenticated())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { instructorName, title, content } = await request.json();

  if (!instructorName || !title || !content) {
    return NextResponse.json(
      { error: "Missing required fields" },
      { status: 400 }
    );
  }

  const entries = await getKnowledgeEntries();
  const newEntry: KnowledgeEntry = {
    id: crypto.randomUUID(),
    instructorName,
    title,
    content,
    createdAt: new Date().toISOString(),
  };

  entries.push(newEntry);
  await saveKnowledgeEntries(entries);

  return NextResponse.json(newEntry, { status: 201 });
}
