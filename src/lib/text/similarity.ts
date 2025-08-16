export function normalize(v: number[]): number[] {
  const n = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / n);
}

export function cosine(a: number[], b: number[]): number {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export type Ranked<T> = T & { score: number };

export function rankByCosine<T extends { vector: number[] }>(
  query: number[],
  items: T[],
  topK: number
): Ranked<T>[] {
  const q = normalize(query);
  return items
    .map((it) => ({ ...it, score: cosine(q, it.vector) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}
