"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingText]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    setStreamingText("");

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No reader");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);
            if (data === "[DONE]") continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                accumulated += parsed.text;
                setStreamingText(accumulated);
              }
              if (parsed.error) {
                accumulated += `\n\nError: ${parsed.error}`;
                setStreamingText(accumulated);
              }
            } catch {
              /* skip malformed chunks */
            }
          }
        }
      }

      setMessages([
        ...newMessages,
        { role: "assistant", content: accumulated },
      ]);
      setStreamingText("");
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, something went wrong. Please try again.",
        },
      ]);
      setStreamingText("");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !streamingText && (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
            <div className="text-6xl mb-4">🧬</div>
            <h2 className="text-xl font-semibold text-gray-700">
              Welcome to UBC Biochemistry
            </h2>
            <p className="mt-2 max-w-md text-gray-500">
              Ask me anything about biochemistry topics covered by our department
              instructors.
            </p>
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {[
                "What topics are covered by the department?",
                "Tell me about cell biochemistry",
                "What does our instructor say about protein folding?",
                "Help me understand enzyme kinetics",
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setInput(suggestion)}
                  className="text-left text-sm px-4 py-3 rounded-xl border border-gray-200 hover:border-[#002145] hover:bg-blue-50 transition-colors text-gray-600"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-full bg-[#002145] flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
                UBC
              </div>
            )}
            <div
              className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                msg.role === "user"
                  ? "bg-[#002145] text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {streamingText && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#002145] flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
              UBC
            </div>
            <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-gray-100 text-gray-800">
              <div className="whitespace-pre-wrap text-sm leading-relaxed">
                {streamingText}
              </div>
            </div>
          </div>
        )}
        {loading && !streamingText && (
          <div className="flex justify-start">
            <div className="w-8 h-8 rounded-full bg-[#002145] flex items-center justify-center text-white text-xs font-bold mr-2 mt-1 shrink-0">
              UBC
            </div>
            <div className="bg-gray-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-1.5">
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "0ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "150ms" }}
                />
                <div
                  className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                  style={{ animationDelay: "300ms" }}
                />
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a biochemistry question..."
            className="flex-1 rounded-full border border-gray-300 px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#002145] focus:border-transparent"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="rounded-full bg-[#002145] text-white px-6 py-3 text-sm font-medium hover:bg-[#003366] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
