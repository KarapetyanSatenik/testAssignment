export interface IngestItem {
  id: string;
  text: string;
  metadata?: Record<string, unknown>;
}

export interface StoredChunk {
  id: string;
  originalId: string;
  text: string;
  metadata?: Record<string, unknown>;
  vector: number[];
}

export interface AskRequestBody {
  query: string;
  topK?: number;
  maxTokens?: number;
}
