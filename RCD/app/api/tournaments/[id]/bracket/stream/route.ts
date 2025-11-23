import { getDb } from "@/lib/db";
import { getBracket, subscribeBracketUpdates } from "@/lib/tournament-service";

function serializeBracket(bracket: unknown) {
  return `event: bracket\ndata: ${JSON.stringify(bracket)}\n\n`;
}

export async function GET(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const db = await getDb();
  const bracket = await getBracket(db, id);

  const stream = new ReadableStream({
    start(controller) {
      let active = true;
      const encoder = new TextEncoder();

      const safeEnqueue = (payload: string) => {
        if (!active) return;
        try {
          controller.enqueue(encoder.encode(payload));
        } catch {
          active = false;
          cleanup();
        }
      };

      const cleanup = () => {
        if (!active) return;
        active = false;
        if (unsubscribe) unsubscribe();
        if (interval) clearInterval(interval);
      };

      if (bracket) {
        safeEnqueue(serializeBracket(bracket));
      }

      const unsubscribe = subscribeBracketUpdates(id, (payload) => {
        safeEnqueue(serializeBracket(payload));
      });

      const interval = setInterval(() => {
        safeEnqueue(`: ping\n\n`);
      }, 15000);

      (controller as any).cleanup = cleanup;
    },
    cancel() {
      const cleanup = (this as any).cleanup;
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
