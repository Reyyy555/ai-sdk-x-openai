import OpenAI from "openai"
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

    // Convert the zod schema to OpenAI function definition
    const functionDefinition = {
      name: "generate_product",
      description: "Generate a product based on the description",
      parameters: {
        type: "object",
        properties: {
          name: {
            type: "string",
            description: "Name of the product",
          },
          description: {
            type: "string",
            description: "Description of the product",
          },
          price: {
            type: "number",
            description: "Price in USD",
          },
          features: {
            type: "array",
            items: {
              type: "string",
            },
            description: "List of product features",
          },
        },
        required: ["name", "description", "price", "features"],
      },
    }

    // Call OpenAI with function calling
    const response = await openai.chat.completions.create({
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
      functions: [functionDefinition],
      function_call: { name: "generate_product" },
    })

    // Extract the function call arguments
    const functionCall = response.choices[0].message.function_call

    if (!functionCall || !functionCall.arguments) {
      throw new Error("No function call arguments returned")
    }

    // Parse the function call arguments
    const productData = JSON.parse(functionCall.arguments)

    // Validate the data against our schema
    const validatedProduct = productSchema.parse(productData)

    // Return the data in a format compatible with AI SDK's useObject
    return Response.json({
      object: validatedProduct,
      completion: response.id,
    })
  } catch (error) {
    console.error("Error generating product:", error)
    return Response.json({ error: "Failed to generate product" }, { status: 500 })
  }
}
