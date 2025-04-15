import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import type { ResponseFormatTextConfig } from "openai/src/resources/responses/responses.js";
import { z } from "zod";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const productSchema = z.object({
	name: z.string().describe("Name of the product"),
	description: z.string().describe("Description of the product"),
	price: z.number().describe("Price in USD"),
	features: z.array(z.string()).describe("List of product features"),
});

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();

		const stream = await openai.responses.create({
			model: "gpt-4o",
			tools: [{ type: "web_search_preview" }],
			stream: true,
			text: {
				format: {
					type: "json_schema",
					...zodResponseFormat(productSchema, "product_response").json_schema,
				} as ResponseFormatTextConfig,
			},
			input: prompt || "create a product",
		});

		const responseStream = new ReadableStream({
			async start(controller) {
				try {
					for await (const event of stream) {
						if (
							event.type === "response.output_text.delta" ||
							event.type === "response.refusal.delta"
						) {
							const chunk = event.delta;
							controller.enqueue(new TextEncoder().encode(chunk));
						} else if (event.type === "response.failed") {
							controller.enqueue(
								new TextEncoder().encode(`\nError: ${event.response.error}`),
							);
						} else if (event.type === "response.completed") {
							controller.close();
						}
					}
				} catch (err) {
					controller.error(err);
				}
			},
		});

		return new Response(responseStream);
	} catch (error) {
		console.error("Error generating product:", error);
		return new Response(
			JSON.stringify({ error: "Failed to generate product" }),
			{
				status: 500,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
