"use client"

import type React from "react"

import { useState } from "react"
import { useObject } from "@ai-sdk/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [prompt, setPrompt] = useState("Messages during finals week.")

  // Use the useObject hook with a custom API endpoint
  const { object, isLoading, error, submitObject } = useObject({
    api: "/api/generate-object",
    id: "notifications-generator",
  })

  const notifications = object?.notifications || []

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    submitObject({ prompt })
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="w-full max-w-xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Notification Generator</h1>

        <form onSubmit={handleSubmit} className="mb-8 space-y-4">
          <div className="space-y-2">
            <label htmlFor="prompt" className="text-sm font-medium">
              Prompt
            </label>
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe the notifications you want to generate..."
              className="w-full"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Generating..." : "Generate Notifications"}
          </Button>
        </form>

        {error && <div className="text-red-500 mb-4">Error: {error.message || "Something went wrong"}</div>}

        <div className="space-y-4">
          {notifications.map((notification, index) => (
            <Card key={index}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between">
                  <span>{notification.name}</span>
                  <span className="text-sm text-gray-500">{notification.minutesAgo}m ago</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p>{notification.message}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {notifications.length === 0 && !isLoading && (
          <div className="text-center text-gray-500 mt-8">
            No notifications generated yet. Submit a prompt to get started.
          </div>
        )}
      </div>
    </main>
  )
}
