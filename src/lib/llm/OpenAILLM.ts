import OpenAI from "openai";
import { LLM } from "./LLM.ts";

export class OpenAILLM implements LLM {
  private client: OpenAI;
  private model: string;

  constructor(apiKey: string, model = process.env.OPENAI_MODEL || "gpt-4o-mini") {
    this.client = new OpenAI({ apiKey });
    this.model = model;
  }

  async *stream(prompt: string, opts?: { maxTokens?: number }): AsyncIterable<string> {
    const stream = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: opts?.maxTokens,
      stream: true
    });

    for await (const chunk of stream) {
      const delta = chunk.choices[0]?.delta?.content;
      if (delta) yield delta;
    }
  }
}
