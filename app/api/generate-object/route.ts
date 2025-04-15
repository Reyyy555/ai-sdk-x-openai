import { NextResponse } from "next/server"
import OpenAI from "openai"
import { z } from "zod"

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Define your schema
const notificationSchema = z.object({
  notifications: z.array(
    z.object({
      name: z.string().describe("Name of a fictional person."),
      message: z.string().describe("Do not use emojis or links."),
      minutesAgo: z.number(),
    }),
  ),
})

export async function POST(req: Request) {
  try {
    const { prompt } = await req.json()

    // Create a system message that describes the schema
    const systemMessage = `You generate structured data according to this schema:
    {
      "notifications": [
        {
          "name": "string (Name of a fictional person)",
          "message": "string (Do not use emojis or links)",
          "minutesAgo": number
        }
      ]
    }
    
    Return ONLY valid JSON that matches this schema exactly.`

    // Make the API call to OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    })

    // Parse the response
    const responseText = completion.choices[0].message.content
    if (!responseText) {
      throw new Error("No response from OpenAI")
    }

    // Parse and validate the JSON
    const parsedData = JSON.parse(responseText)
    const validatedData = notificationSchema.parse(parsedData)

    // Format the response to be compatible with useObject
    return NextResponse.json(validatedData)
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Failed to generate object" }, { status: 500 })
  }
}
