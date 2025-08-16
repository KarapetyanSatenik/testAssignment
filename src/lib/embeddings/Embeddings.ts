export interface Embeddings {
  readonly model: string;
  dim(): number;
  embed(texts: string[]): Promise<number[][]>;
}
