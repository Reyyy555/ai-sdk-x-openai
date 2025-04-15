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

		const response = await openai.responses.parse({
			model: "gpt-4o",
			tools: [{ type: "web_search_preview" }],
			text: {
				format: {
					type: "json_schema",
					...zodResponseFormat(productSchema, "product_response").json_schema,
				} as ResponseFormatTextConfig,
			},
			input: [
				{
					role: "system",
					content:
						"You are a product generator. Generate a product based on the user description.",
				},
				{
					role: "user",
					content: prompt,
				},
			],
		});

		const message = response.output_parsed;
		if (message) {
			console.log(message);
		} else {
			console.log(message);
		}

		return Response.json(message);
	} catch (error) {
		console.error("Error generating product:", error);
		return Response.json(
			{ error: "Failed to generate product" },
			{ status: 500 },
		);
	}
}
