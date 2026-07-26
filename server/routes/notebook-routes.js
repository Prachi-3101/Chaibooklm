import express from "express";
const router = express.Router();
import { createNotebook,getNotebooks,deleteNotebook,getNotebookSources } from "../controllers/notebook-controller.js";

router.post("/", createNotebook);
router.get("/", getNotebooks);
router.get("/:id/sources", getNotebookSources);
router.delete("/:id", deleteNotebook);

export default router;