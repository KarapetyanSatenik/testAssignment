import { Router } from "express";

const router = Router();

router.get("/", (req, res) => {
  const { store, embeddings } = req.app.locals as any;
  const info = store.info();
  res.json({ status: "ok", vectorCount: info.count, modelInfo: { embeddingsModel: embeddings.model, dim: info.dim } });
});

export default router;
