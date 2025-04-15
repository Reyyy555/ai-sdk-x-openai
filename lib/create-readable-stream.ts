import type OpenAI from "openai";
import type { Stream } from "openai/streaming";

export type OpenAiResponsesStream =
	Stream<OpenAI.Responses.ResponseStreamEvent> & {
		_request_id?: string | null;
	};

export function createReadableStreamResponsesAPI(
	stream: OpenAiResponsesStream,
): ReadableStream<Uint8Array> {
	return new ReadableStream({
		async start(controller) {
			try {
				for await (const event of stream) {
					if (
						event.type === "response.output_text.delta" ||
						event.type === "response.refusal.delta"
					) {
						const chunk = event.delta;
						if (chunk) {
							controller.enqueue(new TextEncoder().encode(chunk));
						}
					} else if (event.type === "response.failed") {
						const errorMsg = `\nError: ${event.response?.error}`;
						controller.enqueue(new TextEncoder().encode(errorMsg));
					} else if (event.type === "response.completed") {
						controller.close();
					}
				}
			} catch (err) {
				controller.error(err);
			}
		},
	});
}
