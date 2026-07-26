import express from "express";

import { askQuestion, getChatHistory, clearChat } from "../controllers/chat-controller.js";

const router = express.Router();

router.post("/", askQuestion);
router.get("/:notebookId", getChatHistory);
router.delete("/:notebookId", clearChat);

export default router;