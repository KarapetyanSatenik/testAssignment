import { Router } from "express";
import { z } from "zod";
import { chunkText } from "../lib/text/chunk.ts";
import { Embeddings } from "../lib/embeddings/Embeddings.ts";
import { VectorStore } from "../lib/store/vector-store.ts";
import { StoredChunk } from "../types.ts";

const router = Router();

const ingestSchema = z.array(
  z.object({
    id: z.string().min(1),
    text: z.string().min(1),
    metadata: z.record(z.unknown()).optional()
  })
);

router.post("/", async (req, res, next) => {
  const start = Date.now();
  try {
    const parsed = ingestSchema.parse(req.body);
    const { embeddings, store } = req.app.locals as {
      embeddings: Embeddings;
      store: VectorStore;
    };

    let totalChunks = 0;
    const allChunks: StoredChunk[] = [];

    for (const item of parsed) {
      const chunks = chunkText(item.text, { maxTokens: 700, overlap: 100 });
      const vecs = await embeddings.embed(chunks);
      const docs: StoredChunk[] = chunks.map((c, i) => ({
        id: `${item.id}#chunk${i}`,
        originalId: item.id,
        text: c,
        metadata: item.metadata,
        vector: vecs[i]
      }));
      totalChunks += docs.length;
      allChunks.push(...docs);
    }

    store.upsertChunks(allChunks);
    const ms = Date.now() - start;
    res.json({ received: parsed.length, chunksSaved: totalChunks, ms });
  } catch (err) {
    next(err);
  }
});

export default router;
