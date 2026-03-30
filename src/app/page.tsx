import ChatInterface from "@/components/ChatInterface";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-[#002145] text-white">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white/10 rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold">UBC</span>
            </div>
            <div>
              <h1 className="text-base font-semibold leading-tight">
                Biochemistry Department
              </h1>
              <p className="text-xs text-blue-200">
                AI Knowledge Assistant
              </p>
            </div>
          </div>
          <Link
            href="/admin"
            className="text-xs text-blue-200 hover:text-white transition-colors"
          >
            Admin
          </Link>
        </div>
      </header>

      {/* Chat */}
      <main className="flex-1 overflow-hidden bg-white">
        <ChatInterface />
      </main>
    </div>
  );
}
