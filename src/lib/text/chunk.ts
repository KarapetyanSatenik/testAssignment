import { TiktokenModel, encodingForModel } from "js-tiktoken";

export interface ChunkOpts {
  maxTokens: number;
  overlap: number;
  model?: TiktokenModel;
}

export function chunkText(text: string, opts: ChunkOpts): string[] {
  const { maxTokens, overlap, model = "gpt-3.5-turbo" } = opts;
  const enc = encodingForModel(model);
  const tokens = enc.encode(text);

  if (tokens.length <= maxTokens) {
    return [text];
  }

  const chunks: string[] = [];
  let start = 0;

  while (start < tokens.length) {
    const end = Math.min(start + maxTokens, tokens.length);
    const slice = tokens.slice(start, end);
    chunks.push(enc.decode(slice));

    if (end === tokens.length) break;
    start = end - overlap; 
    if (start < 0) start = 0;
  }

  return chunks;
}
