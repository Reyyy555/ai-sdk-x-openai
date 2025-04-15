"use client";

import type React from "react";

import { useState } from "react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { z } from "zod";

export default function Home() {
	const [prompt, setPrompt] = useState("What is weather like in Dhaka?");

	const { object, isLoading, error, submit } = useObject({
		schema: z.any(),
		api: "/api/generate-object",
	});
	console.info("⚡[page.tsx:16] object:", object);

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		submit({ prompt });
	};

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<div className="w-full max-w-xl mx-auto">
				<h1 className="text-3xl font-bold mb-8 text-center">Weather</h1>

				<form onSubmit={handleSubmit} className="mb-8 space-y-4">
					<div className="space-y-2">
						<label htmlFor="prompt" className="text-sm font-medium">
							Prompt
						</label>
						<Input
							id="prompt"
							value={prompt}
							onChange={(e) => setPrompt(e.target.value)}
							placeholder="Describe the weather you want to generate..."
							className="w-full"
						/>
					</div>
					<Button type="submit" className="w-full" disabled={isLoading}>
						{isLoading ? "Generating..." : "Get Weather"}
					</Button>
				</form>
				<pre>{object && (JSON.stringify(object, null, 2) as string)}</pre>
				{error && (
					<div className="text-red-500 mb-4">
						Error: {error.message || "Something went wrong"}
					</div>
				)}
			</div>
		</main>
	);
}
