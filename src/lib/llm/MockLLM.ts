import { LLM } from "./LLM.ts";

export class MockLLM implements LLM {
  async *stream(prompt: string, opts?: { maxTokens?: number }): AsyncIterable<string> {
    const text = `Mock answer based on context:\n${prompt.slice(0, 400)}`;
    const tokens = text.split(/\s+/);
    const max = opts?.maxTokens ?? tokens.length;
    for (let i = 0; i < Math.min(max, tokens.length); i++) {
      await new Promise((r) => setTimeout(r, 10));
      yield tokens[i] + (i + 1 < tokens.length ? " " : "");
    }
  }
}
