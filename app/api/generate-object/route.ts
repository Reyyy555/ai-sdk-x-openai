import { z } from "zod";
import { createReadableStreamResponsesAPI } from "@/lib/create-readable-stream";
import { createResponseStream } from "@/lib/create-response-stream";
import { NextResponse } from "next/server";

const weatherSchema = z.object({
	name: z.string().describe("Name of the city with country"),
	description: z.string().describe("Description of weather condition"),
	temperature: z.number().describe("Temperature in Celsius"),
	humidity: z.number().describe("Humidity in percentage"),
	windSpeed: z.number().describe("Wind speed in meters per second"),
});

export async function POST(req: Request) {
	try {
		const { prompt } = await req.json();

		const stream = await createResponseStream({
			input: prompt,
			schema: weatherSchema,
			schemaName: "weather_schema",
		});

		const responseStream = createReadableStreamResponsesAPI(stream);
		return new Response(responseStream);
	} catch (error) {
		return NextResponse.json({ message: "Something wrong" }, { status: 403 });
	}
}
