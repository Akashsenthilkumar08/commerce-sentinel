import { eventBus } from '@/lib/events';

// Opt out of caching
export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  let controller: ReadableStreamDefaultController;

  const stream = new ReadableStream({
    start(c) {
      controller = c;
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(':\n\n');
        } catch {
          clearInterval(heartbeat);
        }
      }, 30000); // 30s keep-alive
    },
    cancel() {
      // Handled by the listener cleanup below
    }
  });

  const response = new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no', // For Nginx
    },
  });

  const sendEvent = (eventData: any) => {
    try {
      if (controller) {
        controller.enqueue(`data: ${JSON.stringify(eventData)}\n\n`);
      }
    } catch (err) {
      // Client probably disconnected
      cleanup();
    }
  };

  const cleanup = () => {
    eventBus.off('sentinel-event', sendEvent);
  };

  // Listen to the global event bus
  eventBus.on('sentinel-event', sendEvent);

  // If connection closes, cleanup
  req.signal.addEventListener('abort', cleanup);

  return response;
}
