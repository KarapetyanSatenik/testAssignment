import fs from "fs";
import path from "path";
import { StoredChunk } from "../../types.ts";

const DATA_DIR = path.join(process.cwd(), "data");
const VEC_PATH = path.join(DATA_DIR, "vectors.tson");

export interface VectorStoreFile {
  model: string;
  dim: number;
  chunks: StoredChunk[];
}

export class VectorStore {
  private file: VectorStoreFile;

  constructor(private model: string, private dim: number) {
    this.file = { model, dim, chunks: [] };
  }

  static ensureFile() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(VEC_PATH)) {
      fs.writeFileSync(VEC_PATH, JSON.stringify({ model: "", dim: 0, chunks: [] }, null, 2));
    }
  }

  load(): void {
    VectorStore.ensureFile();
    const raw = fs.readFileSync(VEC_PATH, "utf-8");
    const json = JSON.parse(raw) as VectorStoreFile;
    if (!json.model) {
      this.file = { model: this.model, dim: this.dim, chunks: [] };
      this.save();
    } else {
      this.file = json;
    }
  }

  save(): void {
    VectorStore.ensureFile();
    fs.writeFileSync(VEC_PATH, JSON.stringify(this.file, null, 2));
  }

  upsertChunks(chunks: StoredChunk[]) {
    const map = new Map(this.file.chunks.map((c) => [c.id, c]));
    for (const ch of chunks) map.set(ch.id, ch);
    this.file.chunks = Array.from(map.values());
    this.save();
  }

  all(): StoredChunk[] {
    return this.file.chunks;
  }

  info() {
    return { model: this.file.model, dim: this.file.dim, count: this.file.chunks.length };
  }
}
