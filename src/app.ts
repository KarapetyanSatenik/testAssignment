import express from "express";
import dotenv from "dotenv";
import ingest from "./routes/ingest.ts";
import ask from "./routes/ask.ts";
import health from "./routes/health.ts";
import { requestId, logger } from "./lib/logger.ts";
import { LocalEmbeddings } from "./lib/embeddings/LocalEmbeddings.ts";
import { VectorStore } from "./lib/store/vector-store.ts";
import { MockLLM } from "./lib/llm/MockLLM.ts";
import { OpenAILLM } from "./lib/llm/OpenAILLM.ts";

dotenv.config();

export function makeApp() {
  const app = express();
  app.use(express.json());
  app.use(requestId);
  app.use(logger);

  const embeddings = new LocalEmbeddings("Xenova/all-MiniLM-L6-v2"); 
  const store = new VectorStore(embeddings.model, embeddings.dim());
  store.load();
  const llm =
    process.env.OPENAI_API_KEY ? new OpenAILLM(process.env.OPENAI_API_KEY) : new MockLLM();

  app.locals.embeddings = embeddings;
  app.locals.store = store;
  app.locals.llm = llm;

  app.use("/ingest", ingest);
  app.use("/ask", ask);
  app.use("/health", health);

  app.use((err: any, _req: any, res: any, _next: any) => {
    console.error(err);
    res.status(400).tson({ error: err?.message || "Bad Request" });
  });

  return app;
}
