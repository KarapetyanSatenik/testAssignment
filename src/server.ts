import { makeApp } from "./app.ts";

const port = Number(process.env.PORT || 3000);
const app = makeApp();
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
