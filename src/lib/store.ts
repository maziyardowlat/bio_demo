import fs from "fs";
import path from "path";

export interface KnowledgeEntry {
  id: string;
  instructorName: string;
  title: string;
  content: string;
  createdAt: string;
}

export interface AppSettings {
  useGeneralKnowledge: boolean;
}

interface Store {
  knowledgeEntries: KnowledgeEntry[];
  appSettings: AppSettings;
}

const globalStore = globalThis as unknown as { __bioStore?: Store };

function loadSeedData(): KnowledgeEntry[] {
  try {
    const filePath = path.join(process.cwd(), "src/data/knowledge.json");
    const raw = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

if (!globalStore.__bioStore) {
  globalStore.__bioStore = {
    knowledgeEntries: loadSeedData(),
    appSettings: { useGeneralKnowledge: true },
  };
}

const store = globalStore.__bioStore;

export async function getKnowledgeEntries(): Promise<KnowledgeEntry[]> {
  return store.knowledgeEntries;
}

export async function saveKnowledgeEntries(
  entries: KnowledgeEntry[]
): Promise<void> {
  store.knowledgeEntries = entries;
}

export async function getSettings(): Promise<AppSettings> {
  return store.appSettings;
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  store.appSettings = settings;
}
