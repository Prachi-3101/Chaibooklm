import express from "express";
import cors from "cors";
import notebookRoutes from "./routes/notebook-routes.js";
import sourceRoutes from "./routes/source-routes.js";
import chatRoutes from "./routes/chat-routes.js";

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL
}));
app.use(express.json());

app.use("/api/notebooks", notebookRoutes);
app.use("/api/source",sourceRoutes);
app.use("/api/chat",chatRoutes);

app.get("/", (req, res) => {
  res.send("Chaibooklm Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;