import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { ResponseFormatTextConfig } from "openai/resources/responses/responses.mjs";
import { createReadableStreamResponsesAPI } from "@/lib/create-readable-stream";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const weatherSchema = z.object({
	name: z.string().describe("Name of the city"),
	description: z.string().describe("Description of the city"),
	temperature: z.number().describe("Temperature in Celsius"),
	humidity: z.number().describe("Humidity in percentage"),
	windSpeed: z.number().describe("Wind speed in meters per second"),
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
					...zodResponseFormat(weatherSchema, "weather_response").json_schema,
				} as ResponseFormatTextConfig,
			},
			input: prompt || "What is the weather like in Dhaka?",
		});

		// Reuse the extracted chunking function
		const responseStream = createReadableStreamResponsesAPI(stream);

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
