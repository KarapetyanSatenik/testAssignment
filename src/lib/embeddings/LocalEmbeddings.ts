import { pipeline } from "@xenova/transformers";
import { Embeddings } from "./Embeddings.ts";
import { normalize } from "../text/similarity.ts";

export class LocalEmbeddings implements Embeddings {
  private extractorPromise: Promise<any>;
  public readonly model: string;

  constructor(model = "Xenova/all-MiniLM-L6-v2-onnx") { 
    this.model = model;
    this.extractorPromise = pipeline("feature-extraction", model);
  }

  dim(): number {
    return 384;
  }

  async embed(texts: string[]): Promise<number[][]> {
    const extractor = await this.extractorPromise;
    const out: number[][] = [];
    for (const t of texts) {
      const res = await extractor(t, { pooling: "mean", normalize: false });
      const vec = Array.from(res.data as Float32Array);
      out.push(normalize(vec));
    }
    return out;
  }
}
