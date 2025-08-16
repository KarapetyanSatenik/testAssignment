import { Router } from "express";
import { z } from "zod";
import { Embeddings } from "../lib/embeddings/Embeddings.ts";
import { VectorStore } from "../lib/store/vector-store.ts";
import { rankByCosine } from "../lib/text/similarity.ts";
import { initSSE } from "../lib/text/sse.ts";
import { LLM } from "../lib/llm/LLM.ts";

const schema = z.object({
  query: z.string().min(1),
  topK: z.number().int().min(1).max(20).optional().default(5),
  maxTokens: z.number().int().min(10).max(500).optional().default(200)
});

const router = Router();

router.post("/", async (req, res, next) => {
  try {
    const { query, topK, maxTokens } = schema.parse(req.body);
    const { embeddings, store, llm } = req.app.locals as {
      embeddings: Embeddings;
      store: VectorStore;
      llm: LLM;
    };

    const vec = (await embeddings.embed([query]))[0];
    const ranked = rankByCosine(vec, store.all(), topK);

    const context = ranked
      .map((r, i) => `#${i + 1} id=${r.originalId} (score=${r.score.toFixed(3)}):\n${r.text}`)
      .join("\n\n");

    const prompt = `You are a helpful assistant. Use the following context to answer the user's question. If unknown, say so briefly.\n\nCONTEXT:\n${context}\n\nQUESTION: ${query}\n\nANSWER:`;

    const sse = initSSE(res);
    for await (const token of llm.stream(prompt, { maxTokens })) {
      sse.send({ type: "token", text: token });
    }
    sse.send({
      type: "final",
      citations: ranked.map((r) => ({ id: r.originalId, score: r.score }))
    });
    sse.close();
  } catch (err) {
    next(err);
  }
});

export default router;
