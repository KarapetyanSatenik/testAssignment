export interface LLM {
  stream(prompt: string, opts?: { maxTokens?: number }): AsyncIterable<string>;
}
