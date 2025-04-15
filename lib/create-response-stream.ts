import OpenAI from "openai";
import type { AllOrNone, SelectivePartial } from "@sohanemon/utils";
import { zodResponseFormat } from "openai/helpers/zod";
import type { z } from "zod";
import type { ResponseFormatTextConfig } from "openai/src/resources/responses/responses.js";

type OpenAiRequest = OpenAI.Responses.ResponseCreateParamsNonStreaming;
type RequestBody = Omit<SelectivePartial<OpenAiRequest, "model">, "stream"> &
	AllOrNone<{
		schema: z.ZodObject<any>;
		schemaName: string;
	}>;
const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function createResponseStream({
	schema,
	schemaName,
	model = "gpt-4o",
	...body
}: RequestBody) {
	return openai.responses.create({
		model,
		stream: true,
		text: schema
			? {
					format: {
						type: "json_schema",
						...zodResponseFormat(schema, schemaName).json_schema,
					} as ResponseFormatTextConfig,
				}
			: undefined,
		...body,
	});
}
