import Anthropic from "@anthropic-ai/sdk";
import { getKnowledgeEntries } from "@/lib/store";
import { getSettings } from "@/lib/store";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_KEY,
});

export async function POST(request: Request) {
  const { messages } = await request.json();

  const [entries, settings] = await Promise.all([
    getKnowledgeEntries(),
    getSettings(),
  ]);

  let systemPrompt = `You are the UBC Biology Department AI Assistant. You help students and visitors find information about biology topics based on knowledge provided by department instructors.\n\n`;

  if (entries.length > 0) {
    systemPrompt += `## Instructor Knowledge Base\n\nThe following knowledge has been provided by department instructors. When answering questions, reference this knowledge and attribute it to the instructor who provided it (e.g., "According to [Instructor Name], ...").\n\n`;
    for (const entry of entries) {
      systemPrompt += `### ${entry.title} (by ${entry.instructorName})\n${entry.content}\n\n`;
    }
  }

  if (settings.useGeneralKnowledge) {
    systemPrompt += `\n## Instructions\n- First, check if the instructor knowledge base contains relevant information. If it does, use it and attribute it to the instructor.\n- If the knowledge base doesn't cover the topic, you may use your general biology knowledge to help the student, but clearly note that this comes from general knowledge and not from a specific department instructor.\n- Always be helpful and educational in your responses.\n- When citing instructor knowledge, say "According to [Name]..." or "[Name] notes that..."`;
  } else {
    systemPrompt += `\n## Instructions\n- ONLY answer questions using the instructor knowledge base above.\n- Always attribute information to the instructor who provided it.\n- If the knowledge base doesn't contain information relevant to the question, politely let the student know that this topic hasn't been covered by department instructors yet and suggest they reach out to the department directly.\n- Do NOT use your general knowledge to answer biology questions.`;
  }

  const encoder = new TextEncoder();

  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m: { role: string; content: string }) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const readableStream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ text: event.delta.text })}\n\n`
              )
            );
          }
        }
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unknown error";
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: message })}\n\n`
          )
        );
        controller.close();
      }
    },
  });

  return new Response(readableStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
