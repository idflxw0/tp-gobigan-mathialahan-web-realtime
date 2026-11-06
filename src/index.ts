import express from "express";
import path from "node:path";

const app = express();
const PORT = Number(process.env.PORT ?? 3000);

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
