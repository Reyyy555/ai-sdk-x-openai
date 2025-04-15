import OpenAI from "openai"
import { zodFunction, zodResponseFormat } from "openai/helpers/zod"
import { z } from "zod"

// Create an instance of the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define the schema for our structured data
const productSchema = z.object({
  name: z.string().describe("Name of the product"),
  description: z.string().describe("Description of the product"),
  price: z.number().describe("Price in USD"),
  features: z.array(z.string()).describe("List of product features"),
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()




    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a product generator. Generate a product based on the user description.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(productSchema, 'product_response'),

    })


    const message = response.choices[0]?.message;
    if (message?.parsed) {
      console.log(message.parsed);
    }
    else {

      console.log(message.refusal);

    }



    // Return the data in a format compatible with AI SDK's useObject
    return Response.json(message.parsed)
  } catch (error) {
    console.error("Error generating product:", error)
    return Response.json({ error: "Failed to generate product" }, { status: 500 })
  }
}

